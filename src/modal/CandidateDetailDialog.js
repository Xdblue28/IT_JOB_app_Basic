import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react-native';

export default function CandidateDetailDialog({ visible, candidate, onClose, onBackToApplicants }) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.detailDialog}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.detailHeaderLayout}>
                            {candidate?.avatar_url ? (
                                <Image source={{ uri: candidate.avatar_url }} style={styles.detailLargeAvatar} />
                            ) : (
                                <View style={[styles.detailLargeAvatar, { backgroundColor: '#64748b', justifyContent: 'center', alignItems: 'center' }]}>
                                    <User size={32} color="#fff" />
                                </View>
                            )}
                            <Text style={styles.detailBigName}>{candidate?.fullname || 'Ứng viên ẩn danh'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                        {/* <View style={styles.infoRow}>
                            <Mail size={16} color="#64748b" />
                            <Text style={styles.infoRowText}>{candidate?.email || 'Chưa cập nhật email'}</Text>
                        </View> */}
                        <View style={styles.infoRow}>
                            <Phone size={16} color="#64748b" />
                            <Text style={styles.infoRowText}>{candidate?.phone || 'Chưa cung cấp số điện thoại'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MapPin size={16} color="#64748b" />
                            <Text style={styles.infoRowText}>{candidate?.city || 'Chưa cập nhật địa chỉ'}</Text>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Học vấn & Trình độ</Text>
                        <View style={styles.infoBlockRow}>
                            <GraduationCap size={18} color="#8A000E" style={{ marginTop: 2 }} />
                            <Text style={styles.infoBlockText}>{candidate?.CurrentLevel || 'Chưa bổ sung thông tin học vấn.'}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
                        <View style={styles.infoBlockRow}>
                            <Briefcase size={18} color="#8A000E" style={{ marginTop: 2 }} />
                            <Text style={styles.infoBlockText}>{candidate?.YearsExperience + ' năm kinh nghiệm' || 'Chưa cung cấp thông tin kinh nghiệm.'}</Text>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.btnBack} onPress={onBackToApplicants}>
                        <Text style={styles.btnText}>Quay lại danh sách</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    detailDialog: { width: '88%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
    detailHeaderLayout: { alignItems: 'center', marginVertical: 10 },
    detailLargeAvatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 10 },
    detailBigName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    infoRowText: { fontSize: 13, color: '#475569', flex: 1 },
    infoBlockRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    infoBlockText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },
    btnBack: { marginTop: 15, backgroundColor: '#1e293b', height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});