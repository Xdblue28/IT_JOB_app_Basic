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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../Config/supabaseClient";
import { useAuth } from "../../Auth/AuthContext";

const JobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("JOB_POSTINGS")
        .select(
          `
          *,
          COMPANIES (
            name,
            logo_url,
            city,
            headline,
            industry,
            "CompanyModel",
            "CompanySize",
            "WorkingHours"
          )
        `, // 🌟 Đã sửa: Gọi đúng các cột thực tế của bảng COMPANIES (đúng chữ hoa/thường)
        )
        .eq("id", jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (err) {
      console.error("Error fetching job details:", err.message);
      Alert.alert("Lỗi", "Không thể tải thông tin công việc.");
    } finally {
      setLoading(false);
    }
  };

  const { userSession } = useAuth();

  const [isApplied, setIsApplied] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const checkApplied = async () => {
    try {
      setAppLoading(true);

      if (!userSession?.id || !jobId) {
        setIsApplied(false);
        return;
      }

      // suy ra candidate_id từ user_id
      const { data: candidateData, error: candidateErr } = await supabase
        .from("CANDIDATES")
        .select("id")
        .eq("user_id", userSession.id)
        .single();

      if (candidateErr) throw candidateErr;

      const candidateId = candidateData?.id;
      if (!candidateId) {
        setIsApplied(false);
        return;
      }

      const { data: existed, error: existedErr } = await supabase
        .from("APPLICATIONS")
        .select("id")
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existedErr) throw existedErr;
      setIsApplied(!!existed?.id);
    } catch (e) {
      console.error("checkApplied error:", e?.message || e);
      setIsApplied(false);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    checkApplied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSession?.id, jobId]);

  const cancelApplyForJob = async () => {
    try {
      if (!userSession?.id) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để hủy ứng tuyển.");
        return;
      }

      Alert.alert(
        "Xác nhận hủy ứng tuyển",
        "Bạn có chắc chắn muốn hủy ứng tuyển công việc này không?",
        [
          {
            text: "Không",
            style: "cancel",
          },
          {
            text: "Hủy ứng tuyển",
            style: "destructive",
            onPress: async () => {
              try {
                const { data: candidateData, error: candidateErr } =
                  await supabase
                    .from("CANDIDATES")
                    .select("id")
                    .eq("user_id", userSession.id)
                    .single();

                if (candidateErr || !candidateData?.id) {
                  Alert.alert("Lỗi", "Không tìm thấy thông tin ứng viên.");
                  return;
                }

                const candidateId = candidateData.id;

                const { error: deleteErr } = await supabase
                  .from("APPLICATIONS")
                  .delete()
                  .eq("candidate_id", candidateId)
                  .eq("job_id", jobId);

                if (deleteErr) {
                  console.error("cancelApplyForJob delete error:", deleteErr);
                  Alert.alert("Lỗi", "Không thể hủy ứng tuyển lúc này.");
                  return;
                }

                Alert.alert("Thành công", "Đã hủy ứng tuyển.");
                await checkApplied();
                navigation.goBack();
              } catch (err) {
                console.error("cancelApplyForJob error:", err);
                Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
              }
            },
          },
        ],
        { cancelable: true },
      );
    } catch (err) {
      console.error("cancelApplyForJob outer error:", err);
      Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
    }
  };

  const applyForJob = async () => {
    try {
      if (!userSession?.id) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để ứng tuyển.");
        return;
      }

      // suy ra candidate_id từ user_id
      const { data: candidateData, error: candidateErr } = await supabase
        .from("CANDIDATES")
        .select("id")
        .eq("user_id", userSession.id)
        .single();

      if (candidateErr || !candidateData?.id) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin ứng viên.");
        return;
      }

      const { data: existed, error: existedErr } = await supabase
        .from("APPLICATIONS")
        .select("id")
        .eq("candidate_id", candidateData.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existedErr) {
        console.error(
          "Lỗi check ứng tuyển trùng:",
          existedErr.message,
          existedErr.details,
        );
      }

      if (existed?.id) {
        Alert.alert("Thông báo", "Bạn đã ứng tuyển công việc này rồi.");
        return;
      }

      const { error: insertErr } = await supabase.from("APPLICATIONS").insert([
        {
          candidate_id: candidateData.id,
          job_id: jobId,
          resume_id: null,
          status: "pending",
        },
      ]);

      if (insertErr) {
        console.error("Lỗi ứng tuyển:", insertErr.message, insertErr.details);
        Alert.alert("Lỗi", "Không thể ứng tuyển lúc này.");
        return;
      }

      Alert.alert("Thành công", "Ứng tuyển thành công!");
      navigation.goBack();
    } catch (err) {
      console.error("Lỗi hệ thống applyForJob:", err);
      Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#b7131a" />
      </View>
    );
  }

  // 🚀 Chặn an toàn: Nếu không tìm thấy dữ liệu hoặc lỗi DB, không cho render UI dưới để tránh sập app
  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 16, color: "#5f5e5e", marginBottom: 16 }}>
          Không tìm thấy thông tin công việc.
        </Text>
        <TouchableOpacity
          style={[styles.applyButtonLarge, { paddingHorizontal: 24, flex: 0 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.applyButtonText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Bóc tách dữ liệu từ các cột text (đảm bảo an toàn bằng Optional Chaining)
  const skills = job.expertise
    ? job.expertise.split(",").map((s) => s.trim())
    : [];

  const reasons = job.reasons_to_join
    ? job.reasons_to_join.split("\n").map((r) => r.trim())
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#1a1c1c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết công việc
        </Text>
        <TouchableOpacity
          onPress={() => setIsBookmarked(!isBookmarked)}
          style={styles.headerIconBtn}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={26}
            color={isBookmarked ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Top Info Section */}
        <View style={styles.topCard}>
          <Image
            source={{
              uri:
                job.COMPANIES?.logo_url ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
            }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
          <Text style={styles.jobTitleText}>{job.title}</Text>
          <Text style={styles.companyNameText}>
            {job.COMPANIES?.name || "Công ty công nghệ"}
          </Text>

          {/* Headline của công ty nếu có */}
          {job.COMPANIES?.headline && (
            <Text style={styles.companyHeadlineText}>
              {job.COMPANIES.headline}
            </Text>
          )}

          <View style={styles.mainBadges}>
            {job.badge && (
              <View style={[styles.badge, { backgroundColor: "#fff2f2" }]}>
                <Text style={[styles.badgeText, { color: "#b7131a" }]}>
                  {job.badge?.toUpperCase() === "URGENT"
                    ? "Tuyển Gấp 🔥"
                    : job.badge}
                </Text>
              </View>
            )}
            {job.job_type && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job.job_type}</Text>
              </View>
            )}
            {job.working_model && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job.working_model}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={22}
              color="#b7131a"
            />
            <Text style={styles.statLabel}>Mức lương</Text>
            <Text style={styles.statValue}>
              {job.salary_range || "Thỏa thuận"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={22}
              color="#b7131a"
            />
            <Text style={styles.statLabel}>Khu vực</Text>
            {/* Lấy thành phố của Công ty, nếu job không có location cụ thể */}
            <Text style={styles.statValue}>
              {job.location || job.COMPANIES?.city || "Toàn quốc"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="domain" size={22} color="#b7131a" />
            <Text style={styles.statLabel}>Lĩnh vực</Text>
            <Text style={styles.statValue}>
              {job.domain || job.COMPANIES?.industry || "IT"}
            </Text>
          </View>
        </View>

        {/* Thông tin chi tiết thêm về quy mô/mô hình Công ty */}
        {(job.COMPANIES?.CompanyModel || job.COMPANIES?.CompanySize) && (
          <View style={[styles.section, styles.companyMoreInfoRow]}>
            {job.COMPANIES?.CompanyModel && (
              <View style={styles.infoMetaPiece}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={16}
                  color="#5f5e5e"
                />
                <Text style={styles.infoMetaPieceText}>
                  Mô hình: {job.COMPANIES.CompanyModel}
                </Text>
              </View>
            )}
            {job.COMPANIES?.CompanySize && (
              <View style={styles.infoMetaPiece}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={16}
                  color="#5f5e5e"
                />
                <Text style={styles.infoMetaPieceText}>
                  Quy mô: {job.COMPANIES.CompanySize}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reasons to Join */}
        {reasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tại sao bạn nên ứng tuyển?</Text>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color="#4CAF50"
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Job Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.contentParagraph}>{job.description}</Text>
          </View>
        )}

        {/* Yêu cầu kỹ năng */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yêu cầu kỹ năng</Text>
            <View style={styles.skillWrap}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footerAction}>
        <TouchableOpacity
          style={styles.bookmarkButtonCircle}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? "heart" : "heart-outline"}
            size={28}
            color={isBookmarked ? "#b7131a" : "#906f6c"}
          />
        </TouchableOpacity>

        {appLoading ? (
          <TouchableOpacity
            style={[styles.applyButtonLarge, { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled
          >
            <ActivityIndicator size="small" color="#fff" />
          </TouchableOpacity>
        ) : isApplied ? (
          <TouchableOpacity
            style={[styles.applyButtonLarge, { backgroundColor: "#e0e0e0" }]}
            onPress={cancelApplyForJob}
          >
            <Text style={[styles.applyButtonText, { color: "#333" }]}>
              Hủy ứng tuyển
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.applyButtonLarge}
            onPress={applyForJob}
          >
            <Text style={styles.applyButtonText}>Nộp đơn ngay</Text>
            <MaterialCommunityIcons
              name="send"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyStyle: "space-between",
    paddingHorizontal: 12,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerIconBtn: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1c1c",
    flex: 1,
    textAlign: "center",
  },
  scrollBody: { paddingBottom: 120 },
  topCard: { alignItems: "center", padding: 24, backgroundColor: "#fff" },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "transparent",
  },
  jobTitleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1c1c",
    textAlign: "center",
  },
  companyNameText: {
    fontSize: 16,
    color: "#5f5e5e",
    marginTop: 4,
    fontWeight: "500",
  },
  companyHeadlineText: {
    fontSize: 13,
    color: "#9e9e9e",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
  mainBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#5f5e5e" },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: { fontSize: 11, color: "#9e9e9e", textTransform: "uppercase" },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1c1c",
    textAlign: "center",
  },
  section: { paddingHorizontal: 20, marginTop: 24 },
  companyMoreInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
  },
  infoMetaPiece: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoMetaPieceText: { fontSize: 13, color: "#5f5e5e", fontWeight: "500" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1c1c",
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  reasonText: { fontSize: 14, color: "#4a4a4a", flex: 1, lineHeight: 20 },
  contentParagraph: { fontSize: 15, color: "#4a4a4a", lineHeight: 24 },
  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: {
    backgroundColor: "#1a1c1c",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skillTagText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  footerAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
    gap: 12,
  },
  bookmarkButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  applyButtonLarge: {
    flex: 1,
    height: 54,
    backgroundColor: "#b7131a",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#b7131a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});

export default JobDetailScreen;
