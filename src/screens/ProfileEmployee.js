import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from "react-native";
import { Bell, Edit2, Building2, AlertTriangle, MapPin, Briefcase, Clock } from "lucide-react-native";
import { supabase } from '../../utils/supabase';
import EditCompanyDialog from '../modal/EditProfileCompany';
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleLogout = async (setSession) => {
  try {
    await AsyncStorage.removeItem("session-user");
    setSession(null);
    Alert.alert("Đăng xuất", "Bạn đã đăng xuất thành công");
  } catch (e) {
    console.error("Lỗi đăng xuất:", e);
  }
};

const fetchCompanyAndUserData = async () => {
  try {
    const rawCurrentUser = await AsyncStorage.getItem("session-user");
    if (!rawCurrentUser) return null;
    const currentUser = JSON.parse(rawCurrentUser);

    const { data: employerData, error: employerError } = await supabase
      .from('COMPANIES')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (employerError) return null;

    return { company: employerData, userId: currentUser.id };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const InfoRow = ({ label, value, isLink }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
    <Text style={[styles.infoValue, isLink && styles.linkText]}>{value || "---"}</Text>
  </View>
);

export default function CompanyProfileScreen({ route }) {
  const { setSession } = route.params;
  const [employerData, setEmployerData] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState("")
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const loadEmployeeData = async () => {
    const result = await fetchCompanyAndUserData();
    if (result) {
      setEmployerData(result.company);
      setCurrentUserId(result.userId);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, []);


  const handleSendTicket = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung vấn đề/lỗi gặp phải.");
      return;
    }
    setIsSubmittingReport(true);
    try {
      const { error } = await supabase.from("SUPPORT_TICKETS").insert([
        {
          user_id: currentUserId,
          subject: subject,
          message: reportReason.trim(),
          status: "open"
        }
      ]);
      if (error) throw error;
      Alert.alert("Thành công", "Báo cáo của bạn đã được gửi tới hệ thống.");
      setReportReason("");
      setReportModalVisible(false);
    } catch (error) {
      Alert.alert("Thất bại", "Không thể gửi báo cáo: " + error.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandText}>PRECISION</Text>
        <Bell size={24} color="#374151" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.categoryTitle}>ACCOUNT SETTINGS</Text>
        <Text style={styles.mainTitle}>Company Profile</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Visual Identity</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <Edit2 size={14} color="#dc2626" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.visualContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c' }} style={styles.coverImage} />
          <View style={styles.logoBadge}>
            {employerData.logo_url ? (
              <Image source={{ uri: employerData.logo_url }} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <Building2 size={28} color="#94a3b8" />
            )}
          </View>
        </View>

        <Text style={styles.companyNameHeader}>{employerData.name}</Text>
        {employerData.headline ? <Text style={styles.companyHeadline}>"{employerData.headline}"</Text> : null}


        <Text style={styles.blockTitle}><Briefcase size={16} color="#1f2937" /> Tổng quan doanh nghiệp</Text>
        <View style={styles.overviewCard}>
          <InfoRow label="Mô hình công ty" value={employerData.CompanyModel} />
          <InfoRow label="Lĩnh vực hoạt động" value={employerData.industry} />
          <InfoRow label="Quy mô nhân sự" value={employerData.CompanySize} />
        </View>


        <Text style={styles.blockTitle}><MapPin size={16} color="#1f2937" /> Địa lý & Liên hệ</Text>
        <View style={styles.overviewCard}>
          <InfoRow label="Trụ sở chính (Thành phố)" value={employerData.city} />
          <InfoRow label="Quốc gia" value={employerData.country} />
          <InfoRow label="Website liên kết" value={employerData.Link} isLink />
        </View>


        <Text style={styles.blockTitle}><Clock size={16} color="#1f2937" /> Chế độ & Môi trường</Text>
        <View style={styles.overviewCard}>
          <InfoRow label="Thời gian làm việc" value={employerData.WorkingHours} />
          <InfoRow label="Chính sách OT" value={employerData.OtPolicy} />
          <InfoRow label="Giới thiệu chi tiết" value={employerData.DetailedIntroduction} />
        </View>


        <Text style={styles.blockTitle}>Chuyên môn kỹ thuật</Text>
        <View style={styles.tagContainer}>
          {employerData.Expertise ? (
            employerData.Expertise.split(',').map((tag, i) => (
              <View key={i} style={[styles.expertTag, i === 0 && styles.activeExpertTag]}>
                <Text style={[styles.expertTagText, i === 0 && styles.activeExpertTagText]}>{tag.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Chưa có thẻ chuyên môn.</Text>
          )}
        </View>


        <TouchableOpacity style={styles.reportRow} onPress={() => setReportModalVisible(true)}>
          <AlertTriangle size={16} color="#64748b" />
          <Text style={styles.reportText}>Gặp vấn đề phần mềm? <Text style={styles.reportLinkText}>Báo cáo lỗi tại đây</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.publishButton} onPress={() => handleLogout(setSession)}>
          <Text style={styles.publishButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>


      <EditCompanyDialog
        visible={modalVisible}
        company={employerData}
        onClose={() => setModalVisible(false)}
        onSaveSuccess={loadEmployeeData}
      />

      {/* DIALOG BÁO CÁO LỖI */}
      <Modal animationType="fade" transparent visible={reportModalVisible} onRequestClose={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Báo Cáo Lỗi Hệ Thống</Text>
            <Text style={styles.modalSubtitle}>Mô tả chi tiết lỗi kĩ thuật bạn đang gặp phải.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tiêu đề lỗi..."
              placeholderTextColor="#94a3b8"
              multiline
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập mô tả lỗi tại đây..."
              placeholderTextColor="#94a3b8"
              multiline
              value={reportReason}
              onChangeText={setReportReason}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setReportModalVisible(false); setReportReason(""); }} disabled={isSubmittingReport}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButtonReport]} onPress={handleSendTicket} disabled={isSubmittingReport}>
                <Text style={styles.submitButtonReportText}>{isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', marginTop: '10%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  brandText: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryTitle: { fontSize: 12, fontWeight: '700', color: '#dc2626', marginTop: 10 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editButtonText: { color: '#dc2626', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  visualContainer: { width: '100%', height: 140, borderRadius: 12, marginBottom: 25 },
  coverImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#1e293b' },
  logoBadge: { position: 'absolute', bottom: -15, left: 20, width: 65, height: 65, backgroundColor: '#ffffff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff', elevation: 3, shadowOpacity: 0.1 },
  logoImage: { width: '100%', height: '100%', borderRadius: 8 },
  companyNameHeader: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 5 },
  companyHeadline: { fontSize: 14, fontStyle: 'italic', color: '#64748b', marginBottom: 20, marginTop: 2 },
  blockTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  overviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, marginBottom: 5 },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#334155', fontWeight: '600' },
  linkText: { color: '#dc2626', textDecorationLine: 'underline' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  expertTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#e2e8f0' },
  activeExpertTag: { backgroundColor: '#dc2626' },
  expertTagText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  activeExpertTagText: { color: '#fff' },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 6 },
  reportText: { fontSize: 13, color: '#64748b' },
  reportLinkText: { color: '#dc2626', fontWeight: '600', textDecorationLine: 'underline' },
  publishButton: { backgroundColor: '#b91c1c', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: { width: '100%', minHeight: 80, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', padding: 12, textAlignVertical: 'top', marginBottom: 12 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelButton: { backgroundColor: '#f1f5f9' },
  cancelButtonText: { color: '#475569', fontWeight: '600' },
  submitButtonReport: { backgroundColor: '#dc2626' },
  submitButtonReportText: { color: '#fff', fontWeight: '600' },
});