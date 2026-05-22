import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, ScrollView,
    StyleSheet, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateJobDialog({ visible, onClose, onSaveSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');


    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

    const [jobType, setJobType] = useState('');
    const [location, setLocation] = useState('');
    const [badge, setBadge] = useState('');
    const [expertise, setExpertise] = useState('');
    const [domain, setDomain] = useState('');
    const [workingModel, setWorkingModel] = useState('');
    const [reasonsToJoin, setReasonsToJoin] = useState('');

    const [loading, setLoading] = useState(false);

    // Reset form mỗi khi ẩn/hiện Modal
    useEffect(() => {
        if (visible) {
            setTitle(''); setDescription('');
            setMinSalary(''); setMaxSalary('');
            setJobType(''); setLocation(''); setBadge('');
            setExpertise(''); setDomain(''); setWorkingModel('');
            setReasonsToJoin('');
        }
    }, [visible]);

    const handleCreateJob = async () => {
        if (!title || !description || !location) {
            Alert.alert("Thông báo", "Vui lòng điền các trường bắt buộc (Tiêu đề, Mô tả, Địa điểm)");
            return;
        }

        setLoading(true);
        try {

            const rawCurrentUser = await AsyncStorage.getItem("session-user");
            const currentUser = JSON.parse(rawCurrentUser);

            if (!currentUser) {
                Alert.alert("Lỗi", "Không tìm thấy phiên đăng nhập của nhà tuyển dụng.");
                setLoading(false);
                return;
            }


            const { data: companyData, error: companyError } = await supabase
                .from('COMPANIES')
                .select('id,status')
                .eq('user_id', currentUser.id)
                .single();

            if (companyError || !companyData) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin công ty của tài khoản này.");
                setLoading(false);
                return;
            }

            if (companyData.status === "approved") {


                let formattedSalaryRange = '';
                if (minSalary && maxSalary) {
                    formattedSalaryRange = `$${minSalary}k — $${maxSalary}k`;
                } else if (minSalary) {
                    formattedSalaryRange = `$${minSalary}k+`;
                } else if (maxSalary) {
                    formattedSalaryRange = `Up to $${maxSalary}k`;
                } else {
                    formattedSalaryRange = 'Thỏa thuận';
                }

                const { error } = await supabase
                    .from('JOB_POSTINGS')
                    .insert([{
                        company_id: companyData.id,
                        title: title,
                        description: description,
                        salary_range: formattedSalaryRange,
                        job_type: jobType,
                        location: location,
                        badge: badge,
                        expertise: expertise,
                        domain: domain,
                        working_model: workingModel,
                        reasons_to_join: reasonsToJoin,
                        status: 'active'
                    }]);

                if (error) throw error;
                Alert.alert("Thành công", "Đã đăng tin tuyển dụng mới!");
                onSaveSuccess();
                onClose();
            } else {
                Alert.alert("Thông báo", "Công ty tạm thời không thể thêm bài tuyển dụng.");
                return;
            }
        } catch (error) {
            Alert.alert("Lỗi hệ thống", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.dialogTitle}>Tạo Bài Tuyển Dụng Mới</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.formContainer}>
                        <Text style={styles.label}>Tiêu đề công việc *</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: Senior Frontend Developer" value={title} onChangeText={setTitle} />

                        <Text style={styles.label}>Mô tả công việc *</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Chi tiết công việc, quyền lợi..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />

                        {/* 3. Thay thế ô nhập cũ thành cụm 2 ô nhập số đặt ngang hàng nhau */}
                        <Text style={styles.label}>Mức lương (đơn vị tính bằng nghìn USD - k)</Text>
                        <View style={styles.salaryRow}>
                            <View style={styles.salaryInputWrapper}>
                                <Text style={styles.salaryPrefix}>$</Text>
                                <TextInput
                                    style={[styles.input, styles.salaryInput]}
                                    placeholder="Từ (Ví dụ: 150)"
                                    value={minSalary}
                                    onChangeText={setMinSalary}
                                    keyboardType="numeric" // Chỉ cho phép bật bàn phím số
                                />
                                <Text style={styles.salarySuffix}>k</Text>
                            </View>

                            <Text style={styles.salarySeparator}>—</Text>

                            <View style={styles.salaryInputWrapper}>
                                <Text style={styles.salaryPrefix}>$</Text>
                                <TextInput
                                    style={[styles.input, styles.salaryInput]}
                                    placeholder="Đến (Ví dụ: 180)"
                                    value={maxSalary}
                                    onChangeText={setMaxSalary}
                                    keyboardType="numeric" // Chỉ cho phép bật bàn phím số
                                />
                                <Text style={styles.salarySuffix}>k</Text>
                            </View>
                        </View>

                        <Text style={styles.label}>Hình thức làm việc (Job Type)</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: Full-time, Part-time" value={jobType} onChangeText={setJobType} />

                        <Text style={styles.label}>Địa điểm làm việc *</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: Ho Chi Minh City, VN" value={location} onChangeText={setLocation} />

                        <Text style={styles.label}>Huy hiệu lấp lánh (Badge)</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: HOT, URGENT, NEW" value={badge} onChangeText={setBadge} />

                        <Text style={styles.label}>Kỹ năng yêu cầu (Expertise)</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: React, TypeScript, Node.js" value={expertise} onChangeText={setExpertise} />

                        <Text style={styles.label}>Lĩnh vực hoạt động (Domain)</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: Fintech, E-commerce" value={domain} onChangeText={setDomain} />

                        <Text style={styles.label}>Mô hình vận hành (Working Model)</Text>
                        <TextInput style={styles.input} placeholder="Ví dụ: Remote, Hybrid, Onsite" value={workingModel} onChangeText={setWorkingModel} />

                        <Text style={styles.label}>Lý do nên gia nhập công ty</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Môi trường, sếp tâm lý, phúc lợi khủng..." value={reasonsToJoin} onChangeText={setReasonsToJoin} multiline numberOfLines={3} />
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                            <Text style={styles.btnTextCancel}>Hủy bỏ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={handleCreateJob} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextSubmit}>Đăng bài</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    dialog: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
    dialogTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, textAlign: 'center' },
    formContainer: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '600', color: '#4b5563', marginBottom: 6, marginTop: 8 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, height: 45, color: '#1f2937', backgroundColor: '#f8fafc' },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

    // 4. Bổ sung các style mới cho hàng nhập lương
    salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    salaryInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
    salaryInput: { flex: 1, paddingLeft: 24, paddingRight: 24 }, // Chừa chỗ trống cho ký tự $ và k
    salaryPrefix: { position: 'absolute', left: 12, color: '#94a3b8', fontWeight: '500', zIndex: 1 },
    salarySuffix: { position: 'absolute', right: 12, color: '#94a3b8', fontWeight: '500', zIndex: 1 },
    salarySeparator: { color: '#64748b', fontWeight: 'bold', fontSize: 16 },

    buttonContainer: { flexDirection: 'row', gap: 12, paddingBottom: 10 },
    btn: { flex: 1, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    btnCancel: { backgroundColor: '#f1f5f9' },
    btnSubmit: { backgroundColor: '#8A000E' },
    btnTextCancel: { color: '#64748b', fontWeight: 'bold' },
    btnTextSubmit: { color: '#fff', fontWeight: 'bold' }
});