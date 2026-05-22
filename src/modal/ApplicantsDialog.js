import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../utils/supabase';
import { User } from 'lucide-react-native';

export default function ApplicantsDialog({ visible, jobId, onClose, onOpenCandidateDetail }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && jobId) {
            const fetchApplicants = async () => {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('APPLICATIONS')
                        .select(`
                            id,
                            status,
                            CANDIDATES (
                                id,
                                fullname,
                                avatar_url,
                                city,
                                phone,
                                YearsExperience,
                                CurrentLevel
                            )
                        `)
                        .eq('job_id', jobId);

                    if (error) {
                        console.error("Lỗi lấy danh sách ứng viên:", error);
                        return;
                    }

                    if (data) {
                        const formatted = data.map(item => ({
                            id: item.id.toString(),
                            status: item.status,
                            candidateInfo: item.CANDIDATES || null,
                            name: item.CANDIDATES?.fullname || 'Ứng viên ẩn danh',
                            image: item.CANDIDATES?.avatar_url || null,
                        }));
                        setApplicants(formatted);
                    }
                } catch (err) {
                    console.log(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchApplicants();
        }
    }, [visible, jobId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'applied': return { bg: '#e0f2fe', text: '#0369a1', label: 'Mới' };
            case 'scheduled': return { bg: '#eff6ff', text: '#1d4ed8', label: 'Hẹn phỏng vấn' };
            default: return { bg: '#f1f5f9', text: '#475569', label: status || 'Đang duyệt' };
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>Danh sách Ứng viên</Text>

                    {loading ? (
                        <ActivityIndicator size="small" color="#8A000E" style={{ marginVertical: 30 }} />
                    ) : (
                        <FlatList
                            data={applicants}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const statusStyle = getStatusStyle(item.status);
                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.applicantCard}
                                        onPress={() => {
                                            // Đóng modal này lại trước khi mở modal chi tiết để tránh xung đột UI
                                            onClose();
                                            // Bắn dữ liệu ứng viên lên màn hình cha để xử lý mở modal chi tiết
                                            onOpenCandidateDetail(item.candidateInfo);
                                        }}
                                    >
                                        {item.image ? (
                                            <Image source={{ uri: item.image }} style={styles.avatarImage} />
                                        ) : (
                                            <View style={styles.avatarFallback}>
                                                <User size={16} color="#fff" />
                                            </View>
                                        )}

                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.name}>{item.name}</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                    {statusStyle.label}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={styles.viewDetailLink}>Xem thêm</Text>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Chưa có ứng viên nào ứng tuyển vào vị trí này.</Text>
                            }
                            style={{ maxHeight: 350 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    <TouchableOpacity style={styles.btnClose} onPress={onClose}>
                        <Text style={styles.btnText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    dialog: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, textAlign: 'center' },
    applicantCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 10, gap: 12 },
    avatarImage: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#cbd5e1' },
    avatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#64748b', justifyContent: 'center', alignItems: 'center' },
    name: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    viewDetailLink: { fontSize: 12, color: '#8A000E', fontWeight: '500' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginVertical: 30, fontSize: 13 },
    btnClose: { marginTop: 10, backgroundColor: '#ef4444', height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});