import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TextInput,
    TouchableOpacity, SafeAreaView, StatusBar, Alert
} from 'react-native';
import { Search, SlidersHorizontal, User, Edit3, Trash2 } from 'lucide-react-native';
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

// --- COMPONENT CON: JOB CARD ---
const JobCard = ({ item, onCardPress, onApplicantsPress, onEditPress, onDeletePress }) => {
    const tags = item.expertise ? item.expertise.split(',').map(t => t.trim()) : [];
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

                <View style={styles.actionButtonGroup}>
                    <TouchableOpacity
                        style={styles.applicantButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onApplicantsPress(item.id);
                        }}
                    >
                        <User size={14} color="#4b5563" fill="#4b5563" />
                        <Text style={styles.applicantText}>
                            {totalApplicants} {totalApplicants <= 1 ? 'Applicant' : 'Applicants'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.editBtn]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onEditPress(item);
                        }}
                    >
                        <Edit3 size={15} color="#2563eb" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteBtn]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDeletePress(item.id, item.title);
                        }}
                    >
                        <Trash2 size={15} color="#dc2626" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// --- COMPONENT CHÍNH ---
export default function JobManageScreen() {
    const [searchText, setSearchText] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [jobData, setJobData] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const [isEditingMode, setIsEditingMode] = useState(false);

    const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState(null);
    const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
    const [candidateDetailVisible, setCandidateDetailVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const reloadJobsData = () => {
        loadJobData();
    };

    const loadJobData = async () => {
        try {
            const rawCurrentUser = await AsyncStorage.getItem("session-user");
            if (!rawCurrentUser) return;
            const currentUser = JSON.parse(rawCurrentUser);

            const { data: companyData, error: companyError } = await supabase
                .from("COMPANIES")
                .select("id")
                .eq("user_id", currentUser.id)
                .single();

            if (companyError || !companyData) return;

            const { data: listJobData, error: errorJobData } = await supabase
                .from("JOB_POSTINGS")
                .select(`
                    *,
                    APPLICATIONS ( id )
                `)
                .eq("company_id", companyData.id)
                .order('id', { ascending: false });

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

    const handleOpenApplicants = (jobId) => {
        setSelectedJobIdForApplicants(jobId);
        setApplicantsModalVisible(true);
    };

    // ==================== ĐÃ SỬA: LOGIC XỬ LÝ CLICK NÚT CHỈNH SỬA ====================
    const handleEditJob = (job) => {
        // Tách chuỗi lương từ Database ra thành min và max để truyền cho CreateJobDialog nhận diện
        let extractedMin = '';
        let extractedMax = '';
        const salaryStr = job.salary_range || '';

        if (salaryStr && salaryStr !== 'Thỏa thuận') {
            if (salaryStr.includes('—')) {
                // Định dạng chuẩn: "$150k — $180k"
                const parts = salaryStr.split('—');
                extractedMin = parts[0].replace(/[^0-9]/g, '');
                extractedMax = parts[1].replace(/[^0-9]/g, '');
            } else if (salaryStr.includes('+')) {
                // Định dạng chuẩn: "$150k+"
                extractedMin = salaryStr.replace(/[^0-9]/g, '');
            } else if (salaryStr.toLowerCase().includes('up to')) {
                // Định dạng chuẩn: "Up to $180k"
                extractedMax = salaryStr.replace(/[^0-9]/g, '');
            }
        }

        // Đóng gói data chuẩn khớp 100% với các state trong form CreateJobDialog của bạn
        const fullyMappedJob = {
            ...job,
            minSalary: extractedMin,
            maxSalary: extractedMax
        };

        setSelectedJob(fullyMappedJob); // Lưu Object đã mapping sạch đẹp vào state
        setIsEditingMode(true);
        setCreateModalVisible(true);
    };

    const handleDeleteJob = (jobId, jobTitle) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc chắn muốn gỡ bỏ bài đăng tuyển dụng "${jobTitle}" không? Hành động này không thể hoàn tác.`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa bài",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from("JOB_POSTINGS")
                                .delete()
                                .eq("id", jobId);

                            if (error) throw error;

                            Alert.alert("Thành công", "Đã xóa tin tuyển dụng thành công.");
                            loadJobData();
                        } catch (err) {
                            Alert.alert("Lỗi", "Không thể xóa bài đăng: " + err.message);
                        }
                    }
                }
            ]
        );
    };

    const filteredJobs = jobData.filter(job => {
        const titleMatch = job.title?.toLowerCase().includes(searchText.toLowerCase());
        const stackMatch = job.expertise?.toLowerCase().includes(searchText.toLowerCase());
        return titleMatch || stackMatch;
    });

    const renderHeader = () => (
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.title}>Open <Text style={styles.titleRed}>Roles</Text></Text>
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
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <JobCard
                        item={item}
                        onCardPress={handleOpenDetail}
                        onApplicantsPress={handleOpenApplicants}
                        onEditPress={handleEditJob}
                        onDeletePress={handleDeleteJob}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setSelectedJob(null);
                    setIsEditingMode(false);
                    setCreateModalVisible(true);
                }}
            >
                <AntDesign name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* ĐÃ CẬP NHẬT: Truyền các props để hỗ trợ Edit mà không làm thay đổi cấu trúc gọi Modal cũ */}
            <CreateJobDialog
                visible={createModalVisible}
                isEdit={isEditingMode}
                jobData={selectedJob}
                onClose={() => setCreateModalVisible(false)}
                onSaveSuccess={reloadJobsData}
            />

            <JobDetailDialog
                visible={detailModalVisible}
                job={selectedJob}
                onClose={() => setDetailModalVisible(false)}
            />

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
                    setApplicantsModalVisible(true);
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

    actionButtonGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    applicantButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    applicantText: { fontSize: 12, color: '#4b5563', marginLeft: 6, fontWeight: '500' },
    actionButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    editBtn: { backgroundColor: '#eff6ff' },
    deleteBtn: { backgroundColor: '#fef2f2' },

    fab: {
        position: 'absolute', bottom: 30, right: 30,
        backgroundColor: COLORS.primary, width: 56, height: 56,
        borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowOpacity: 0.3
    }
});