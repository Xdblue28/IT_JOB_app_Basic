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
  Modal,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

// 1. DỮ LIỆU CÔNG TY CẬP NHẬT THEO FILE ẢNH CỦA BẠN
const COMPANIES_DATA = [
  {
    id: "1",
    name: "NAB Innovation Centre",
    logo: require("../../assets/images/NAB.png"), // Khớp với NAB.png
    tags: ["Java", "ReactJS", "Cloud"],
    locations: ["HN", "HCM"],
    jobCount: 17,
    minSalary: 2000,
    maxSalary: 4500,
    level: "Senior",
  },
  {
    id: "2",
    name: "Viettel Group",
    logo: require("../../assets/images/Viettel.png"), // Khớp với Viettel.png
    tags: ["Telecom", "5G", "Network"],
    locations: ["HN", "HCM", "DN"],
    jobCount: 85,
    minSalary: 1200,
    maxSalary: 3500,
    level: "Middle",
  },
  {
    id: "3",
    name: "NAVER Vietnam",
    logo: require("../../assets/images/NAVERVN.png"), // Khớp với NAVERVN.png
    tags: ["Search Engine", "AI", "Frontend"],
    locations: ["HCM"],
    jobCount: 12,
    minSalary: 1800,
    maxSalary: 4000,
    level: "Senior",
  },
  {
    id: "4",
    name: "ANDPAD Vietnam",
    logo: require("../../assets/images/andpad.png"),
    tags: ["Construction Tech", "Ruby", "React"],
    locations: ["HCM"],
    jobCount: 8,
    minSalary: 1500,
    maxSalary: 3000,
    level: "Middle",
  },
  {
    id: "5",
    name: "OTS Technology",
    logo: require("../../assets/images/OTSTECH.png"), // Khớp với OTSTECH.png
    tags: ["Outsourcing", "NodeJS", "Vue"],
    locations: ["DN"],
    jobCount: 20,
    minSalary: 800,
    maxSalary: 2200,
    level: "Junior",
  },
  {
    id: "6",
    name: "Crosian",
    logo: require("../../assets/images/Crosian.png"), // Khớp với Crosian.png
    tags: ["Software", "PHP", "Laravel"],
    locations: ["HCM"],
    jobCount: 5,
    minSalary: 1000,
    maxSalary: 2500,
    level: "Middle",
  },
  {
    id: "7",
    name: "TMT Solutions",
    logo: require("../../assets/images/TMT.png"), // Khớp với TMT.png
    tags: ["Mobile App", "Flutter", "Firebase"],
    locations: ["HN"],
    jobCount: 14,
    minSalary: 700,
    maxSalary: 1800,
    level: "Fresher",
  },
];

const LOCATIONS = ["Tất cả", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng"];
const LEVELS = ["Fresher", "Junior", "Middle", "Senior"];
const ALL_TECHS = [
  "Java",
  "NodeJS",
  "ReactJS",
  ".NET",
  "React Native",
  "Python",
  "Go",
  "Flutter",
  "AWS",
  "SQL",
  "C#",
  "C++",
];

const CompaniesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [filterLoc, setFilterLoc] = useState("Tất cả");
  const [filterLevel, setFilterLevel] = useState("");
  const [techSearch, setTechSearch] = useState("");
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFilterLoc("Tất cả");
        setFilterLevel("");
        setSelectedTechs([]);
        setSalaryRange({ min: "", max: "" });
        setSearchQuery("");
        setTechSearch("");
      };
    }, []),
  );

  const techSuggestions = useMemo(() => {
    if (!techSearch) return [];
    return ALL_TECHS.filter(
      (t) =>
        t.toLowerCase().includes(techSearch.toLowerCase()) &&
        !selectedTechs.includes(t),
    );
  }, [techSearch, selectedTechs]);

  const filteredCompanies = useMemo(() => {
    return COMPANIES_DATA.filter((co) => {
      const matchSearch = co.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchLoc =
        filterLoc === "Tất cả" ||
        co.locations.some((l) => l.includes(filterLoc.substring(0, 2)));
      const matchLevel = !filterLevel || co.level === filterLevel;
      const matchTech =
        selectedTechs.length === 0 ||
        selectedTechs.some((t) => co.tags.includes(t));
      const minS = parseInt(salaryRange.min) || 0;
      const maxS = parseInt(salaryRange.max) || 99999;
      const matchSalary = co.maxSalary >= minS && co.minSalary <= maxS;
      return matchSearch && matchLoc && matchLevel && matchTech && matchSalary;
    });
  }, [searchQuery, filterLoc, filterLevel, selectedTechs, salaryRange]);

  const removeTech = (tech) =>
    setSelectedTechs((prev) => prev.filter((t) => t !== tech));

  const renderCompanyCard = ({ item }) => (
    <TouchableOpacity style={styles.compactCard} activeOpacity={0.7}>
      <View style={styles.cardMain}>
        <Image
          // GIẢI PHÁP "BẤT TỬ": Tự nhận diện require (số) hoặc URL (chuỗi)
          source={
            typeof item.logo === "string" ? { uri: item.logo } : item.logo
          }
          style={styles.miniLogo}
          resizeMode="contain"
        />
        <View style={styles.infoContent}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.locationSmall}>{item.locations.join(" • ")}</Text>
          <View style={styles.tagRow}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.smallTag}>
                <Text style={styles.smallTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.jobBadge}>
          <View style={styles.dot} />
          <Text style={styles.jobCount}>{item.jobCount} Việc làm đang mở</Text>
        </View>
        <Text style={styles.salaryRangeText}>
          ${item.minSalary}-${item.maxSalary}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Tìm công ty..."
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterIcon}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="filter" size={24} color="#D32F2F" />
          {(filterLoc !== "Tất cả" ||
            filterLevel ||
            selectedTechs.length > 0 ||
            salaryRange.min) && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCompanies}
        renderItem={renderCompanyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFilter}
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="arrow-back" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity
                onPress={() => {
                  setFilterLoc("Tất cả");
                  setFilterLevel("");
                  setSelectedTechs([]);
                  setSalaryRange({ min: "", max: "" });
                }}
              >
                <Text style={styles.resetText}>Xóa</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Địa điểm</Text>
              <View style={styles.row}>
                {LOCATIONS.map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.chip, filterLoc === l && styles.activeChip]}
                    onPress={() => setFilterLoc(l)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filterLoc === l && styles.activeText,
                      ]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Cấp bậc chuyên môn</Text>
              <View style={styles.row}>
                {LEVELS.map((lv) => (
                  <TouchableOpacity
                    key={lv}
                    style={[
                      styles.chip,
                      filterLevel === lv && styles.activeChip,
                    ]}
                    onPress={() => setFilterLevel(lv)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filterLevel === lv && styles.activeText,
                      ]}
                    >
                      {lv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Ngôn ngữ & Công nghệ</Text>
              <View style={styles.selectedTechWrapper}>
                {selectedTechs.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.selectedTechChip}
                    onPress={() => removeTech(t)}
                  >
                    <Text style={{ color: "#FFF", fontSize: 12 }}>{t} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                placeholder="Nhập ngôn ngữ (VD: Java, NodeJS...)"
                style={styles.techInput}
                value={techSearch}
                onChangeText={setTechSearch}
              />
              {techSuggestions.length > 0 && (
                <View style={styles.suggestionContainer}>
                  {techSuggestions.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setSelectedTechs([...selectedTechs, t]);
                        setTechSearch("");
                      }}
                    >
                      <Text>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Mức lương mong muốn ($)</Text>
              <View style={styles.salaryRow}>
                <TextInput
                  placeholder="Từ"
                  keyboardType="numeric"
                  style={styles.salaryField}
                  value={salaryRange.min}
                  onChangeText={(v) =>
                    setSalaryRange({ ...salaryRange, min: v })
                  }
                />
                <View style={styles.dash} />
                <TextInput
                  placeholder="Đến"
                  keyboardType="numeric"
                  style={styles.salaryField}
                  value={salaryRange.max}
                  onChangeText={(v) =>
                    setSalaryRange({ ...salaryRange, max: v })
                  }
                />
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilter(false)}
              >
                <Text style={styles.applyText}>Áp dụng bộ lọc</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    alignItems: "center",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },
  filterIcon: { marginLeft: 15, position: "relative" },
  activeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  list: { padding: 16 },
  compactCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
  },
  cardMain: { flexDirection: "row", alignItems: "center" },
  miniLogo: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
  },
  infoContent: { flex: 1, marginLeft: 15 },
  companyName: { fontSize: 16, fontWeight: "700", color: "#1A1C1E" },
  locationSmall: { fontSize: 12, color: "#666", marginTop: 2 },
  tagRow: { flexDirection: "row", marginTop: 8 },
  smallTag: {
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  smallTagText: { fontSize: 10, color: "#444", fontWeight: "500" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#F0F0F0",
  },
  jobBadge: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  jobCount: { fontSize: 12, fontWeight: "600", color: "#333" },
  salaryRangeText: { fontSize: 13, fontWeight: "bold", color: "#2E7D32" },
  modalContainer: { flex: 1, backgroundColor: "#FFF" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  resetText: { color: "#D32F2F", fontWeight: "600" },
  modalBody: { padding: 20 },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 12,
    color: "#333",
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    marginBottom: 10,
  },
  activeChip: { backgroundColor: "#1A1C1E" },
  chipText: { color: "#666", fontSize: 13 },
  activeText: { color: "#FFF" },
  selectedTechWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  selectedTechChip: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  techInput: {
    borderBottomWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 10,
    fontSize: 15,
  },
  suggestionContainer: {
    backgroundColor: "#FFF",
    maxHeight: 150,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  salaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  salaryField: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 12,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  dash: { width: 15, height: 1, backgroundColor: "#CCC", marginHorizontal: 10 },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: "#EEE" },
  applyBtn: {
    backgroundColor: "#D32F2F",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});

export default CompaniesScreen;
