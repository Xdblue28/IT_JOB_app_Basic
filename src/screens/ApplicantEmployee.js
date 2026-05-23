import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, Image, StatusBar, Modal, TextInput, Alert, Platform
} from 'react-native';
import { Bell, User, Calendar, X, Edit2, MapPin, UserX } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

// COMPONENT THẺ ỨNG VIÊN (Giữ nguyên logic của bạn)
const ApplicantCard = ({ item, onSchedule }) => {
    const displayFriendlyDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.avatar} />
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.role}</Text>
                </View>
            </View>

            {item.hasInterview && (
                <View style={styles.interviewInfoBox}>
                    <View style={styles.interviewDetailRow}>
                        <Calendar size={14} color="#475569" />
                        <Text style={styles.interviewDetailText}>
                            <Text style={{ fontWeight: '600' }}>Thời gian:</Text> {displayFriendlyDate(item.interviewData.date)}
                        </Text>
                    </View>
                    <View style={styles.interviewDetailRow}>
                        <MapPin size={14} color="#475569" />
                        <Text style={styles.interviewDetailText} numberOfLines={1}>
                            <Text style={{ fontWeight: '600' }}>Địa điểm:</Text> {item.interviewData.location}
                        </Text>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[styles.viewButton, item.hasInterview && styles.editButtonBackground]}
                onPress={() => onSchedule(item)}
            >
                {item.hasInterview ? (
                    <>
                        <Text style={[styles.viewButtonText, { color: '#2563eb' }]}>CHỈNH SỬA LỊCH HẸN</Text>
                        <Edit2 size={16} color="#2563eb" />
                    </>
                ) : (
                    <>
                        <Text style={styles.viewButtonText}>ĐẶT LỊCH PHỎNG VẤN</Text>
                        <Calendar size={16} color="#dc2626" />
                    </>
                )
                }
            </TouchableOpacity>
        </View>
    );
};

export default function ApplicantsScreen() {
    const [candidates, setCandidates] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const [location, setLocation] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showPicker, setShowPicker] = useState(false);

    // Thêm một state để kiểm tra xem hệ thống đã load xong dữ liệu từ API chưa
    const [isLoadingData, setIsLoadingData] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoadingData(true); // Bắt đầu load
            const rawCurrentUser = await AsyncStorage.getItem("session-user");
            if (!rawCurrentUser) return;
            const currentUser = JSON.parse(rawCurrentUser);

            const { data: companyData, error: companyError } = await supabase
                .from("COMPANIES")
                .select("id")
                .eq("user_id", currentUser.id)
                .single();

            if (companyError || !companyData) return null;

            const { data: applicationsData, error: appsError } = await supabase
                .from("APPLICATIONS")
                .select(`
                    id, status,
                    JOB_POSTINGS!inner ( id, title, company_id ),
                    CANDIDATES ( id, fullname, avatar_url ),
                    INTERVIEWS ( id, interview_date, location, note )
                `)
                .eq("JOB_POSTINGS.company_id", companyData.id);

            if (appsError || !applicationsData) return;

            setCandidates(applicationsData.map(app => {
                const interview = app.INTERVIEWS && app.INTERVIEWS.length > 0 ? app.INTERVIEWS[0] : null;

                return {
                    id: app.id.toString(),
                    candidateId: app.CANDIDATES?.id,
                    name: app.CANDIDATES?.fullname || "Ẩn danh",
                    role: `${app.JOB_POSTINGS?.title || "N/A"}`,
                    image: app.CANDIDATES?.avatar_url || 'https://i.pravatar.cc/150',
                    status: app.status,
                    hasInterview: !!interview,
                    interviewData: interview ? {
                        id: interview.id,
                        date: interview.interview_date,
                        location: interview.location,
                        note: interview.note
                    } : null
                };
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingData(false); // Kết thúc quá trình load dữ liệu từ Supabase
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDateTimeToSQL = (dateObject) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${dateObject.getFullYear()}-${pad(dateObject.getMonth() + 1)}-${pad(dateObject.getDate())} ${pad(dateObject.getHours())}:${pad(dateObject.getMinutes())}:${pad(dateObject.getSeconds())}`;
    };

    const onDatePickerChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }
        const currentDate = selectedDate || date;
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (mode === 'date') {
                setDate(currentDate);
                setMode('time');
                setTimeout(() => setShowPicker(true), 100);
            } else {
                setDate(currentDate);
            }
        } else {
            setDate(currentDate);
        }
    };

    const handleOpenSchedule = (app) => {
        setSelectedApp(app);
        if (app.hasInterview) {
            setDate(new Date(app.interviewData.date));
            setLocation(app.interviewData.location || '');
            setNote(app.interviewData.note || '');
        } else {
            setDate(new Date());
            setLocation('');
            setNote('');
        }
        setIsModalVisible(true);
    };

    const handleSaveInterview = async () => {
        if (!location) {
            Alert.alert("Lỗi", "Vui lòng nhập địa điểm phỏng vấn.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formattedSQLDate = formatDateTimeToSQL(date);

            if (selectedApp.hasInterview) {
                const { error } = await supabase
                    .from("INTERVIEWS")
                    .update({
                        interview_date: formattedSQLDate,
                        location: location,
                        note: note
                    })
                    .eq("id", selectedApp.interviewData.id);

                if (error) throw error;
                Alert.alert("Thành công", `Đã cập nhật lịch phỏng vấn của ${selectedApp.name}!`);
            } else {
                const { error } = await supabase
                    .from("INTERVIEWS")
                    .insert([
                        {
                            application_id: parseInt(selectedApp.id, 10),
                            interview_date: formattedSQLDate,
                            location: location,
                            note: note,
                            status: "scheduled"
                        }
                    ]);

                if (error) throw error;
                Alert.alert("Thành công", `Đã đặt lịch phỏng vấn cho ${selectedApp.name}!`);
            }

            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể xử lý thao tác lưu lịch hẹn.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const renderEmptyComponent = () => {

        if (isLoadingData) return null;

        return (
            <View style={styles.emptyContainer}>
                <UserX size={48} color="#94a3b8" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>Hiện không có ứng cử viên nào</Text>
                <Text style={styles.emptySubtext}>Các hồ sơ ứng tuyển mới sẽ xuất hiện tại đây.</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.topNav}>
                <Text style={styles.brand}>PRECISION</Text>

            </View>

            <FlatList
                data={candidates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ApplicantCard item={item} onSchedule={handleOpenSchedule} />}
                ListHeaderComponent={() => (
                    <View>
                        <Text style={styles.title}>Applicants</Text>
                        <Text style={styles.subtitle}>Reviewing active candidates for high-impact roles.</Text>
                    </View>
                )}

                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />


            <Modal animationType="slide" transparent={true} visible={isModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedApp?.hasInterview ? "Chỉnh Sửa Lịch Hẹn" : "Đặt Lịch Phỏng Vấn"}
                            </Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={22} color="#4b5563" />
                            </TouchableOpacity>
                        </View>

                        {selectedApp && (
                            <View style={styles.candidateBrief}>
                                <Text style={styles.briefName}>{selectedApp.name}</Text>
                                <Text style={styles.briefRole}>{selectedApp.role}</Text>
                            </View>
                        )}

                        <Text style={styles.inputLabel}>Thời gian phỏng vấn</Text>
                        {Platform.OS === 'ios' ? (
                            <View style={styles.iosPickerContainer}>
                                <DateTimePicker value={date} mode="datetime" display="default" onChange={onDatePickerChange} />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.dateSelectorButton} onPress={() => { setMode('date'); setShowPicker(true); }}>
                                <Text style={styles.dateSelectorText}>{date.toLocaleString('vi-VN')}</Text>
                                <Calendar size={18} color="#475569" />
                            </TouchableOpacity>
                        )}

                        {showPicker && Platform.OS === 'android' && (
                            <DateTimePicker value={date} mode={mode} is24Hour={true} display="default" onChange={onDatePickerChange} />
                        )}

                        <Text style={styles.inputLabel}>Địa điểm / Link cuộc họp online</Text>
                        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Phòng họp / Link Zoom..." />

                        <Text style={styles.inputLabel}>Ghi chú thêm</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={note} onChangeText={setNote} placeholder="Ghi chú nhắc nhở ứng viên..." multiline={true} numberOfLines={3} />

                        <TouchableOpacity
                            style={[styles.submitButton, selectedApp?.hasInterview && { backgroundColor: '#2563eb' }, isSubmitting && styles.disabledButton]}
                            onPress={handleSaveInterview}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? "ĐANG LƯU..." : selectedApp?.hasInterview ? "CẬP NHẬT LỊCH HẸN" : "XÁC NHẬN ĐẶT LỊCH"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', marginTop: '10%' },
    topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    profileCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    brand: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 30, flexGrow: 1 }, // Thêm flexGrow: 1 để căn giữa giao diện trống đúng trục dọc
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginTop: 10 },
    subtitle: { color: '#6b7280', fontSize: 14, marginTop: 5, marginBottom: 20, lineHeight: 20 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e2e8f0' },
    infoContainer: { marginLeft: 12, flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    role: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginTop: 2 },

    interviewInfoBox: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#bfdbfe' },
    interviewDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    interviewDetailText: { fontSize: 13, color: '#1e40af', marginLeft: 8, flex: 1 },

    viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    editButtonBackground: { borderTopColor: '#e2e8f0' },
    viewButtonText: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', letterSpacing: 0.5 },

    // 3. THÊM STYLES CHO GIAO DIỆN TRỐNG (EMPTY STATE)
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
    emptyIcon: { marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: '700', color: '#475569', textAlign: 'center' },
    emptySubtext: { fontSize: 13, color: '#94a3b8', marginTop: 6, textAlign: 'center', lineHeight: 18 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, minHeight: '65%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    candidateBrief: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 15 },
    briefName: { fontSize: 15, fontWeight: 'bold', color: '#334155' },
    briefRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1e293b', backgroundColor: '#f8fafc' },
    textArea: { height: 70, textAlignVertical: 'top' },
    dateSelectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#f8fafc' },
    dateSelectorText: { fontSize: 14, color: '#1e293b' },
    iosPickerContainer: { alignItems: 'flex-start', paddingVertical: 5 },
    submitButton: { backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 25 },
    disabledButton: { backgroundColor: '#fca5a5' },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});