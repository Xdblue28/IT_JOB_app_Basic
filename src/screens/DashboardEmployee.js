import React from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    StatusBar, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLORS = {
    primary: '#8A000E',
    secondary: '#FF4D4D',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: '#FFFFFF',
    screenBg: '#F8FAFC',
};


const SimpleBarChart = () => {
    const data = [
        { label: 'M', value: 40 },
        { label: 'T', value: 70 },
        { label: 'W', value: 90 },
        { label: 'T', value: 60 },
        { label: 'F', value: 30 },
        { label: 'S', value: 100 },
        { label: 'S', value: 75 },
    ];

    return (
        <View style={styles.chartWrapper}>
            <View style={styles.barContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                        <View style={[styles.bar, { height: item.value }]} />
                        <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default function DashboardScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.row}>
                        <View style={styles.avatarPlaceholder} />
                        <Text style={styles.brandName}>PRECISION</Text>
                    </View>
                    <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.textSecondary} />
                </View>

                <Text style={styles.subTitle}>PERFORMANCE HUB</Text>
                <Text style={styles.mainTitle}>Dashboard</Text>

                {/* ACTIVE JOBS CARD */}
                <View style={styles.largeCard}>
                    <View>
                        <Text style={styles.cardLabel}>ACTIVE JOBS</Text>
                        <Text style={styles.largeValue}>24</Text>
                        <Text style={styles.trendUp}>+3 this week</Text>
                    </View>
                    <MaterialCommunityIcons name="briefcase-outline" size={60} color="#F1F5F9" />
                </View>

                {/* MINI CARDS */}
                <View style={styles.rowBetween}>
                    <View style={styles.miniCard}>
                        <Text style={styles.cardLabel}>CVS RECV.</Text>
                        <Text style={styles.miniValue}>142</Text>
                        <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.secondary} style={styles.miniIcon} />
                    </View>
                    <View style={styles.miniCard}>
                        <Text style={styles.cardLabel}>INTERVIEWS</Text>
                        <Text style={styles.miniValue}>18</Text>
                        <MaterialCommunityIcons name="calendar-outline" size={20} color={COLORS.secondary} style={styles.miniIcon} />
                    </View>
                </View>

                {/* CHART SECTION */}
                <View style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Application Trend</Text>
                    <SimpleBarChart />
                </View>

                {/* RECENT ACTIVITY */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Recent Activity</Text>
                {[1, 2].map((item) => (
                    <View key={item} style={styles.activityItem}>
                        <View style={styles.avatarPlaceholderSmall} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityName}>Sarah Jenkins</Text>
                            <Text style={styles.activityDesc}>Applied for <Text style={{ fontWeight: 'bold' }}>UI Designer</Text></Text>
                        </View>
                        <Text style={styles.timeText}>2m ago</Text>
                    </View>
                ))}
            </ScrollView>

            {/* FAB BUTTON */}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.screenBg, marginTop: '10%' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    avatarPlaceholder: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#CBD5E1', marginRight: 10 },
    brandName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 1 },
    subTitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 25 },
    mainTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.textPrimary },

    largeCard: {
        backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20
    },
    largeValue: { fontSize: 40, fontWeight: 'bold', color: COLORS.textPrimary },
    trendUp: { color: COLORS.secondary, fontSize: 12 },
    cardLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

    miniCard: { backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 15, width: '48%' },
    miniValue: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
    miniIcon: { alignSelf: 'flex-end', marginTop: -10 },

    chartCard: { backgroundColor: COLORS.cardBg, borderRadius: 15, padding: 20, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 15 },

    // CHART STYLES
    chartWrapper: { height: 120, justifyContent: 'flex-end', marginTop: 10 },
    barContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    barColumn: { alignItems: 'center' },
    bar: { width: 12, backgroundColor: COLORS.primary, borderRadius: 6 },
    barLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 8 },

    activityItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg,
        padding: 12, borderRadius: 12, marginBottom: 10
    },
    avatarPlaceholderSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 12 },
    activityName: { fontSize: 14, fontWeight: 'bold' },
    activityDesc: { fontSize: 12, color: COLORS.textSecondary },
    timeText: { fontSize: 10, color: COLORS.textSecondary },


});