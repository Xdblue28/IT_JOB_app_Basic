import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Dữ liệu giả lập (Mock Data)
const JOBS_DATA = [
  {
    id: "1",
    title: "Senior Java Developer (Spring Boot)",
    company: "Grab (Vietnam) Ltd.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Grab.svg/2560px-Logo_Grab.svg.png",
    location: "TP. Hồ Chí Minh",
    salary: "Thoả thuận",
    tags: ["Java", "Spring Boot", "AWS"],
    time: "2 giờ trước",
    isHot: true,
  },
  {
    id: "2",
    title: "Frontend Engineer (ReactJS, NextJS)",
    company: "Viettel Group",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Viettel_logo_2021.svg/1200px-Viettel_logo_2021.svg.png",
    location: "Hà Nội",
    salary: "$1,500 - $2,500",
    tags: ["ReactJS", "TypeScript", "Tailwind"],
    time: "5 giờ trước",
    isHot: false,
  },
  {
    id: "3",
    title: "Fullstack .NET Developer",
    company: "VNG Corporation",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x-0E5nE-uKj57D0t3n3T9_3T68k5hX6n-A&s",
    location: "TP. Hồ Chí Minh",
    salary: "Up to $3,000",
    tags: [".NET 8", "C#", "SQL Server"],
    time: "1 ngày trước",
    isHot: true,
  },
];

const CompaniesScreen = ({ navigation }) => {
  // Linh kiện cho mỗi thẻ công việc
  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CompanyDetail")} // Nhảy sang trang chi tiết Grab bạn đã làm
    >
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.logo }}
          style={styles.companyLogo}
          resizeMode="contain"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.companyName}>{item.company}</Text>
        </View>
        {item.isHot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color="#4CAF50" />
          <Text style={styles.salaryText}>{item.salary}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      <View style={styles.tagContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.timeText}>{item.time}</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 1. THANH TÌM KIẾM CỐ ĐỊNH */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Tìm kiếm công việc, công ty..."
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* 2. DANH SÁCH CÔNG VIỆC */}
      <FlatList
        data={JOBS_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Search Header
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    elevation: 2,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F1F3F4",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  filterBtn: { marginLeft: 15, padding: 5 },

  // Card Style
  listPadding: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    // Đổ bóng hiện đại
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  companyName: { fontSize: 13, color: "#666" },
  hotBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hotText: { color: "#E65100", fontSize: 10, fontWeight: "bold" },

  detailsRow: { flexDirection: "row", marginBottom: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  salaryText: {
    marginLeft: 5,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  locationText: { marginLeft: 5, fontSize: 13, color: "#666" },

  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  tag: {
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: { color: "#475467", fontSize: 12, fontWeight: "500" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F3F4",
    paddingTop: 12,
  },
  timeText: { fontSize: 11, color: "#999" },
});

export default CompaniesScreen;
