import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TextInput,
    TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';
import { Search, SlidersHorizontal, Bell, User } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import CreateJobDialog from '../modal/CreateJobDialog';
import JobDetailDialog from '../modal/JobDetailDialog';
import ApplicantsDialog from '../modal/ApplicantsDialog';
import CandidateDetailDialog from '../modal/CandidateDetailDialog';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
    primary: '#8A000E'
};

// COMPONENT CON (Đã cập nhật hiển thị số lượng đếm thực tế)
const JobCard = ({ item, onCardPress, onApplicantsPress }) => {
    const tags = item.expertise ? item.expertise.split(',').map(t => t.trim()) : [];

    // Lấy số lượng ứng viên thực tế từ dữ liệu quan hệ lồng của Supabase
    // Nếu không có ứng viên, mặc định hiển thị là 0
    const totalApplicants = item.APPLICATIONS ? item.APPLICATIONS.length : 0;

    return (
        <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={() => onCardPress(item)}>
            {item.badge && (
                <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{item.badge.toUpperCase()}</Text>
                </View>
            )}
            <Text style={styles.jobLevel}>
                {`${item.job_type || 'Full-time'} • ${item.working_model || 'Onsite'}`.toUpperCase()}
            </Text>

            <Text style={styles.jobTitle}>{item.title}</Text>

            {tags.length > 0 && (
                <View style={styles.tagContainer}>
                    {tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.footerLabel}>SALARY RANGE</Text>
                    <Text style={styles.footerValue}>{item.salary_range || 'Thỏa thuận'}</Text>
                </View>

                {/* NÚT XEM DANH SÁCH ỨNG VIÊN (Đã được map số liệu động và ID chính xác) */}
                <TouchableOpacity
                    style={styles.applicantButton}
                    onPress={(e) => {
                        e.stopPropagation(); // Ngăn chặn sự kiện lan ra thẻ cha
                        onApplicantsPress(item.id); // Truyền chính xác ID của công việc lên hàm xử lý
                    }}
                >
                    <User size={14} color="#4b5563" fill="#4b5563" />
                    <Text style={styles.applicantText}>
                        {totalApplicants} {totalApplicants <= 1 ? 'Applicant' : 'Applicants'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function JobManageScreen() {
    const [searchText, setSearchText] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [jobData, setJobData] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState(null);
    const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
    const [candidateDetailVisible, setCandidateDetailVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const reloadJobsData = () => {
        console.log("Đã kích hoạt làm mới danh sách bài đăng từ Supabase!");
        loadJobData();
    };

    // ĐÃ SỬA: Nâng cấp câu lệnh query lồng bảng APPLICATIONS
    const loadJobData = async () => {
        try {
            const rawCurrentUser = await AsyncStorage.getItem("session-user");
            if (!rawCurrentUser) return;
            const currentUser = JSON.parse(rawCurrentUser);

            // Bước 1: Lấy Company_id
            const { data: companyData, error: companyError } = await supabase
                .from("COMPANIES")
                .select("id")
                .eq("user_id", currentUser.id)
                .single();

            if (companyError || !companyData) return;

            // Bước 2: Lấy thông tin bài đăng kèm gom nhóm mảng danh sách ứng tuyển để đếm số lượng
            const { data: listJobData, error: errorJobData } = await supabase
                .from("JOB_POSTINGS")
                .select(`
                    *,
                    APPLICATIONS ( id )
                `) // Gom nhanh danh sách các ID ứng viên đã nộp vào cột ảo APPLICATIONS
                .eq("company_id", companyData.id);

            if (errorJobData) {
                console.error("Lỗi lấy dữ liệu bài đăng:", errorJobData);
                return;
            }

            setJobData(listJobData || []);
        } catch (error) {
            console.error("Lỗi hệ thống loadJobData:", error);
        }
    };

    useEffect(() => {
        loadJobData();
    }, []);

    const handleOpenDetail = (job) => {
        setSelectedJob(job);
        setDetailModalVisible(true);
    };

    // Hàm nhận ID và bật mở Dialog danh sách ứng viên tương ứng
    const handleOpenApplicants = (jobId) => {
        setSelectedJobIdForApplicants(jobId);
        setApplicantsModalVisible(true);
    };

    // Logic tìm kiếm thời gian thực (Real-time Filter) trên UI
    const filteredJobs = jobData.filter(job => {
        const titleMatch = job.title?.toLowerCase().includes(searchText.toLowerCase());
        const stackMatch = job.expertise?.toLowerCase().includes(searchText.toLowerCase());
        return titleMatch || stackMatch;
    });

    const renderHeader = () => (
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.title}>Open <Text style={styles.titleRed}>Roles</Text></Text>
            {/* Cập nhật số liệu hiển thị tổng số bài đăng đang có trên UI */}
            <Text style={styles.subtitle}>Managing {jobData.length} active listings across Engineering.</Text>

            <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search by title or stack..."
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity>
                    <SlidersHorizontal size={20} color="#dc2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.brandText}>PRECISION</Text>
            </View>

            <FlatList
                data={filteredJobs} // Đổi sang mảng filteredJobs để kích hoạt thanh tìm kiếm hoạt động
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <JobCard
                        item={item}
                        onCardPress={handleOpenDetail}
                        onApplicantsPress={handleOpenApplicants}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setCreateModalVisible(true)}>
                <AntDesign name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <CreateJobDialog
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSaveSuccess={reloadJobsData}
            />

            <JobDetailDialog
                visible={detailModalVisible}
                job={selectedJob}
                onClose={() => setDetailModalVisible(false)}
            />

            {/* DIALOG HIỂN THỊ CHI TIẾT ỨNG VIÊN (Sẽ tự động nhận diện danh sách ứng viên theo JobId được truyền vào) */}
            <ApplicantsDialog
                visible={applicantsModalVisible}
                jobId={selectedJobIdForApplicants}
                onClose={() => setApplicantsModalVisible(false)}
                onOpenCandidateDetail={(candidate) => {
                    setSelectedCandidate(candidate);
                    setCandidateDetailVisible(true);
                }}
            />
            <CandidateDetailDialog
                visible={candidateDetailVisible}
                candidate={selectedCandidate}
                onClose={() => setCandidateDetailVisible(false)}
                onBackToApplicants={() => {
                    setCandidateDetailVisible(false);
                    setApplicantsModalVisible(true); // Mở lại danh sách mượt mà khi ấn quay lại
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', marginTop: '10%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    brandText: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
    titleRed: { color: '#dc2626' },
    subtitle: { color: '#6b7280', fontSize: 14, marginTop: 5, marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#1f2937' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    matchBadge: { position: 'absolute', top: -10, right: 10, backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    jobLevel: { fontSize: 11, color: '#dc2626', fontWeight: '700', marginBottom: 4 },
    jobTitle: { fontSize: 19, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 8, marginBottom: 5 },
    tagText: { fontSize: 10, fontWeight: '600', color: '#64748b' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    footerLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
    footerValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    applicantButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    applicantText: { fontSize: 12, color: '#4b5563', marginLeft: 6, fontWeight: '500' },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        backgroundColor: COLORS.primary, width: 56, height: 56,
        borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowOpacity: 0.3
    }
});