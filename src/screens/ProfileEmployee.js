import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Bell, Edit2, Plus, Building2, AlertTriangle } from "lucide-react-native";
import { supabase } from '../../utils/supabase';
import EditCompanyDialog from '../modal/EditProfileCompany';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const handleLogout = async (setSession) => {
  try {
    await AsyncStorage.removeItem("session-user");
    setSession(null);
    Alert.alert("Đăng xuất", "Bạn đã đăng xuất thành công");
  } catch (e) {
    console.error("Lỗi đăng xuất:", e);
  }
};

// ĐÃ CẬP NHẬT: Trả về cả dữ liệu công ty và userId phục vụ cho việc báo cáo
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

    return {
      company: employerData,
      userId: currentUser.id
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const InfoRow = ({ label, value, isLink }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
    <Text style={[styles.infoValue, isLink && styles.linkText]}>{value}</Text>
  </View>
);

export default function CompanyProfileScreen({ route }) {
  const { setSession } = route.params;
  const handleLogoutClick = async () => {
    await handleLogout(setSession);
  };

  const [employerData, setEmployerData] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // THÊM MỚI: State quản lý modal báo cáo lỗi
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const openEdit = (employerCompany) => {
    setModalVisible(true);
  };

  // THÊM MỚI: Hàm xử lý gửi báo cáo lên bảng COMPANY_REPORTS
  const handleSendReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung vấn đề/lỗi gặp phải.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const { error } = await supabase
        .from("COMPANY_REPORTS")
        .insert([
          {
            company_id: employerData.id,        // Lấy từ bảng COMPANIES
            reported_by: currentUserId,         // Lấy từ USERS qua session
            reason: reportReason.trim(),
            status: "pending"                   // Trạng thái mặc định
          }
        ]);

      if (error) throw error;

      Alert.alert("Thành công", "Báo cáo của bạn đã được gửi tới hệ thống quản trị.");
      setReportReason("");
      setReportModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Thất bại", "Không thể gửi báo cáo vào lúc này: " + error.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    const loadEmployeeData = async () => {
      const result = await fetchCompanyAndUserData();
      if (result) {
        setEmployerData(result.company);
        setCurrentUserId(result.userId);
      }
    };
    loadEmployeeData();
  }, []);

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
          <TouchableOpacity style={styles.editButton} onPress={openEdit}>
            <Edit2 size={14} color="#dc2626" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <EditCompanyDialog
            visible={modalVisible}
            company={employerData}
            onClose={() => setModalVisible(false)}
            onSaveSuccess={async () => {
              const result = await fetchCompanyAndUserData();
              if (result) setEmployerData(result.company);
            }}
          />
        </View>

        <View style={styles.visualContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c' }}
            style={styles.coverImage}
          />

          <View style={styles.logoBadge}>
            {employerData.logo_url ? (
              <Image
                source={{ uri: employerData.logo_url }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Building2 size={28} color="#94a3b8" />
            )}
          </View>
        </View>

        <Text style={styles.helperText}>
          Your visual identity is displayed on all job postings and candidate touchpoints.
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>Company Overview</Text>
        <View style={styles.overviewCard}>
          <InfoRow label="Legal Name" value={employerData.name} />
          <InfoRow label="Headquarters" value={employerData.city} />
          <InfoRow label="Company Size" value={employerData.CompanySize ? employerData.CompanySize + " Employees" : "---"} />
          <InfoRow label="Website" value={employerData.Link || "---"} isLink />
        </View>

        {/* Section: Expertise */}
        <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>Our Expertise</Text>
        <View style={styles.tagContainer}>
          {(employerData.Expertise?.split(',') || []).map((tag, i) => (
            <View key={i} style={[styles.expertTag, i === 0 && styles.activeExpertTag]}>
              <Text style={[styles.expertTagText, i === 0 && styles.activeExpertTagText]}>{tag}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addTagButton}>
            <Plus size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* THÊM MỚI: Dòng chữ/Nút mở Dialog báo cáo vấn đề kĩ thuật */}
        <TouchableOpacity
          style={styles.reportRow}
          onPress={() => setReportModalVisible(true)}
        >
          <AlertTriangle size={16} color="#64748b" />
          <Text style={styles.reportText}>Gặp vấn đề hoặc lỗi phần mềm? <Text style={styles.reportLinkText}>Báo cáo tại đây</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.publishButton} onPress={handleLogoutClick}>
          <Text style={styles.publishButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* THÊM MỚI: MODAL DIALOG BÁO CÁO LỖI HỆ THỐNG */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Báo Cáo Lỗi Hệ Thống</Text>
            <Text style={styles.modalSubtitle}>Mô tả chi tiết vấn đề hoặc lỗi kĩ thuật bạn đang gặp phải để quản trị viên hỗ trợ xử lý.</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập lý do hoặc mô tả lỗi tại đây..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={reportReason}
              onChangeText={setReportReason}
              textAlignVertical="top"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setReportModalVisible(false); setReportReason(""); }}
                disabled={isSubmittingReport}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButtonReport]}
                onPress={handleSendReport}
                disabled={isSubmittingReport}
              >
                <Text style={styles.submitButtonReportText}>
                  {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
                </Text>
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
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 25 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editButtonText: { color: '#dc2626', fontWeight: 'bold', marginLeft: 5, fontSize: 14 },

  visualContainer: { width: '100%', height: 160, borderRadius: 12, overflow: 'visible', marginBottom: 25 },
  coverImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: '#1e293b' },

  logoBadge: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 70,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },

  helperText: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 5 },
  overviewCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  infoRow: { marginBottom: 15 },
  infoLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '600' },
  linkText: { color: '#dc2626', textDecorationLine: 'underline' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expertTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#e2e8f0' },
  activeExpertTag: { backgroundColor: '#dc2626' },
  expertTagText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  activeExpertTagText: { color: '#fff' },
  addTagButton: { width: 35, height: 35, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },

  // THÊM MỚI: CSS cho phần nút kích hoạt báo cáo
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, gap: 6 },
  reportText: { fontSize: 13, color: '#64748b' },
  reportLinkText: { color: '#dc2626', fontWeight: '600', textDecorationLine: 'underline' },

  publishButton: { backgroundColor: '#b91c1c', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  publishButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // THÊM MỚI: CSS UI cho Modal Report Dialog 
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 16 },
  modalInput: { width: '100%', minHeight: 100, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', padding: 12, fontSize: 14, color: '#1e293b' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#f1f5f9' },
  cancelButtonText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  submitButtonReport: { backgroundColor: '#dc2626' },
  submitButtonReportText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});