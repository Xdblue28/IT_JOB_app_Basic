import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../Config/supabaseClient";

const CompanyDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { companyId } = route.params || {};
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);

        const { data: companyData, error: companyError } = await supabase
          .from("COMPANIES")
          .select("*")
          .eq("id", companyId)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        const { data: jobsData, error: jobsError } = await supabase
          .from("JOB_POSTINGS")
          .select("*")
          .eq("company_id", companyId)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;
        setJobs(jobsData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const galleryImages = company?.GalleryImageUrls
    ? company.GalleryImageUrls.split(",").map((url) => url.trim())
    : [];

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: company?.name || "Chi tiết công ty",
      headerTitleStyle: { fontSize: 18, fontWeight: "700" },
    });
  }, [company, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#b7131a" />
          <Text style={styles.loadingText}>Đang tải thông tin công ty...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color="#ef4444"
          />
          <Text style={styles.errorTitle}>Lỗi xảy ra</Text>
          <Text style={styles.errorText}>
            {error || "Không tìm thấy công ty"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* BANNER & LOGO SECTION */}
        <View style={styles.bannerSection}>
          <Image
            source={{
              uri: company.BannerUrl || "https://via.placeholder.com/400x200",
            }}
            style={styles.banner}
          />
          <View style={styles.logoOverlay}>
            <Image
              source={{
                uri: company.logo_url || "https://via.placeholder.com/120",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName} numberOfLines={2}>
                {company.name}
              </Text>
              <Text style={styles.headline} numberOfLines={1}>
                {company.headline || "Công ty công nghệ"}
              </Text>
            </View>
          </View>
        </View>

        {/* COMPANY OVERVIEW SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu công ty</Text>
          <Text style={styles.descriptionText}>
            {company.DetailedIntroduction || "Chưa có bài giới thiệu chi tiết."}
          </Text>
        </View>

        {/* GALLERY SECTION */}
        {galleryImages.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hình ảnh hoạt động</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContent}
            >
              {galleryImages.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* JOB LISTINGS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.jobHeaderContainer}>
            <Text style={styles.sectionTitle}>Tuyển dụng ({jobs.length})</Text>
          </View>
          {jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={40}
                color="#9ca3af"
              />
              <Text style={styles.emptyStateText}>
                Hiện tại công ty chưa đăng tuyển vị trí nào.
              </Text>
            </View>
          ) : (
            <View style={styles.jobsList}>
              {jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() =>
                    navigation.navigate("JobDetail", { jobId: job.id })
                  }
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle} numberOfLines={2}>
                      {job.title}
                    </Text>
                    <View style={styles.salaryBadge}>
                      <Text style={styles.salaryText}>{job.salary_range}</Text>
                    </View>
                  </View>

                  <View style={styles.jobTags}>
                    {job.job_type && (
                      <View style={[styles.tag, styles.tagBlue]}>
                        <Text style={styles.tagText}>{job.job_type}</Text>
                      </View>
                    )}
                    {job.working_model && (
                      <View style={[styles.tag, styles.tagGray]}>
                        <Text style={styles.tagText}>{job.working_model}</Text>
                      </View>
                    )}
                    {job.location && (
                      <View style={[styles.tag, styles.tagOrange]}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={12}
                          color="#d97706"
                        />
                        <Text style={styles.tagText}>{job.location}</Text>
                      </View>
                    )}
                    {job.badge && (
                      <View style={[styles.tag, styles.tagGreen]}>
                        <Text style={styles.tagText}>{job.badge}</Text>
                      </View>
                    )}
                  </View>

                  {job.description && (
                    <Text style={styles.jobDescription} numberOfLines={2}>
                      {job.description}
                    </Text>
                  )}

                  {job.reasons_to_join && (
                    <Text style={styles.reasonsText}>
                      🎯 {job.reasons_to_join}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* COMPANY OVERVIEW CARD */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tổng quan công ty</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="briefcase"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Ngành nghề</Text>
                <Text style={styles.overviewValue}>
                  {company.industry || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="chart-box"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Mô hình hoạt động</Text>
                <Text style={styles.overviewValue}>
                  {company.CompanyModel || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="people"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Quy mô</Text>
                <Text style={styles.overviewValue}>
                  {company.CompanySize || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Địa điểm</Text>
                <Text style={styles.overviewValue}>
                  {company.city
                    ? `${company.city}, ${company.country || ""}`
                    : "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="clock"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Giờ làm việc</Text>
                <Text style={styles.overviewValue}>
                  {company.WorkingHours || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={20}
                  color="#b7131a"
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Chính sách OT</Text>
                <Text style={styles.overviewValue}>
                  {company.OtPolicy || "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>

          {company.Link && (
            <TouchableOpacity style={styles.websiteButton}>
              <MaterialCommunityIcons name="web" size={18} color="#fff" />
              <Text style={styles.websiteButtonText}>Ghé thăm Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ENVIRONMENT METRICS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Chỉ số môi trường</Text>
          <View style={styles.metricsCard}>
            <MetricBar
              label="🤝 Khả năng cộng tác"
              value={company.collaboration || 80}
              color="#10b981"
            />
            <MetricBar
              label="⚖️ Work-Life Balance"
              value={company.WorkLifeBalance || 0}
              color="#3b82f6"
            />
            <MetricBar
              label="🚀 Độ đổi mới"
              value={company.InnovationFocus || 0}
              color="#f59e0b"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MetricBar = ({ label, value, color }) => (
  <View style={styles.metricRow}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}%</Text>
    </View>
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progressFill,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4b5563",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#b7131a",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  bannerSection: {
    position: "relative",
    marginBottom: 40,
  },
  banner: {
    width: "100%",
    height: 200,
    backgroundColor: "#e5e7eb",
  },
  logoOverlay: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    gap: 16,
    marginTop: -60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#fff",
  },
  companyInfo: {
    flex: 1,
    paddingBottom: 8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headline: {
    fontSize: 14,
    color: "#6b7280",
  },

  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },

  galleryContent: {
    gap: 12,
    paddingRight: 20,
  },
  galleryImage: {
    width: 150,
    height: 120,
    borderRadius: 8,
  },

  jobHeaderContainer: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 12,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  jobTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
  },
  salaryBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  salaryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  jobTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    gap: 4,
  },
  tagBlue: {
    backgroundColor: "#e0f2fe",
  },
  tagGray: {
    backgroundColor: "#f3f4f6",
  },
  tagOrange: {
    backgroundColor: "#fef3c7",
  },
  tagGreen: {
    backgroundColor: "#ecfdf5",
  },
  tagText: {
    fontSize: 12,
    color: "#1f2937",
  },
  jobDescription: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
    marginBottom: 8,
  },
  reasonsText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },

  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  overviewIcon: {
    marginRight: 12,
  },
  overviewContent: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  websiteButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  websiteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  metricsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 20,
  },
  metricRow: {
    gap: 8,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});

export default CompanyDetail;
