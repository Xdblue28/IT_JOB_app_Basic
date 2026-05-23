import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../Config/supabaseClient";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchSkills, setSearchSkills] = useState("");

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Filter dữ liệu khi search thay đổi
  useEffect(() => {
    filterData();
  }, [
    searchKeyword,
    searchLocation,
    searchCompany,
    searchSkills,
    allCompanies,
    allJobs,
  ]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const { data: companyData, error: companyError } = await supabase
        .from("CARD_VIEWS")
        .select("*");

      const { data: jobData, error: jobError } = await supabase
        .from("JOB_POSTINGS")
        .select(
          `
          *,
          COMPANIES (
            name,
            logo_url
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (companyError)
        console.error("Lỗi lấy CARD_VIEWS:", companyError.message);
      if (jobError) console.error("Lỗi lấy JOB_POSTINGS:", jobError.message);

      if (companyData) {
        setAllCompanies(companyData);

        if (jobData) {
          // Đếm số job active thật theo company_id (real_company_id trên CARD_VIEWS)
          const jobCountMap = jobData.reduce((acc, job) => {
            const cId = job.company_id;
            if (!cId) return acc;
            acc[cId] = (acc[cId] || 0) + 1;
            return acc;
          }, {});

          // CARD_VIEWS.real_company_id map ra id của COMPANIES.
          // JOB_POSTINGS.company_id cũng chính là id của COMPANIES.
          const mergedCompanies = companyData.map((c) => {
            const compId = c.real_company_id;
            return {
              ...c,
              job_count: jobCountMap[compId] || 0,
            };
          });

          setCompanies(mergedCompanies);
        } else {
          setCompanies(companyData);
        }
      }
      if (jobData) {
        setAllJobs(jobData);
        setHotJobs(jobData);
      }
    } catch (error) {
      console.error("Lỗi hệ thống Home:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Filter công ty
    let filteredCompanies = allCompanies;
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(keyword) ||
          (company.skills_list &&
            company.skills_list.toLowerCase().includes(keyword)),
      );
    }
    if (searchLocation.trim()) {
      const location = searchLocation.toLowerCase();
      filteredCompanies = filteredCompanies.filter((company) =>
        company.location?.toLowerCase().includes(location),
      );
    }
    setCompanies(filteredCompanies);

    // Filter việc làm
    let filteredJobs = allJobs;
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          (job.expertise && job.expertise.toLowerCase().includes(keyword)) ||
          (job.COMPANIES?.name &&
            job.COMPANIES.name.toLowerCase().includes(keyword)),
      );
    }
    if (searchLocation.trim()) {
      const location = searchLocation.toLowerCase();
      filteredJobs = filteredJobs.filter((job) =>
        job.location?.toLowerCase().includes(location),
      );
    }
    if (searchCompany.trim()) {
      const company = searchCompany.toLowerCase();
      filteredJobs = filteredJobs.filter((job) =>
        job.COMPANIES?.name.toLowerCase().includes(company),
      );
    }
    if (searchSkills.trim()) {
      const skills = searchSkills.toLowerCase();
      filteredJobs = filteredJobs.filter((job) =>
        job.expertise?.toLowerCase().includes(skills),
      );
    }
    setHotJobs(filteredJobs);
  };

  const handleSearch = () => {
    // Không đụng tới dữ liệu đã đổ ra trên Home.
    // Điều hướng sang JobScreen để hiển thị kết quả theo nhiều trường (keyword/location/company/skills).
    navigation.navigate("Job", {
      initialSearch: {
        keyword: searchKeyword || "",
        location: searchLocation || "",
        company: searchCompany || "",
        skills: searchSkills || "",
      },
    });
  };

  const handleCompanyPress = (companyId) => {
    navigation.navigate("CompanyDetail", { companyId });
  };

  const handleJobPress = (jobId) => {
    navigation.navigate("JobDetail", { jobId });
  };

  const renderCompanyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => handleCompanyPress(item.real_company_id)}
      activeOpacity={0.7}
    >
      <View style={styles.companyMainInfo}>
        <View style={styles.logoContainerBox}>
          <Image
            source={{ uri: item.logo_url || "https://via.placeholder.com/150" }}
            style={styles.companyLogoSquare}
            resizeMode="contain"
          />
        </View>
        <View style={styles.companyMeta}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#5f5e5e"
            />
            <Text style={styles.locationText}>
              {item.location || "Toàn quốc"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsWrapper}>
        {(item.skills_list || "").split(",").map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill.trim().toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.companyFooter}>
        <Text style={styles.jobCountText}>{item.job_count || 0} Việc làm</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color="#b7131a"
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#b7131a" />
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

      {/* TopAppBar - ĐÃ BỎ NÚT THOÁT */}
      <View style={styles.safeHeaderWrapper}>
        <View style={styles.topAppBar}>
          <View style={styles.appBarLeft}>
            <TouchableOpacity style={styles.iconMenu}>
              <MaterialCommunityIcons name="menu" size={24} color="#1a1c1c" />
            </TouchableOpacity>
            <Text style={styles.brandLogo}>ITJOBPRO</Text>
          </View>
          <View style={styles.appBarRight}>
            <TouchableOpacity style={styles.notificationBtn}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color="#1a1c1c"
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Hero Search Section - ĐÃ VIỆT HÓA SLOGAN PHÙ HỢP VĂN HÓA */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeading}>
            Tìm kiếm cơ hội mới.{"\n"}
            <Text style={styles.heroHeadingItalic}>Đột phá sự nghiệp Tech</Text>
            .
          </Text>

          <View style={styles.searchContainerBox}>
            <View style={styles.searchInputRow}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={20}
                color="#5f5e5e"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Vị trí công việc..."
                placeholderTextColor="#7f7f7f"
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
            </View>
            <View
              style={[
                styles.searchInputRow,
                { borderTopWidth: 1, borderColor: "#e2e2e2" },
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#5f5e5e"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Địa điểm làm việc..."
                placeholderTextColor="#7f7f7f"
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
            <View
              style={[
                styles.searchInputRow,
                { borderTopWidth: 1, borderColor: "#e2e2e2" },
              ]}
            >
              <MaterialCommunityIcons
                name="building"
                size={20}
                color="#5f5e5e"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Tên công ty..."
                placeholderTextColor="#7f7f7f"
                value={searchCompany}
                onChangeText={setSearchCompany}
              />
            </View>
            <View
              style={[
                styles.searchInputRow,
                { borderTopWidth: 1, borderColor: "#e2e2e2" },
              ]}
            >
              <MaterialCommunityIcons
                name="code-tags"
                size={20}
                color="#5f5e5e"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Kĩ năng, công nghệ..."
                placeholderTextColor="#7f7f7f"
                value={searchSkills}
                onChangeText={setSearchSkills}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButtonActive}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Tìm kiếm việc làm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Companies Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Công ty hàng đầu</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={companies}
            renderItem={renderCompanyCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục nghề nghiệp</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, gap: 12 }}
          >
            <View style={styles.categoryBox}>
              <View
                style={[styles.categoryIconBg, { backgroundColor: "#ffdad6" }]}
              >
                <MaterialCommunityIcons
                  name="code-tags"
                  size={24}
                  color="#b7131a"
                />
              </View>
              <Text style={styles.categoryNameText}>Software</Text>
            </View>
            <View style={styles.categoryBox}>
              <View
                style={[styles.categoryIconBg, { backgroundColor: "#e5e2e1" }]}
              >
                <MaterialCommunityIcons
                  name="cellphone"
                  size={24}
                  color="#5f5e5e"
                />
              </View>
              <Text style={styles.categoryNameText}>Mobile</Text>
            </View>
            <View style={styles.categoryBox}>
              <View
                style={[styles.categoryIconBg, { backgroundColor: "#afecff" }]}
              >
                <MaterialCommunityIcons
                  name="brain"
                  size={24}
                  color="#006578"
                />
              </View>
              <Text style={styles.categoryNameText}>AI / ML</Text>
            </View>
          </ScrollView>
        </View>

        {/* Hot Jobs Section */}
        <View style={[styles.sectionContainer, { paddingHorizontal: 20 }]}>
          <View style={styles.sectionHeaderHot}>
            <MaterialCommunityIcons name="fire" size={22} color="#b7131a" />
            <Text style={styles.sectionTitle}>Việc làm hấp dẫn</Text>
          </View>
          <View style={{ gap: 16 }}>
            {hotJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.premiumCard}
                onPress={() => handleJobPress(job.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.hotBadge,
                    {
                      backgroundColor:
                        job.badge === "URGENT" ? "#db322f" : "#b7131a",
                    },
                  ]}
                >
                  <Text style={styles.hotBadgeText}>{job.badge || "HOT"}</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={styles.jobLogoContainer}>
                    <Image
                      source={{
                        uri:
                          job.COMPANIES?.logo_url ||
                          "https://via.placeholder.com/150",
                      }}
                      style={styles.jobLogoSquare}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 40 }}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.jobCompanySub} numberOfLines={1}>
                      {job.COMPANIES?.name} •{" "}
                      <Text style={{ color: "#db322f", fontWeight: "600" }}>
                        {job.working_model || "Nơi làm việc"}
                      </Text>
                    </Text>

                    <View style={[styles.skillsWrapper, { marginTop: 6 }]}>
                      {(job.expertise || "").split(",").map((tech, idx) => (
                        <View key={idx} style={styles.jobTechBadge}>
                          <Text style={styles.jobTechText}>{tech.trim()}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.jobCardFooter}>
                  <View>
                    <View style={styles.highSalaryContainer}>
                      <Text style={styles.highSalaryText}>LƯƠNG CAO</Text>
                    </View>
                    <Text style={styles.salaryText}>
                      {job.salary_range || "Thỏa thuận"}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>Ứng tuyển</Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={14}
                      color="#b7131a"
                      style={{ marginLeft: 2 }}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },

  safeHeaderWrapper: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 4 : 0,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
  },
  topAppBar: {
    height: 56,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconMenu: { padding: 4 },
  brandLogo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#b7131a",
    letterSpacing: -0.5,
  },
  appBarRight: { flexDirection: "row", alignItems: "center" },
  notificationBtn: { padding: 4, relative: "row" },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 7,
    height: 7,
    backgroundColor: "#b7131a",
    borderRadius: 4,
  },

  heroSection: { paddingHorizontal: 20, paddingVertical: 20 },
  heroHeading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1c1c",
    lineHeight: 34,
    trackingTight: -0.3,
  },
  heroHeadingItalic: { color: "#b7131a", fontWeight: "800" },

  searchContainerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  inputField: { flex: 1, fontSize: 14, color: "#1a1c1c", paddingVertical: 0 },
  searchButtonActive: {
    backgroundColor: "#b7131a",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  searchButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },

  sectionContainer: { marginVertical: 14 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderHot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1c1c" },
  seeAllText: { color: "#5f5e5e", fontSize: 13, fontWeight: "500" },

  companyCard: {
    width: 250,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    padding: 14,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  companyMainInfo: { flexDirection: "row", gap: 12, alignItems: "center" },
  logoContainerBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 4,
  },
  companyLogoSquare: { width: "100%", height: "100%" },
  companyMeta: { flex: 1 },
  companyName: { fontSize: 15, fontWeight: "700", color: "#1a1c1c" },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  locationText: { fontSize: 12, color: "#5f5e5e" },

  skillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  skillBadge: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: { fontSize: 10, fontWeight: "700", color: "#5f5e5e" },
  companyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#eeeeee",
  },
  jobCountText: { fontSize: 13, color: "#b7131a", fontWeight: "700" },

  categoryBox: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryNameText: { fontSize: 13, fontWeight: "600", color: "#1a1c1c" },

  premiumCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    padding: 16,
    position: "relative",
  },
  hotBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  hotBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  jobLogoContainer: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 4,
  },
  jobLogoSquare: { width: "100%", height: "100%" },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#1a1c1c" },
  jobCompanySub: { fontSize: 13, color: "#5f5e5e", marginTop: 2 },
  jobTechBadge: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  jobTechText: { fontSize: 11, fontWeight: "600", color: "#1a1c1c" },
  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#f3f3f3",
  },
  highSalaryContainer: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  highSalaryText: { color: "#137333", fontSize: 9, fontWeight: "700" },
  salaryText: { fontSize: 16, fontWeight: "800", color: "#b7131a" },
  applyButton: { flexDirection: "row", alignItems: "center" },
  applyButtonText: { color: "#b7131a", fontSize: 13, fontWeight: "700" },
});

export default HomeScreen;
