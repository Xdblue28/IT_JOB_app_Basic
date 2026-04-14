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
  LayoutAnimation,
  UIManager,
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
      {/* 1. ANIMATED HEADER */}
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

      {/* 2. SCROLLABLE CONTENT */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* PHẦN THÂN TRẮNG ĐÃ ĐƯỢC CHỈNH SỬA */}
        <View style={styles.mainBody}>
          {/* Grid Menu */}
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
            <Text style={styles.wideBtnText}>Báo cáo lương IT 2024</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Nhà tuyển dụng hàng đầu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            <EmployerCard
              logo="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Grab.svg/2560px-Logo_Grab.svg.png"
              name="Grab (Vietnam) Ltd."
              location="TP Hồ Chí Minh"
            />
            <EmployerCard
              logo="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Viettel_logo_2021.svg/1200px-Viettel_logo_2021.svg.png"
              name="Viettel Group"
              location="Hà Nội"
            />
          </ScrollView>

          <Text style={styles.sectionTitle}>Bài viết nổi bật</Text>
          <View style={styles.articleCard}>
            <Image
              source={{
                uri: "https://itviec.com/blog/wp-content/uploads/2023/12/itviec-launch-premium-recruitment-consulting-blog-vi.jpg",
              }}
              style={styles.articleImg}
            />
            <View style={styles.articleContent}>
              <Text style={styles.articleTitle}>
                Dịch vụ tư vấn tuyển dụng IT cao cấp mới từ ITviec
              </Text>
              <Text style={styles.articleSub}>
                Nâng tầm sự nghiệp của bạn với các chuyên gia hàng đầu...
              </Text>
            </View>
          </View>
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

const EmployerCard = ({ logo, name, location }) => (
  <View style={styles.eCard}>
    <Image source={{ uri: logo }} style={styles.eLogo} resizeMode="contain" />
    <Text style={styles.eName}>{name}</Text>
    <Text style={styles.eLoc}>{location}</Text>
    <TouchableOpacity style={styles.eBtn}>
      <Text style={styles.eBtnText}>3 Việc làm {">"}</Text>
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

  // --- STYLE CHÍNH CHO PHẦN THÂN ---
  mainBody: {
    backgroundColor: "#FFF", // Dùng màu trắng thuần cho sạch
    borderTopLeftRadius: 50, // Bo tròn sâu hơn
    borderTopRightRadius: 50, // Bo tròn sâu hơn
    marginTop: -50, // Đẩy phần trắng lấn lên trên Header
    paddingHorizontal: 20,
    paddingTop: 80, // <--- QUAN TRỌNG: Tăng cái này để kéo dài khoảng trắng phía trên menu
    minHeight: 1000,
    // Thêm đổ bóng để phần trắng trông nổi bật hơn (giống Hình 2)
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
    paddingVertical: 25, // Tăng padding để ô menu cao hơn
    borderRadius: 30, // Bo tròn các ô menu
    alignItems: "center",
    marginBottom: 20,
    // Đổ bóng nhẹ cho từng ô
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 65, // Làm vòng tròn chứa icon to hơn
    height: 65,
    borderRadius: 33,
    backgroundColor: "#FFF5F5", // Màu nền đỏ nhạt cực nhẹ cho icon
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
  },
  articleImg: { width: "100%", height: 200 },
  articleContent: { padding: 20 },
  articleTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSub: { fontSize: 13, color: "#666", lineHeight: 18 },
});

export default HomeScreen;
