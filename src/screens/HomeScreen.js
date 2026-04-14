import React, { useRef, useState, useCallback } from "react";
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
  LayoutAnimation,
  UIManager,
  SafeAreaView,
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
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 100;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// --- DỮ LIỆU CÔNG TY HÀNG ĐẦU (Đồng bộ với assets) ---
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
    jobs: 85,
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

const HomeScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCity, setSelectedCity] = useState("Tất cả thành phố");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -SCROLL_DISTANCE],
    extrapolate: "clamp",
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 1.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    toggleDropdown();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <LinearGradient colors={["#8B0000", "#000000"]} style={styles.headerBG}>
          <View style={styles.topRow}>
            <View style={styles.topRowLeft}>
              <Ionicons name="menu" size={28} color="#FFF" />
              <Text style={styles.logo}>
                it<Text style={{ color: "#FFF" }}>viec</Text>
              </Text>
            </View>
            <View style={styles.topRowRight}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color="#FFF"
                style={{ marginRight: 15 }}
              />
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <Text style={styles.loginText}>Đăng Nhập</Text>
            </View>
          </View>

          <Animated.View style={{ opacity: contentOpacity }}>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.citySelector}
                onPress={toggleDropdown}
              >
                <Ionicons name="location-sharp" size={18} color="#999" />
                <Text style={styles.cityText}>{selectedCity}</Text>
                <MaterialIcons
                  name={
                    isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
              {isDropdownOpen && (
                <View style={styles.dropdownList}>
                  {["Tất cả thành phố", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].map(
                    (city) => (
                      <TouchableOpacity
                        key={city}
                        style={styles.dropdownItem}
                        onPress={() => selectCity(city)}
                      >
                        <Text style={styles.dropdownItemText}>{city}</Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              )}
            </View>

            <View style={styles.searchBar}>
              <TextInput
                placeholder="Nhập từ khoá kỹ năng..."
                placeholderTextColor="#999"
                style={styles.input}
              />
              <TouchableOpacity style={styles.searchBtn}>
                <Ionicons name="search" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagSection}>
              <Text style={styles.tagTitle}>Gợi ý cho bạn:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["Java", "ReactJS", ".NET", "Tester", "NodeJS", "PHP"].map(
                  (tag) => (
                    <TouchableOpacity key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

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
          <View style={styles.gridMenu}>
            <MenuIcon label="Tìm việc thụ động" icon="briefcase" badge="HOT" />
            <MenuIcon label="Mẫu CV chuẩn IT" icon="file-document" />
            <MenuIcon label="Story Hub" icon="trophy" badge="MỚI" />
            <MenuIcon label="Review công ty" icon="comment-edit" />
          </View>

          <TouchableOpacity style={styles.wideBtn}>
            <MaterialCommunityIcons
              name="trending-up"
              size={24}
              color="#F44336"
            />
            <Text style={styles.wideBtnText}>Báo cáo lương IT 2026</Text>
          </TouchableOpacity>

          {/* MỤC NHÀ TUYỂN DỤNG HÀNG ĐẦU */}
          <Text style={styles.sectionTitle}>Nhà tuyển dụng hàng đầu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {TOP_EMPLOYERS.map((employer) => (
              <EmployerCard
                key={employer.id}
                logo={employer.logo}
                name={employer.name}
                location={employer.location}
                jobs={employer.jobs}
              />
            ))}
          </ScrollView>

          {/* MỤC BÀI VIẾT NỔI BẬT */}
          <Text style={styles.sectionTitle}>Bài viết nổi bật</Text>
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
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSub}>{article.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

// --- COMPONENT CON ---
const MenuIcon = ({ label, icon, badge }) => (
  <TouchableOpacity style={styles.menuBox}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={28} color="#D32F2F" />
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const EmployerCard = ({ logo, name, location, jobs }) => (
  <View style={styles.eCard}>
    {/* CẬP NHẬT: Xử lý cả require và uri */}
    <Image
      source={typeof logo === "string" ? { uri: logo } : logo}
      style={styles.eLogo}
      resizeMode="contain"
    />
    <Text style={styles.eName} numberOfLines={1}>
      {name}
    </Text>
    <Text style={styles.eLoc}>{location}</Text>
    <TouchableOpacity style={styles.eBtn}>
      <Text style={styles.eBtnText}>
        {jobs} Việc làm {">"}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    zIndex: 10,
    elevation: 5,
  },
  headerBG: { flex: 1, padding: 20, paddingTop: 50 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  topRowLeft: { flexDirection: "row", alignItems: "center" },
  topRowRight: { flexDirection: "row", alignItems: "center" },
  logo: { color: "#FF0000", fontSize: 24, fontWeight: "bold", marginLeft: 10 },
  loginText: { color: "#FFF", marginLeft: 10, fontWeight: "600" },
  dropdownContainer: { zIndex: 100, marginBottom: 15 },
  citySelector: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cityText: { flex: 1, marginLeft: 10, color: "#333" },
  dropdownList: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginTop: 5,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 5,
    marginBottom: 15,
  },
  input: { flex: 1, paddingLeft: 10 },
  searchBtn: { backgroundColor: "#FF0000", padding: 10, borderRadius: 5 },
  tagSection: { marginTop: 5 },
  tagTitle: { color: "#FFF", marginBottom: 8, fontSize: 13 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: { color: "#FFF", fontSize: 12 },

  mainBody: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -50,
    paddingHorizontal: 20,
    paddingTop: 80,
    minHeight: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  gridMenu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuBox: {
    width: (width - 60) / 2,
    backgroundColor: "#FFF",
    paddingVertical: 25,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#E65100",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "bold" },
  menuLabel: {
    fontSize: 13,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
  wideBtn: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  wideBtnText: { marginLeft: 10, fontWeight: "bold", color: "#333" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#222",
  },
  horizontalScroll: { marginBottom: 10 },
  eCard: {
    width: 220,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#8B0000",
    elevation: 3,
    marginBottom: 10,
  },
  eLogo: { width: 50, height: 50, marginBottom: 10 },
  eName: { fontWeight: "bold", fontSize: 15, marginBottom: 5 },
  eLoc: { fontSize: 12, color: "#666", marginBottom: 10 },
  eBtnText: { color: "#D32F2F", fontWeight: "bold" },

  articleCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 20,
  },
  articleImg: { width: "100%", height: 180 },
  articleContent: { padding: 15 },
  articleTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSub: { fontSize: 13, color: "#666", lineHeight: 18 },
});

export default HomeScreen;
