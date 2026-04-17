import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  UIManager,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 110;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// --- DỮ LIỆU CÔNG TY HÀNG ĐẦU ---
const TOP_EMPLOYERS = [
  {
    id: "1",
    name: "NAB Innovation Centre",
    logo: require("../../assets/images/NAB.png"),
    location: "HCM - HN",
    jobs: 17,
  },
  {
    id: "2",
    name: "Viettel Group",
    logo: require("../../assets/images/Viettel.png"),
    location: "Hà Nội",
    jobs: 105,
  },
  {
    id: "3",
    name: "NAVER Vietnam",
    logo: require("../../assets/images/NAVERVN.png"),
    location: "TP Hồ Chí Minh",
    jobs: 12,
  },
  {
    id: "4",
    name: "ANDPAD Vietnam",
    logo: require("../../assets/images/andpad.png"),
    location: "TP Hồ Chí Minh",
    jobs: 8,
  },
  {
    id: "5",
    name: "OTS Technology",
    logo: require("../../assets/images/OTSTECH.png"),
    location: "Đà Nẵng",
    jobs: 20,
  },
];

// --- DỮ LIỆU VIỆC LÀM HOT ---
const HOT_JOBS = [
  {
    id: "j1",
    title: "Senior React Native Dev",
    company: "NAB Innovation",
    salary: "$2,000 - $3,500",
    tags: ["React Native", "Expo", "Mobile"],
    location: "Hồ Chí Minh",
    logo: require("../../assets/images/NAB.png"),
  },
  {
    id: "j2",
    title: "Principal Backend Engineer",
    company: "NAVER Vietnam",
    salary: "Lên đến $4,000",
    tags: ["Java", "Spring Boot", "MSA"],
    location: "Hồ Chí Minh",
    logo: require("../../assets/images/NAVERVN.png"),
  },
  {
    id: "j3",
    title: "System Architect (5G/Telecom)",
    company: "Viettel Group",
    salary: "Thỏa thuận",
    tags: ["C++", "Linux", "Network"],
    location: "Hà Nội",
    logo: require("../../assets/images/Viettel.png"),
  },
  {
    id: "j4",
    title: "Ruby on Rails Developer",
    company: "ANDPAD Vietnam",
    salary: "$1,500 - $2,500",
    tags: ["Ruby", "AWS", "Agile"],
    location: "Hồ Chí Minh",
    logo: require("../../assets/images/andpad.png"),
  },
];

// --- DỮ LIỆU BÀI VIẾT NỔI BẬT ---
const FEATURED_ARTICLES = [
  {
    id: "a1",
    title: "MB tuổi 30: Sẵn sàng cho khát vọng “làm chủ 100% công nghệ”",
    sub: "Lựa chọn đầu tư quyết liệt và toàn diện vào công nghệ đã đưa MB từng bước vươn lên thần tốc trong cuộc đua chuyển đổi số trong lĩnh vực tài chính – ngân hàng. Ở tuổi 30, MB tiếp…",
    image:
      "https://itviec.com/blog/wp-content/uploads/2024/06/mb-chuyen-doi-so-lam-chu-cong-nghe-01-vippro.jpg",
  },
  {
    id: "a2",
    title: "Top 15+ framework back-end, front-end và mobile phổ biến nhất 2025",
    sub: "Là một lập trình viên, bạn không cần phải phát triển mọi ứng dụng lại từ đầu bởi vì đã có các công cụ được thiết kế để hỗ trợ bạn, framework là một trong những công cụ hữu dụng…",
    image:
      "https://itviec.com/blog/wp-content/uploads/2022/05/framework-la-gi-thumbnail.jpg",
  },
  {
    id: "a3",
    title: "Kỹ năng mềm - Chìa khóa để vượt qua vòng phỏng vấn NAB",
    sub: "Lắng nghe chia sẻ từ các Tech Lead về văn hóa làm việc Agile...",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500",
  },
];

const HomeScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // STATE CHO MODAL ĐỊA ĐIỂM
  const [selectedLoc, setSelectedLoc] = useState("HCM");
  const [showLocModal, setShowLocModal] = useState(false);
  const LOCATIONS = [
    "Tất cả",
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
  ];

  // ANIMATIONS
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -SCROLL_DISTANCE],
    extrapolate: "clamp",
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const contentScale = scrollY.interpolate({
    inputRange: [-100, 0, SCROLL_DISTANCE / 2],
    outputRange: [1.05, 1, 0.95],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* 1. ANIMATED HEADER */}
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <LinearGradient
          colors={["#8B0000", "#5A0000", "#2b0000"]}
          style={styles.headerBG}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <View style={styles.topRow}>
              <View style={styles.topRowLeft}>
                <TouchableOpacity>
                  <Ionicons name="menu" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.logo}>
                  it<Text style={{ color: "#FFF" }}>viec</Text>
                </Text>
              </View>
              <View style={styles.topRowRight}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="chatbubbles-outline" size={22} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#FFF"
                  />
                  <View style={styles.notiBadge} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Go to Login")}>
                  <Text style={styles.loginText}>Đăng Nhập</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ scale: contentScale }],
              }}
            >
              <Text style={styles.greetingText}>
                Chào buổi sáng, <Text style={{ fontWeight: "bold" }}>An!</Text>
              </Text>
              <Text style={styles.subGreeting}>
                Hãy tìm bến đỗ IT tiếp theo của bạn.
              </Text>

              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#888"
                  style={{ marginLeft: 10 }}
                />
                <TextInput
                  placeholder="Kỹ năng, vị trí, công ty..."
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.filterBtn}
                  onPress={() => setShowLocModal(true)}
                >
                  <Ionicons name="location-outline" size={18} color="#8B0000" />
                  <Text style={styles.filterBtnText} numberOfLines={1}>
                    {selectedLoc}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagSection}
              >
                {["React Native", "Java", "NodeJS", "Tester", "AWS"].map(
                  (tag) => (
                    <TouchableOpacity key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* 2. BODY SCROLL */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainBody}>
          {/* QUICK MENU */}
          <View style={styles.gridMenu}>
            <MenuIcon
              label="Tìm việc"
              icon="briefcase-search"
              color="#2196F3"
            />
            <MenuIcon
              label="Tạo CV"
              icon="file-document-edit"
              color="#4CAF50"
            />
            <MenuIcon label="Công ty" icon="office-building" color="#FF9800" />
            <MenuIcon
              label="Lương IT"
              icon="finance"
              color="#E91E63"
              badge="NEW"
            />
          </View>

          {/* VIỆC LÀM HOT */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Việc làm HOT</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {HOT_JOBS.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.hotJobCard}
                activeOpacity={0.8}
              >
                <View style={styles.hotJobTop}>
                  <Image
                    source={job.logo}
                    style={styles.hotJobLogo}
                    resizeMode="contain"
                  />
                  <View style={styles.hotJobBadge}>
                    <Text style={styles.hotJobBadgeText}>HOT</Text>
                  </View>
                </View>
                <Text style={styles.hotJobTitle} numberOfLines={2}>
                  {job.title}
                </Text>
                <Text style={styles.hotJobCompany} numberOfLines={1}>
                  {job.company}
                </Text>
                <Text style={styles.hotJobSalary}>{job.salary}</Text>
                <View style={styles.tagRow}>
                  {job.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.smallTag}>
                      <Text style={styles.smallTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* NHÀ TUYỂN DỤNG HÀNG ĐẦU */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Top Nhà tuyển dụng</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {TOP_EMPLOYERS.map((employer) => (
              <TouchableOpacity
                key={employer.id}
                style={styles.employerCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("CompanyDetail", { item: employer })
                }
              >
                <Image
                  source={employer.logo}
                  style={styles.eLogo}
                  resizeMode="contain"
                />
                <Text style={styles.eName} numberOfLines={1}>
                  {employer.name}
                </Text>
                <View style={styles.eLocRow}>
                  <Ionicons name="location" size={12} color="#999" />
                  <Text style={styles.eLoc}>{employer.location}</Text>
                </View>
                <View style={styles.eBtn}>
                  <Text style={styles.eBtnText}>{employer.jobs} Việc làm</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* BANNER NỔI BẬT */}
          <TouchableOpacity style={styles.bannerCard} activeOpacity={0.9}>
            <LinearGradient
              colors={["#FFF3E0", "#FFE0B2"]}
              style={styles.bannerGradient}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  Báo cáo thị trường IT 2026
                </Text>
                <Text style={styles.bannerSub}>
                  Tải ngay để biết mình có bị "hớ" lương?
                </Text>
              </View>
              <Image
                source={{
                  uri: "https://cdn3d.iconscout.com/3d/premium/thumb/report-4993855-4162402.png",
                }}
                style={styles.bannerImg}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* BÀI VIẾT NỔI BẬT */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Cẩm nang nghề nghiệp</Text>
          </View>
          {FEATURED_ARTICLES.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: article.image }}
                style={styles.articleImg}
              />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.articleSub} numberOfLines={2}>
                  {article.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* 3. MODAL CHỌN ĐỊA ĐIỂM */}
      <Modal visible={showLocModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocModal(false)}
        >
          <View style={styles.locModalContent}>
            <Text style={styles.locModalTitle}>Chọn khu vực</Text>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={styles.locItem}
                onPress={() => {
                  setSelectedLoc(loc);
                  setShowLocModal(false);
                }}
              >
                <Text
                  style={[
                    styles.locItemText,
                    selectedLoc === loc && styles.locItemTextActive,
                  ]}
                >
                  {loc}
                </Text>
                {selectedLoc === loc && (
                  <Ionicons name="checkmark-circle" size={22} color="#8B0000" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- COMPONENT CON CHO MENU ---
const MenuIcon = ({ label, icon, color, badge }) => (
  <TouchableOpacity style={styles.menuBox}>
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    zIndex: 10,
  },
  headerBG: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 50,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  topRowLeft: { flexDirection: "row", alignItems: "center" },
  topRowRight: { flexDirection: "row", alignItems: "center" },
  logo: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
    marginLeft: 15,
    letterSpacing: -1,
  },
  iconBtn: { marginLeft: 15, position: "relative" },
  notiBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: "#FFC107",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  loginText: {
    color: "#FFF",
    marginLeft: 15,
    fontWeight: "bold",
    fontSize: 15,
  },

  greetingText: { color: "#FFF", fontSize: 20, marginTop: 10 },
  subGreeting: {
    color: "#FFCDD2",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 20,
  },

  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    paddingRight: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 14, color: "#333" },
  divider: {
    width: 1,
    height: 25,
    backgroundColor: "#EEE",
    marginHorizontal: 5,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 100,
  },
  filterBtnText: {
    color: "#8B0000",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },

  tagSection: { marginTop: 15, flexDirection: "row" },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  mainBody: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    paddingTop: 75,
  },

  gridMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuBox: { alignItems: "center", width: "22%" },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E91E63",
    paddingHorizontal: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
  menuLabel: {
    fontSize: 11,
    textAlign: "center",
    color: "#444",
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1A1C1E" },
  seeAllText: { color: "#8B0000", fontSize: 13, fontWeight: "bold" },
  horizontalScroll: { paddingLeft: 20, paddingBottom: 15 },

  hotJobCard: {
    width: 240,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  hotJobTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  hotJobLogo: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  hotJobBadge: {
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hotJobBadgeText: { color: "#8B0000", fontSize: 10, fontWeight: "bold" },
  hotJobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 4,
  },
  hotJobCompany: { fontSize: 12, color: "#666", marginBottom: 8 },
  hotJobSalary: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tagRow: { flexDirection: "row" },
  smallTag: {
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  smallTagText: { fontSize: 10, color: "#555", fontWeight: "500" },

  employerCard: {
    width: 150,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  eLogo: { width: 60, height: 60, marginBottom: 12 },
  eName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  eLocRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  eLoc: { fontSize: 11, color: "#888", marginLeft: 4 },
  eBtn: {
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  eBtnText: { color: "#8B0000", fontWeight: "bold", fontSize: 11 },

  bannerCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },
  bannerGradient: { flexDirection: "row", padding: 20, alignItems: "center" },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E65100",
    marginBottom: 5,
  },
  bannerSub: { fontSize: 12, color: "#F57C00", lineHeight: 18 },
  bannerImg: { width: 70, height: 70 },

  articleCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  articleImg: { width: 90, height: 90, borderRadius: 10 },
  articleContent: { flex: 1, paddingLeft: 12, justifyContent: "center" },
  articleTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1A1C1E",
    marginBottom: 6,
    lineHeight: 20,
  },
  articleSub: { fontSize: 12, color: "#666", lineHeight: 16 },

  // STYLE CHO MODAL ĐỊA ĐIỂM
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  locModalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  locModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
    color: "#1A1C1E",
  },
  locItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  locItemText: { fontSize: 16, color: "#444", fontWeight: "500" },
  locItemTextActive: { color: "#8B0000", fontWeight: "800" },
});

export default HomeScreen;
