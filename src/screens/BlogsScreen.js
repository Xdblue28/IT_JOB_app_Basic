import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// 1. DỮ LIỆU BLOG GIẢ LẬP
const BLOGS_DATA = [
  {
    id: "1",
    title: "Lộ trình trở thành Senior Java Developer năm 2026",
    category: "Sự nghiệp",
    author: "Admin ITJob",
    date: "12/04/2026",
    readTime: "5 phút đọc",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Tại sao nên học React Native thay vì Flutter?",
    category: "Kỹ thuật",
    author: "Tech Lead NAB",
    date: "10/04/2026",
    readTime: "8 phút đọc",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format",
  },
  {
    id: "3",
    title: "Cách deal lương nghìn đô cho các bạn Junior",
    category: "Kỹ năng",
    author: "HR VNG",
    date: "08/04/2026",
    readTime: "4 phút đọc",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format",
  },
  {
    id: "4",
    title: "Xu hướng AI trong tuyển dụng IT hiện nay",
    category: "Xu hướng",
    author: "AI Expert",
    date: "05/04/2026",
    readTime: "6 phút đọc",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format",
  },
];

const CATEGORIES = ["Tất cả", "Kỹ thuật", "Sự nghiệp", "Kỹ năng", "Xu hướng"];

const BlogsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  // RESET KHI QUAY LẠI MÀN HÌNH
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery("");
        setActiveCategory("Tất cả");
      };
    }, []),
  );

  // LOGIC LỌC BLOG
  const filteredBlogs = useMemo(() => {
    return BLOGS_DATA.filter((blog) => {
      const matchSearch = blog.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCat =
        activeCategory === "Tất cả" || blog.category === activeCategory;
      return matchSearch && matchCat && !blog.isFeatured; // Loại bài nổi bật ra để hiện riêng
    });
  }, [searchQuery, activeCategory]);

  const featuredBlog = BLOGS_DATA.find((b) => b.isFeatured);

  const renderBlogCard = ({ item }) => (
    <TouchableOpacity style={styles.blogCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.blogImage} />
      <View style={styles.blogContent}>
        <Text style={styles.blogCategory}>{item.category}</Text>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.blogFooter}>
          <Text style={styles.blogInfo}>
            {item.date} • {item.readTime}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* BÀI VIẾT NỔI BẬT */}
      {activeCategory === "Tất cả" && !searchQuery && featuredBlog && (
        <TouchableOpacity style={styles.featuredContainer} activeOpacity={0.9}>
          <Image
            source={{ uri: featuredBlog.image }}
            style={styles.featuredImage}
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Nổi bật</Text>
            </View>
            <Text style={styles.featuredTitle}>{featuredBlog.title}</Text>
            <Text style={styles.featuredSub}>
              {featuredBlog.author} • {featuredBlog.readTime}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      <Text style={styles.sectionTitle}>
        {searchQuery ? "Kết quả tìm kiếm" : "Bài viết mới nhất"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER SEARCH CỐ ĐỊNH (Tương đồng CompaniesScreen) */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Blog & Kiến thức</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Tìm bài viết, kiến thức..."
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* THANH LỌC CATEGORY */}
      <View style={{ backgroundColor: "#FFF" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                activeCategory === cat && styles.activeCatChip,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.activeCatText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBlogs}
        renderItem={renderBlogCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },

  // Header tinh chỉnh tránh camera
  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: "#FFF",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    alignItems: "center",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },

  // Category
  categoryList: { paddingHorizontal: 20, paddingBottom: 15 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
  },
  activeCatChip: { backgroundColor: "#D32F2F" },
  catText: { fontSize: 13, color: "#666", fontWeight: "600" },
  activeCatText: { color: "#FFF" },

  // List
  listPadding: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: 16,
    marginTop: 10,
  },

  // Featured Card (Card lớn phía trên)
  featuredContainer: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  featuredImage: { width: "100%", height: "100%" },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "flex-end",
  },
  featuredBadge: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  featuredTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 5,
  },
  featuredSub: { color: "#E0E0E0", fontSize: 12 },

  // Blog Card (Dạng ngang tinh gọn)
  blogCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  blogImage: { width: 90, height: 90, borderRadius: 12 },
  blogContent: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  blogCategory: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#D32F2F",
    textTransform: "uppercase",
  },
  blogTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1C1E",
    lineHeight: 20,
  },
  blogFooter: { marginTop: 5 },
  blogInfo: { fontSize: 12, color: "#999" },
});

export default BlogsScreen;
