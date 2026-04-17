import React, { useState, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// DỮ LIỆU VIỆC LÀM GIẢ LẬP (Trong thực tế bạn sẽ fetch từ API theo Company ID)
const JOBS_DATA = [
  {
    id: "j1",
    title: "Senior Backend Engineer (Java/NodeJS)",
    salary: "2,500 - 4,000 USD",
    tags: ["Java", "AWS", "Microservices"],
    type: "Hybrid",
  },
  {
    id: "j2",
    title: "Frontend Developer (ReactJS/NextJS)",
    salary: "1,500 - 2,800 USD",
    tags: ["React", "TypeScript", "Tailwind"],
    type: "Remote",
  },
  {
    id: "j3",
    title: "Mobile App Developer (React Native)",
    salary: "Negotiable",
    tags: ["React Native", "Firebase", "Redux"],
    type: "On-site",
  },
];

const CompanyDetailScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  // 1. NHẬN DỮ LIỆU TỪ COMPANIES_SCREEN
  const { item } = route.params || {};

  // Nếu không có dữ liệu (tránh crash app)
  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin công ty</Text>
      </View>
    );
  }

  // Hàm chia sẻ thông tin công ty
  const onShare = async () => {
    try {
      await Share.share({ message: `Check out ${item.name} on ITJob App!` });
    } catch (error) {
      console.log(error.message);
    }
  };

  // 2. COMPONENT CON: THÔNG TIN CHUNG (DÙNG DỮ LIỆU ĐỘNG)
  const GeneralInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin chung</Text>
      <View style={styles.infoGrid}>
        <InfoItem
          icon="business"
          label="Loại hình"
          value={item.type || "IT Product"}
        />
        <InfoItem
          icon="groups"
          label="Quy mô"
          value={item.size || "100-500 nhân viên"}
        />
        <InfoItem
          icon="public"
          label="Quốc gia"
          value={item.country || "Việt Nam"}
        />
        <InfoItem
          icon="event-note"
          label="Ngày làm việc"
          value="Thứ 2 - Thứ 6"
        />
      </View>
    </View>
  );

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoBox}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={18} color="#D32F2F" />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // 3. COMPONENT CON: CARD CÔNG VIỆC
  const renderJobItem = ({ item: job }) => (
    <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
      <View style={styles.jobHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.jobSalary}>{job.salary}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{job.type}</Text>
        </View>
      </View>
      <View style={styles.tagRow}>
        {job.tags.map((t) => (
          <View key={t} style={styles.jobTag}>
            <Text style={styles.jobTagText}>{t}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HERO SECTION */}
      <View style={styles.heroSection}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.navBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} style={styles.navBtn}>
            <Ionicons name="share-social-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.companyHeader}>
          <View style={styles.logoSquare}>
            <Image
              source={
                typeof item.logo === "string" ? { uri: item.logo } : item.logo
              }
              style={styles.mainLogo}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.companyName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingScore}>4.9</Text>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={12} color="#FFB400" />
              ))}
              <Text style={styles.reviewCount}>(256 đánh giá)</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="create-outline" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>Viết đánh giá</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons name="heart-outline" size={18} color="#FFF" />
            <Text style={styles.secondaryBtnText}>Theo dõi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB NAVIGATION */}
      <View style={styles.tabBar}>
        {["Overview", "Jobs", "Reviews"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "Overview"
                ? "Tổng quan"
                : tab === "Jobs"
                  ? `Việc làm (${item.jobCount})`
                  : "Đánh giá"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {activeTab === "Overview" ? (
          <View style={{ padding: 20 }}>
            <GeneralInfo />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giới thiệu công ty</Text>
              <Text style={styles.descriptionText}>
                {item.name} là đơn vị công nghệ hàng đầu, tập trung vào phát
                triển các giải pháp {item.tags?.join(", ")}. Chúng tôi cung cấp
                môi trường làm việc {item.level} chuẩn quốc tế, giúp ứng viên
                phát huy tối đa năng lực bản thân...
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeMore}>Xem thêm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kỹ năng trọng tâm</Text>
              <View style={styles.skillRow}>
                {item.tags?.map((s) => (
                  <View key={s} style={styles.skillChip}>
                    <Text style={styles.skillText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vị trí</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#D32F2F" />
                <Text style={styles.addressText}>
                  {item.locations?.join(" • ")}
                </Text>
              </View>
              <View style={styles.mapPlaceholder}>
                <MaterialIcons name="map" size={40} color="#DDD" />
                <Text style={{ color: "#999", marginTop: 10 }}>
                  Chạm để mở Google Maps
                </Text>
              </View>
            </View>
          </View>
        ) : activeTab === "Jobs" ? (
          <View style={{ padding: 20 }}>
            <Text style={styles.listTitle}>
              Việc làm đang tuyển tại {item.name}
            </Text>
            <FlatList
              data={JOBS_DATA}
              renderItem={renderJobItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#EEE" />
            <Text style={styles.emptyText}>
              Hiện chưa có đánh giá nào cho {item.name}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Hero Section
  heroSection: {
    backgroundColor: "#1A1C1E",
    paddingTop: 45,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 10,
    marginBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  companyHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoSquare: {
    width: 90,
    height: 90,
    backgroundColor: "#FFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  mainLogo: { width: 70, height: 70 },
  companyName: { color: "#FFF", fontSize: 22, fontWeight: "800", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ratingScore: {
    color: "#FFB400",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 5,
  },
  reviewCount: { color: "#999", fontSize: 11, marginLeft: 8 },

  actionRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 25 },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: "#D32F2F",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "bold", marginLeft: 8 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "600", marginLeft: 8 },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginTop: 10,
  },
  tabItem: { flex: 1, paddingVertical: 18, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#D32F2F" },
  tabText: { color: "#999", fontWeight: "700", fontSize: 13 },
  activeTabText: { color: "#D32F2F" },

  // Content Sections
  section: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 18,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoBox: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: { fontSize: 11, color: "#999", textTransform: "uppercase" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#333" },
  descriptionText: { lineHeight: 24, color: "#555", fontSize: 14 },
  seeMore: { color: "#D32F2F", fontWeight: "bold", marginTop: 12 },
  skillRow: { flexDirection: "row", flexWrap: "wrap" },
  skillChip: {
    backgroundColor: "#F5F7F9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: { fontSize: 13, color: "#444", fontWeight: "600" },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  addressText: { flex: 1, marginLeft: 10, fontSize: 14, color: "#666" },
  mapPlaceholder: {
    height: 160,
    backgroundColor: "#F0F2F5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCC",
  },

  // Jobs Tab
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
  },
  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  jobHeader: { flexDirection: "row", justifyContent: "space-between" },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#1A1C1E", flex: 0.8 },
  jobSalary: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },
  typeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    height: 25,
  },
  typeText: { fontSize: 10, color: "#1976D2", fontWeight: "bold" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 15 },
  jobTag: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  jobTagText: { fontSize: 11, color: "#777", fontWeight: "500" },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: {
    color: "#CCC",
    marginTop: 15,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default CompanyDetailScreen;
