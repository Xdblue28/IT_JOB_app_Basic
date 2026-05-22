import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function JobDetailDialog({ visible, job, onClose }) {
    if (!job) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.dialogTitle}>Chi Tiết Bài Đăng</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.jobMeta}>
                            {`${job.job_type || 'Full-time'} • ${job.working_model || 'Onsite'} • ${job.location || 'N/A'}`}
                        </Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Mức lương:</Text>
                            <Text style={styles.salaryText}>{job.salary_range || 'Thỏa thuận'}</Text>
                        </View>

                        {job.badge && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Huy hiệu:</Text>
                                <Text style={styles.badgeText}>{job.badge.toUpperCase()}</Text>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Yêu cầu kỹ năng (Expertise):</Text>
                            <Text style={styles.normalText}>{job.expertise || 'Không có yêu cầu riêng'}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Mô tả công việc:</Text>
                            <Text style={styles.normalText}>{job.description || 'Chưa cập nhật mô tả.'}</Text>
                        </View>

                        {job.reasons_to_join && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Phúc lợi & Lý do gia nhập:</Text>
                                <Text style={styles.normalText}>{job.reasons_to_join}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.btnClose} onPress={onClose}>
                        <Text style={styles.btnText}>Đóng lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    dialog: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
    dialogTitle: { fontSize: 15, fontWeight: 'bold', color: '#94a3b8', textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
    content: { marginBottom: 15 },
    jobTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
    jobMeta: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginBottom: 20 },
    section: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 4 },
    salaryText: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
    badgeText: { fontSize: 13, fontWeight: 'bold', color: '#b91c1c' },
    normalText: { fontSize: 14, color: '#334155', lineHeight: 20 },
    btnClose: { backgroundColor: '#1e293b', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    btnText: { color: '#fff', fontWeight: 'bold' }
});