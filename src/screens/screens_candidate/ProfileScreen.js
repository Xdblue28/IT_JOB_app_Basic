import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "../../Config/supabaseClient";
import { useAuth } from "../../Auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
const SUPABASE_URL = "https://hjoeynekvqkzaiijmwmx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb2V5bmVrdnFremFpaWptd214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODY0MjYsImV4cCI6MjA5MTk2MjQyNn0.3uLoSe8t66ywOlP6Gakt1IJXfZK9IqUeDmd1Tymcfws";
const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userSession, logout } = useAuth();
  const user = userSession;

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("applied");

  // --- Trạng thái Chỉnh sửa (Inline Editing States) ---
  const [editingSection, setEditingSection] = useState(null); // 'hero', 'about', 'bento'
  const [editFields, setEditFields] = useState({});

  // --- Trạng thái Thêm mới dữ liệu danh sách ---
  const [newItemType, setNewItemType] = useState(null); // 'exp', 'edu', 'proj', 'cert'
  const [newItemFields, setNewItemFields] = useState({});

  // --- States lưu trữ dữ liệu Schema Hệ thống ---
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [skills, setSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      fetchCandidateProfileData(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  // 1. Tải toàn diện dữ liệu đa bảng từ Hệ thống
  const fetchCandidateProfileData = async (userId) => {
    try {
      setLoading(true);
      const { data: candidateData, error: candidateError } = await supabase
        .from("CANDIDATES")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (candidateError) throw candidateError;

      if (candidateData) {
        const candidateId = candidateData.id;
        const avatarBusted = candidateData.avatar_url
          ? `${candidateData.avatar_url}?t=${Date.now()}`
          : null;

        setCandidateInfo({ ...candidateData, avatar_url: avatarBusted });

        // Khởi tạo form edit cho thông tin cơ bản
        setEditFields({
          fullname: candidateData.fullname || "",
          CurrentLevel: candidateData.CurrentLevel || "",
          city: candidateData.city || "",
          YearsExperience: String(candidateData.YearsExperience || 0),
          DesiredSalary: candidateData.DesiredSalary || "",
          about_me: candidateData.about_me || "",
          phone: candidateData.phone || "",
          address: candidateData.address || "",
        });

        // Gọi song song các cấu trúc bảng liên kết
        const [
          skillsRes,
          resumeRes,
          expRes,
          eduRes,
          projRes,
          certRes,
          appliedRes,
          savedRes,
        ] = await Promise.all([
          supabase
            .from("CANDIDATE_SKILLS")
            .select("SKILLS(name)")
            .eq("candidate_id", candidateId),
          supabase
            .from("RESUMES")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("CANDIDATE_EXPERIENCES")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("id", { ascending: false }),
          supabase
            .from("CANDIDATE_EDUCATIONS")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("id", { ascending: false }),
          supabase
            .from("CANDIDATE_PROJECTS")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("id", { ascending: false }),
          supabase
            .from("CANDIDATE_CERTIFICATES")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("id", { ascending: false }),
          supabase
            .from("APPLICATIONS")
            .select(
              `id, status, applied_at, JOB_POSTINGS ( title, COMPANIES ( name, logo_url ) )`,
            )
            .eq("candidate_id", candidateId)
            .order("applied_at", { ascending: false }),
          supabase
            .from("SAVED_JOBS")
            .select(
              `saved_at, JOB_POSTINGS ( id, title, location, working_model, job_type, COMPANIES ( name, logo_url ) )`,
            )
            .eq("candidate_id", candidateId)
            .order("saved_at", { ascending: false }),
        ]);

        if (skillsRes.data)
          setSkills(
            skillsRes.data.map((item) => item.SKILLS?.name).filter(Boolean),
          );
        if (resumeRes.data) setResume(resumeRes.data);
        if (expRes.data) setExperiences(expRes.data);
        if (eduRes.data) setEducations(eduRes.data);
        if (projRes.data) setProjects(projRes.data);
        if (certRes.data) setCertificates(certRes.data);
        if (appliedRes.data) setAppliedJobs(appliedRes.data);
        if (savedRes.data) setSavedJobs(savedRes.data);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu:", error.message);
      Alert.alert("Lỗi kết nối", "Không thể lấy thông tin chi tiết hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Lưu thông tin thuộc tính bảng CANDIDATES
  const handleSaveSection = async (sectionKey) => {
    try {
      setUploading(true);
      const updatePayload = {
        fullname: editFields.fullname,
        CurrentLevel: editFields.CurrentLevel,
        city: editFields.city,
        YearsExperience: parseInt(editFields.YearsExperience) || 0,
        DesiredSalary: editFields.DesiredSalary,
        about_me: editFields.about_me,
        phone: editFields.phone,
        address: editFields.address,
      };

      const { error } = await supabase
        .from("CANDIDATES")
        .update(updatePayload)
        .eq("id", candidateInfo.id);

      if (error) throw error;

      setCandidateInfo({ ...candidateInfo, ...updatePayload });
      setEditingSection(null);
      Alert.alert("Thành công", "Đã cập nhật thông tin lên hệ thống.");
    } catch (error) {
      Alert.alert("Thất bại", error.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadToStorage = async (bucket, filePath, fileUri, mimeType) => {
    try {
      console.log("📂 Đọc file từ:", fileUri);

      const contentType = mimeType || "image/jpeg";
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

      // ✅ Hàm helper fetch blob — gọi lại mỗi lần cần vì stream consumed sau 1 lần dùng
      const fetchBlob = async () => {
        const res = await fetch(fileUri);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Không thể đọc file`);
        const b = await res.blob();
        if (b.size === 0) throw new Error("File rỗng");
        return b;
      };

      // Lần 1: thử POST
      const blob1 = await fetchBlob();
      console.log(`📤 POST ${blob1.size} bytes → ${uploadUrl}`);

      const postResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: blob1,
      });

      // ✅ Đọc body text để check lỗi Duplicate
      // Không dùng .status === 409 vì Supabase trả 400 với body statusCode=409
      if (!postResponse.ok) {
        const postErrText = await postResponse.text();
        console.log("⚠️ POST failed:", postResponse.status, postErrText);

        const isDuplicate =
          postErrText.includes("409") ||
          postErrText.includes("Duplicate") ||
          postErrText.includes("already exists");

        if (!isDuplicate) {
          throw new Error(
            `Upload thất bại: ${postResponse.status} — ${postErrText}`,
          );
        }

        // File đã tồn tại → PUT với blob mới
        console.log("🔄 File đã tồn tại, chuyển sang PUT...");
        const blob2 = await fetchBlob();

        const putResponse = await fetch(`${uploadUrl}?upsert=true`, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: blob2,
        });

        if (!putResponse.ok) {
          const putErrText = await putResponse.text();
          throw new Error(
            `PUT thất bại: ${putResponse.status} — ${putErrText}`,
          );
        }
      }

      console.log("✅ Upload thành công!");
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
      console.log("🔗 Public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("⚠️ Upload Error:", error);
      throw error;
    }
  };
  // 3. Đổi Avatar Động
  const handleUpdateAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted)
        return Alert.alert("Thông báo", "Cần cấp quyền truy cập ảnh.");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
      });

      if (result.canceled || !result.assets) return;

      setUploading(true);
      const targetFile = result.assets[0];
      const filePath = `user_avatars/avatar_${candidateInfo.id}.jpg`;

      // upload — nhận về clean URL (không timestamp)
      const publicUrl = await uploadToStorage(
        "avatars",
        filePath,
        targetFile.uri,
        targetFile.mimeType || "image/jpeg",
      );

      // ✅ Lưu URL sạch vào DB
      const { error } = await supabase
        .from("CANDIDATES")
        .update({ avatar_url: publicUrl })
        .eq("id", candidateInfo.id);
      if (error) throw error;

      // ✅ Thêm timestamp vào URL chỉ ở state để bypass cache React Native
      const bustUrl = `${publicUrl}?t=${Date.now()}`;
      setCandidateInfo((prev) => ({ ...prev, avatar_url: bustUrl }));

      Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
    } catch (error) {
      console.error("⚠️ Lỗi Upload:", error);
      Alert.alert("❌ Lỗi tải ảnh", error.message);
    } finally {
      setUploading(false);
    }
  };

  // 4. Đẩy CV / Resume Mới
  const handleUpdateResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (result.canceled || !result.assets) return;

      setUploading(true);
      const doc = result.assets[0];
      const filePath = `${candidateInfo.id}/cv_${Date.now()}_${doc.name}`;
      const publicUrl = await uploadToStorage(
        "resumes",
        filePath,
        doc.uri,
        doc.mimeType || "application/pdf",
      );

      const { data, error } = await supabase
        .from("RESUMES")
        .insert([
          {
            candidate_id: candidateInfo.id,
            title: doc.name,
            file_url: publicUrl,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      setResume(data);
      Alert.alert("Thành công", "Đã lưu tài liệu CV mới.");
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setUploading(false);
    }
  };

  // 5. Thêm phần tử mới cho các danh sách con (Kinh nghiệm, Học vấn, Dự án, Chứng chỉ)
  const handleAddNewItem = async () => {
    try {
      setUploading(true);
      let tableName = "";
      let payload = { candidate_id: candidateInfo.id };

      if (newItemType === "exp") {
        tableName = "CANDIDATE_EXPERIENCES";
        payload.company_name = newItemFields.company_name || "Công ty mới";
        payload.job_title = newItemFields.job_title || "Lập trình viên";
      } else if (newItemType === "edu") {
        tableName = "CANDIDATE_EDUCATIONS";
        payload.school_name = newItemFields.school_name || "Trường học";
        payload.major = newItemFields.major || "Chuyên ngành Công nghệ";
      } else if (newItemType === "proj") {
        tableName = "CANDIDATE_PROJECTS";
        payload.project_name =
          newItemFields.project_name || "Dự án mới xây dựng";
      } else if (newItemType === "cert") {
        tableName = "CANDIDATE_CERTIFICATES";
        payload.name = newItemFields.name || "Chứng chỉ mới chứng nhận";
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      // Cập nhật lại state tương ứng tại local màn hình
      if (newItemType === "exp") setExperiences([data, ...experiences]);
      if (newItemType === "edu") setEducations([data, ...educations]);
      if (newItemType === "proj") setProjects([data, ...projects]);
      if (newItemType === "cert") setCertificates([data, ...certificates]);

      setNewItemType(null);
      setNewItemFields({});
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setUploading(false);
    }
  };

  // 6. Xóa nhanh phần tử danh sách con khỏi Supabase
  const handleDeleteItem = async (tableName, id, type) => {
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;

      if (type === "exp")
        setExperiences(experiences.filter((i) => i.id !== id));
      if (type === "edu") setEducations(educations.filter((i) => i.id !== id));
      if (type === "proj") setProjects(projects.filter((i) => i.id !== id));
      if (type === "cert")
        setCertificates(certificates.filter((i) => i.id !== id));
    } catch (error) {
      Alert.alert("Lỗi xóa", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b7131a" />
        <Text style={styles.loadingText}>Đang xử lý dữ liệu ITJOBPRO...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={true}
      />
      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.uploadOverlayText}>
            Đang đồng bộ dữ liệu Cloud...
          </Text>
        </View>
      )}

      {/* Header Bar */}
      <View style={styles.headerWrapper}>
        <View style={styles.topAppBar}>
          <Text style={styles.brandLogo}>IT RECRUITMENT PROFILE</Text>
          <TouchableOpacity onPress={logout} style={styles.notificationBtn}>
            <MaterialCommunityIcons name="logout" size={22} color="#b7131a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollAreaContent}
      >
        {/* ================= HERO CARD (Thông tin cốt lõi) ================= */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            <Image
              style={styles.avatarImage}
              source={
                candidateInfo?.avatar_url
                  ? { uri: candidateInfo.avatar_url }
                  : require("../../../assets/cat-meme.png")
              }
              key={candidateInfo?.avatar_url} // force re-render khi URL thay đổi
            />
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={handleUpdateAvatar}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {editingSection === "hero" ? (
            <View style={styles.editFormInline}>
              <TextInput
                style={styles.inlineInput}
                value={editFields.fullname}
                onChangeText={(t) =>
                  setEditFields({ ...editFields, fullname: t })
                }
                placeholder="Họ tên"
              />
              <TextInput
                style={styles.inlineInput}
                value={editFields.CurrentLevel}
                onChangeText={(t) =>
                  setEditFields({ ...editFields, CurrentLevel: t })
                }
                placeholder="Vị trí công việc"
              />
              <TextInput
                style={styles.inlineInput}
                value={editFields.city}
                onChangeText={(t) => setEditFields({ ...editFields, city: t })}
                placeholder="Thành phố"
              />
              <View style={styles.actionFormRow}>
                <TouchableOpacity
                  style={styles.saveMiniBtn}
                  onPress={() => handleSaveSection("hero")}
                >
                  <Text style={styles.actionBtnTextText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelMiniBtn}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "center", width: "100%" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.profileName}>
                  {candidateInfo?.fullname || "Chưa cập nhật tên"}
                </Text>
                <TouchableOpacity onPress={() => setEditingSection("hero")}>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={16}
                    color="#b7131a"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileTitle}>
                {candidateInfo?.CurrentLevel || "Lập trình viên"}
              </Text>
              <View style={styles.metaBadgeRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {candidateInfo?.city || "Việt Nam"}
                  </Text>
                </View>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {candidateInfo?.YearsExperience || 0} Năm KN
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ================= ABOUT ME SECTION ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Giới thiệu bản thân</Text>
          {editingSection !== "about" && (
            <TouchableOpacity onPress={() => setEditingSection("about")}>
              <Text style={styles.sectionActionText}>SỬA</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bentoBoxFullRow}>
          {editingSection === "about" ? (
            <View style={{ width: "100%" }}>
              <TextInput
                style={[styles.inlineInput, { minHeight: 60 }]}
                multiline
                value={editFields.about_me}
                onChangeText={(t) =>
                  setEditFields({ ...editFields, about_me: t })
                }
                placeholder="Viết giới thiệu..."
              />
              <View style={styles.actionFormRow}>
                <TouchableOpacity
                  style={styles.saveMiniBtn}
                  onPress={() => handleSaveSection("about")}
                >
                  <Text style={styles.actionBtnTextText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelMiniBtn}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.aboutMeText}>
              {candidateInfo?.about_me ||
                "Chưa cập nhật phần tự giới thiệu chi tiết."}
            </Text>
          )}
        </View>

        {/* ================= BENTO PREFERENCES (Yêu cầu công việc & Liên hệ) ================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Thông tin công việc & Liên hệ</Text>
          {editingSection !== "bento" && (
            <TouchableOpacity onPress={() => setEditingSection("bento")}>
              <Text style={styles.sectionActionText}>SỬA</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingSection === "bento" ? (
          <View style={styles.heroCard}>
            <TextInput
              style={styles.inlineInput}
              value={editFields.DesiredSalary}
              onChangeText={(t) =>
                setEditFields({ ...editFields, DesiredSalary: t })
              }
              placeholder="Mức lương mong muốn"
            />
            <TextInput
              style={styles.inlineInput}
              value={editFields.phone}
              onChangeText={(t) => setEditFields({ ...editFields, phone: t })}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.inlineInput}
              value={editFields.address}
              onChangeText={(t) => setEditFields({ ...editFields, address: t })}
              placeholder="Địa chỉ chi tiết"
            />
            <View style={styles.actionFormRow}>
              <TouchableOpacity
                style={styles.saveMiniBtn}
                onPress={() => handleSaveSection("bento")}
              >
                <Text style={styles.actionBtnTextText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelMiniBtn}
                onPress={() => setEditingSection(null)}
              >
                <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bentoGridContainer}>
            <View style={styles.bentoRow}>
              <View style={styles.bentoBoxHalf}>
                <Text style={styles.bentoLabel}>LƯƠNG MONG MUỐN</Text>
                <Text style={styles.bentoValue}>
                  {candidateInfo?.DesiredSalary || "Thỏa thuận"}
                </Text>
              </View>
              <View style={styles.bentoBoxHalf}>
                <Text style={styles.bentoLabel}>SỐ ĐIỆN THOẠI</Text>
                <Text style={styles.bentoValue}>
                  {candidateInfo?.phone || "Chưa có"}
                </Text>
              </View>
            </View>
            <View style={styles.bentoBoxFullRow}>
              <View>
                <Text style={styles.bentoLabel}>ĐỊA CHỈ THƯỜNG TRÚ</Text>
                <Text
                  style={[
                    styles.bentoValue,
                    { fontSize: 14, fontWeight: "500" },
                  ]}
                >
                  {candidateInfo?.address || "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= CV / RESUME DOCUMENT ================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>CV / Resume</Text>
          <TouchableOpacity onPress={handleUpdateResume}>
            <Text style={styles.sectionActionText}>TẢI LÊN</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.resumeCard}>
          <View style={styles.resumeLeftCol}>
            <View style={styles.docIconBox}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#b7131a"
              />
            </View>
            <View style={styles.resumeMeta}>
              <Text style={styles.resumeFileName} numberOfLines={1}>
                {resume?.title || "Chưa đính kèm file CV"}
              </Text>
              <Text style={styles.resumeUploadDate}>
                {resume
                  ? "Đã xác thực trên Cloud hệ thống"
                  : "Tải lên CV dạng PDF hoặc Word"}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= DYNAMIC LISTS (Kinh nghiệm, Học vấn, Dự án, Chứng chỉ) ================= */}

        {/* 1. Kinh nghiệm làm việc */}
        <View style={styles.listHeaderSection}>
          <Text style={styles.subBlockTitle}>Kinh nghiệm làm việc</Text>
          <TouchableOpacity onPress={() => setNewItemType("exp")}>
            <MaterialCommunityIcons
              name="plus-circle"
              size={22}
              color="#b7131a"
            />
          </TouchableOpacity>
        </View>
        {newItemType === "exp" && (
          <View style={styles.addFormBox}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Tên công ty"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, company_name: t })
              }
            />
            <TextInput
              style={styles.inlineInput}
              placeholder="Chức danh / Vị trí"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, job_title: t })
              }
            />
            <View style={styles.actionFormRow}>
              <TouchableOpacity
                style={styles.saveMiniBtn}
                onPress={handleAddNewItem}
              >
                <Text style={styles.actionBtnTextText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelMiniBtn}
                onPress={() => setNewItemType(null)}
              >
                <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {experiences.map((item) => (
          <View key={item.id} style={styles.itemRowData}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemMainText}>{item.company_name}</Text>
              <Text style={styles.itemSubText}>{item.job_title}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDeleteItem("CANDIDATE_EXPERIENCES", item.id, "exp")
              }
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#ba1a1a"
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* 2. Học vấn */}
        <View style={styles.listHeaderSection}>
          <Text style={styles.subBlockTitle}>Học vấn & Trình độ</Text>
          <TouchableOpacity onPress={() => setNewItemType("edu")}>
            <MaterialCommunityIcons
              name="plus-circle"
              size={22}
              color="#b7131a"
            />
          </TouchableOpacity>
        </View>
        {newItemType === "edu" && (
          <View style={styles.addFormBox}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Tên trường học"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, school_name: t })
              }
            />
            <TextInput
              style={styles.inlineInput}
              placeholder="Chuyên ngành học"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, major: t })
              }
            />
            <View style={styles.actionFormRow}>
              <TouchableOpacity
                style={styles.saveMiniBtn}
                onPress={handleAddNewItem}
              >
                <Text style={styles.actionBtnTextText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelMiniBtn}
                onPress={() => setNewItemType(null)}
              >
                <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {educations.map((item) => (
          <View key={item.id} style={styles.itemRowData}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemMainText}>{item.school_name}</Text>
              <Text style={styles.itemSubText}>{item.major}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDeleteItem("CANDIDATE_EDUCATIONS", item.id, "edu")
              }
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#ba1a1a"
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* 3. Dự án phát triển */}
        <View style={styles.listHeaderSection}>
          <Text style={styles.subBlockTitle}>Dự án cá nhân / Thực tế</Text>
          <TouchableOpacity onPress={() => setNewItemType("proj")}>
            <MaterialCommunityIcons
              name="plus-circle"
              size={22}
              color="#b7131a"
            />
          </TouchableOpacity>
        </View>
        {newItemType === "proj" && (
          <View style={styles.addFormBox}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Tên dự án phát triển"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, project_name: t })
              }
            />
            <View style={styles.actionFormRow}>
              <TouchableOpacity
                style={styles.saveMiniBtn}
                onPress={handleAddNewItem}
              >
                <Text style={styles.actionBtnTextText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelMiniBtn}
                onPress={() => setNewItemType(null)}
              >
                <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {projects.map((item) => (
          <View key={item.id} style={styles.itemRowData}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemMainText}>{item.project_name}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDeleteItem("CANDIDATE_PROJECTS", item.id, "proj")
              }
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#ba1a1a"
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* 4. Chứng chỉ đạt được */}
        <View style={styles.listHeaderSection}>
          <Text style={styles.subBlockTitle}>
            Chứng chỉ & Bằng cấp liên quan
          </Text>
          <TouchableOpacity onPress={() => setNewItemType("cert")}>
            <MaterialCommunityIcons
              name="plus-circle"
              size={22}
              color="#b7131a"
            />
          </TouchableOpacity>
        </View>
        {newItemType === "cert" && (
          <View style={styles.addFormBox}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Tên chứng chỉ chuyên môn"
              onChangeText={(t) =>
                setNewItemFields({ ...newItemFields, name: t })
              }
            />
            <View style={styles.actionFormRow}>
              <TouchableOpacity
                style={styles.saveMiniBtn}
                onPress={handleAddNewItem}
              >
                <Text style={styles.actionBtnTextText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelMiniBtn}
                onPress={() => setNewItemType(null)}
              >
                <Text style={[styles.actionBtnTextText, { color: "#333" }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {certificates.map((item) => (
          <View key={item.id} style={styles.itemRowData}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemMainText}>{item.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDeleteItem("CANDIDATE_CERTIFICATES", item.id, "cert")
              }
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#ba1a1a"
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* ================= TABS THỐNG KÊ VIỆC LÀM ================= */}
        <View style={[styles.tabHeaderBar, { marginTop: 30 }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "applied" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("applied")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "applied" && styles.tabButtonTextActive,
              ]}
            >
              ĐÃ ỨNG TUYỂN ({appliedJobs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "saved" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("saved")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "saved" && styles.tabButtonTextActive,
              ]}
            >
              ĐÃ LƯU ({savedJobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "applied" ? (
          <View style={styles.listContainer}>
            {appliedJobs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.jobRowCard}
                activeOpacity={0.85}
                onPress={() => {
                  const jobId = item.JOB_POSTINGS?.id;
                  if (!jobId) return;
                  navigation.navigate("JobDetail", { jobId });
                }}
              >
                <View style={styles.jobIconBox}>
                  <MaterialCommunityIcons
                    name="cloud-outline"
                    size={24}
                    color="#b7131a"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardSpaceRow}>
                    <Text style={styles.jobCardTitle} numberOfLines={1}>
                      {item.JOB_POSTINGS?.title}
                    </Text>
                    <View style={styles.statusBadgeBox}>
                      <Text style={styles.statusBadgeText}>
                        {item.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.jobCardSubtitle}>
                    {item.JOB_POSTINGS?.COMPANIES?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {savedJobs.map((item) => (
              <View key={item.JOB_POSTINGS?.id} style={styles.jobRowCard}>
                <View style={styles.jobIconBox}>
                  <MaterialCommunityIcons
                    name="memory"
                    size={24}
                    color="#b7131a"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobCardTitle} numberOfLines={1}>
                    {item.JOB_POSTINGS?.title}
                  </Text>
                  <Text style={styles.jobCardSubtitle}>
                    {item.JOB_POSTINGS?.COMPANIES?.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#5f5e5e", fontSize: 14, fontWeight: "500" },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    gap: 10,
  },
  uploadOverlayText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },

  headerWrapper: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 4 : 0,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
  },
  topAppBar: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  brandLogo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#b7131a",
    letterSpacing: -0.5,
  },
  notificationBtn: { padding: 4 },
  scrollAreaContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },

  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 16,
    width: "100%",
  },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "rgba(183, 19, 26, 0.1)",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#b7131a",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  profileName: { fontSize: 18, fontWeight: "700", color: "#1a1c1c" },
  profileTitle: { fontSize: 13, color: "#5f5e5e", marginTop: 2 },
  metaBadgeRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  metaBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaBadgeText: { fontSize: 10, color: "#5f5e5e", fontWeight: "600" },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1a1c1c" },
  sectionActionText: { color: "#b7131a", fontSize: 12, fontWeight: "600" },
  aboutMeText: { fontSize: 13, color: "#444", lineHeight: 18 },

  bentoGridContainer: { gap: 10, marginBottom: 16, width: "100%" },
  bentoRow: { flexDirection: "row", gap: 10 },
  bentoBoxHalf: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777",
    marginBottom: 4,
  },
  bentoValue: { fontSize: 14, fontWeight: "700", color: "#1a1c1c" },
  bentoBoxFullRow: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },

  resumeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    marginBottom: 16,
  },
  resumeLeftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  docIconBox: {
    backgroundColor: "rgba(183, 19, 26, 0.08)",
    padding: 10,
    borderRadius: 8,
  },
  resumeMeta: { flex: 1 },
  resumeFileName: { fontSize: 14, fontWeight: "600", color: "#1a1c1c" },
  resumeUploadDate: { fontSize: 11, color: "#777", marginTop: 2 },

  // Styles cho cấu trúc Form inline & List dữ liệu mới
  editFormInline: { width: "100%", gap: 8 },
  inlineInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#fafafa",
    color: "#1a1c1c",
  },
  actionFormRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  saveMiniBtn: {
    backgroundColor: "#b7131a",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelMiniBtn: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnTextText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },

  listHeaderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  subBlockTitle: { fontSize: 14, fontWeight: "700", color: "#444" },
  addFormBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(183, 19, 26, 0.15)",
  },
  itemRowData: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    elevation: 1,
  },
  itemMainText: { fontSize: 13, fontWeight: "600", color: "#1a1c1c" },
  itemSubText: { fontSize: 12, color: "#666", marginTop: 2 },

  tabHeaderBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: { borderColor: "#b7131a" },
  tabButtonText: { fontSize: 11, fontWeight: "600", color: "#5f5e5e" },
  tabButtonTextActive: { color: "#b7131a" },
  listContainer: { gap: 10 },
  jobRowCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    elevation: 1,
  },
  jobIconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
  },
  cardSpaceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobCardTitle: { fontSize: 14, fontWeight: "600", color: "#1a1c1c", flex: 1 },
  statusBadgeBox: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "600", color: "#5f5e5e" },
  jobCardSubtitle: { fontSize: 12, color: "#5f5e5e", marginTop: 2 },
});

export default ProfileScreen;
