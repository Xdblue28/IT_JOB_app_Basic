import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    StatusBar, TouchableOpacity, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLORS = {
    primary: '#8A000E',
    secondary: '#FF4D4D',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: '#FFFFFF',
    screenBg: '#F8FAFC',
};

// Biểu đồ hiển thị thống kê tổng quan (Đã tối ưu giữ lại làm biểu đồ so sánh)
const SimpleBarChart = ({ jobs, cvs, interviews }) => {
    // Tạo mảng dữ liệu động dựa trên kết quả đếm thực tế từ DB
    const data = [
        { label: 'JOBS', value: jobs > 0 ? Math.min(jobs * 4, 120) : 10, realValue: jobs },
        { label: 'CVS', value: cvs > 0 ? Math.min(cvs * 2, 120) : 10, realValue: cvs },
        { label: 'INTERVIEWS', value: interviews > 0 ? Math.min(interviews * 5, 120) : 10, realValue: interviews },
    ];

    return (
        <View style={styles.chartWrapper}>
            <View style={styles.barContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                        <Text style={styles.barValueText}>{item.realValue}</Text>
                        <View style={[styles.bar, { height: item.value }]} />
                        <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function DashboardScreen() {
    // Các State lưu trữ số đếm thực tế từ Database
    const [stats, setStats] = useState({
        activeJobs: 0,
        cvsReceived: 0,
        interviewsCount: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const rawCurrentUser = await AsyncStorage.getItem("session-user");
            if (!rawCurrentUser) return;
            const currentUser = JSON.parse(rawCurrentUser);


            const { data: companyData, error: companyError } = await supabase
                .from("COMPANIES")
                .select("id")
                .eq("user_id", currentUser.id)
                .single();

            if (companyError || !companyData) return;

            const companyId = companyData.id;


            const { count: jobsCount, error: jobsError } = await supabase
                .from("JOB_POSTINGS")
                .select("*", { count: "exact", head: true })
                .eq("company_id", companyId);


            const { count: cvsCount, error: cvsError } = await supabase
                .from("APPLICATIONS")
                .select("id, JOB_POSTINGS!inner(company_id)", { count: "exact", head: true })
                .eq("JOB_POSTINGS.company_id", companyId);


            const { count: interviewsCount, error: interviewsError } = await supabase
                .from("INTERVIEWS")
                .select("id, APPLICATIONS!inner(JOB_POSTINGS!inner(company_id))", { count: "exact", head: true })
                .eq("APPLICATIONS.JOB_POSTINGS.company_id", companyId);


            setStats({
                activeJobs: jobsCount || 0,
                cvsReceived: cvsCount || 0,
                interviewsCount: interviewsCount || 0
            });

        } catch (error) {
            console.error("Lỗi lấy dữ liệu thống kê Dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.row}>
                        <Text style={styles.brandName}>PRECISION</Text>
                    </View>
                    <TouchableOpacity onPress={fetchDashboardStats}>
                        <MaterialCommunityIcons
                            name={loading ? "loading" : "refresh"}
                            size={24}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subTitle}>PERFORMANCE HUB</Text>
                <Text style={styles.mainTitle}>Dashboard</Text>

                {/* Ô SỐ LƯỢNG JOB ĐÃ ĐĂNG TUYỂN */}
                <View style={styles.largeCard}>
                    <View>
                        <Text style={styles.cardLabel}>ACTIVE JOBS</Text>
                        <Text style={styles.largeValue}>{stats.activeJobs}</Text>
                        <Text style={styles.trendUp}>Tổng tin tuyển dụng</Text>
                    </View>
                    <MaterialCommunityIcons name="briefcase-outline" size={60} color="#F1F5F9" />
                </View>

                {/* MINI CARDS (CVs RECV & INTERVIEWS) */}
                <View style={styles.rowBetween}>
                    {/* Ô ĐẾM SỐ LƯỢNG CV ỨNG VIÊN NỘP */}
                    <View style={styles.miniCard}>
                        <Text style={styles.cardLabel}>CVS RECV.</Text>
                        <Text style={styles.miniValue}>{stats.cvsReceived}</Text>
                        <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.secondary} style={styles.miniIcon} />
                    </View>

                    {/* Ô ĐẾM SỐ LƯỢNG INTERVIEW ĐÃ ĐẶT LỊCH PHỎNG VẤN */}
                    <View style={styles.miniCard}>
                        <Text style={styles.cardLabel}>INTERVIEWS</Text>
                        <Text style={styles.miniValue}>{stats.interviewsCount}</Text>
                        <MaterialCommunityIcons name="calendar-outline" size={20} color={COLORS.secondary} style={styles.miniIcon} />
                    </View>
                </View>

                {/* CHART SECTION (Hiển thị biểu đồ so sánh trực quan) */}
                <View style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Recruitment Funnel</Text>
                    <SimpleBarChart
                        jobs={stats.activeJobs}
                        cvs={stats.cvsReceived}
                        interviews={stats.interviewsCount}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.screenBg, marginTop: '10%' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandName: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
    subTitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 25 },
    mainTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.textPrimary },

    largeCard: {
        backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20
    },
    largeValue: { fontSize: 40, fontWeight: 'bold', color: COLORS.textPrimary },
    trendUp: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
    cardLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

    miniCard: { backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 15, width: '48%' },
    miniValue: { fontSize: 24, fontWeight: 'bold', marginTop: 5, color: COLORS.textPrimary },
    miniIcon: { alignSelf: 'flex-end', marginTop: -10 },

    chartCard: { backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 20, marginTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 15 },

    // CHART STYLES
    chartWrapper: { height: 160, justifyContent: 'flex-end', marginTop: 10, paddingHorizontal: 20 },
    barContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
    barColumn: { alignItems: 'center', justifyContent: 'flex-end' },
    bar: { width: 30, backgroundColor: COLORS.primary, borderRadius: 6, marginVertical: 8 },
    barLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
    barValueText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textPrimary }
});