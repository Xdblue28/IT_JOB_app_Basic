import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// DỮ LIỆU VIỆC LÀM (Lấy từ sidebar trong ảnh của bạn)
const JOBS_DATA = [
  {
    id: "j1",
    title: "(Senior) QA Engineer (Tester, Japanese N2+)",
    salary: "Sign in to view salary",
    tags: ["QA QC", "Leadership", "Scrum", "Japanese"],
    type: "Hybrid",
  },
  {
    id: "j2",
    title: "Principal Frontend Engineer (ReactJS/VueJS)",
    salary: "Sign in to view salary",
    tags: ["ReactJS", "Unit test", "VueJS", "Microservices"],
    type: "Hybrid",
  },
  {
    id: "j3",
    title: "Senior Golang Developer (Backend, AWS, MySQL)",
    salary: "Sign in to view salary",
    tags: ["Golang", "Design Systems", "Unit test", "AI"],
    type: "Hybrid",
  },
];

const CompanyDetailScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  // COMPONENT CON: THÔNG TIN CHUNG
  const GeneralInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>General information</Text>
      <View style={styles.infoGrid}>
        <InfoItem icon="business" label="Company type" value="IT Product" />
        <InfoItem icon="groups" label="Company size" value="51-150" />
        <InfoItem icon="public" label="Country" value="Japan" />
        <InfoItem icon="event-note" label="Working days" value="Mon - Fri" />
      </View>
    </View>
  );

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoBox}>
      <MaterialIcons name={icon} size={20} color="#D32F2F" />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // COMPONENT CON: CARD CÔNG VIỆC
  const renderJobItem = ({ item }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Image
          source={require("../../assets/images/ANDPAD.PNG")}
          style={styles.miniLogo}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.jobSalary}>{item.salary}</Text>
        </View>
      </View>
      <View style={styles.tagRow}>
        {item.tags.map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.jobFooter}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.jobLocText}>
          {item.type} • Ho Chi Minh - Ha Noi
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER & HERO SECTION */}
      <View style={styles.heroSection}>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#FFF" />
        </View>

        <View style={styles.companyHeader}>
          <View style={styles.logoSquare}>
            <Image
              source={require("../../assets/images/ANDPAD.PNG")}
              style={styles.mainLogo}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.companyName}>ANDPAD VietNam Co., Ltd</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingScore}>4.8</Text>
              <Ionicons name="star" size={14} color="#FFB400" />
              <Text style={styles.reviewCount}>(12 reviews)</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Write review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Follow</Text>
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
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT AREA */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "Overview" ? (
          <View style={{ padding: 20 }}>
            <GeneralInfo />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company overview</Text>
              <Text style={styles.descriptionText}>
                No.1 Construction Tech Company in Japan. Our parent company,
                ANDPAD Inc., is No.1 cloud-based construction tech company...
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeMore}>Read more</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our key skills</Text>
              <View style={styles.skillRow}>
                {["Golang", "QA QC", "Ruby", "MySQL", "AWS"].map((s) => (
                  <View key={s} style={styles.skillChip}>
                    <Text style={styles.skillText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.mapMock}>
                <Ionicons name="map" size={40} color="#CCC" />
                <Text style={styles.mapText}>View Map Address</Text>
              </View>
              <Text style={styles.addressText}>
                3rd Floor, Dang Nhan Building, 90 Nguyen Dinh Chieu, Ho Chi Minh
              </Text>
            </View>
          </View>
        ) : activeTab === "Jobs" ? (
          <FlatList
            data={JOBS_DATA}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#DDD" />
            <Text style={styles.emptyText}>No reviews yet on mobile view</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  heroSection: { backgroundColor: "#1A1A1A", paddingBottom: 20 },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
  },
  companyHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoSquare: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mainLogo: { width: 60, height: 60 },
  companyName: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingScore: { color: "#FFF", fontWeight: "bold", marginRight: 5 },
  reviewCount: { color: "#AAA", fontSize: 12, marginLeft: 5 },

  actionRow: { flexDirection: "row", paddingHorizontal: 20, marginTop: 20 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#D32F2F",
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "bold" },
  secondaryBtn: {
    width: 100,
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "600" },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tabItem: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#D32F2F" },
  tabText: { color: "#666", fontWeight: "600" },
  activeTabText: { color: "#D32F2F" },

  // Sections
  section: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoBox: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoLabel: { fontSize: 11, color: "#999" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#444" },
  descriptionText: { lineHeight: 22, color: "#555" },
  seeMore: { color: "#D32F2F", fontWeight: "bold", marginTop: 10 },
  skillRow: { flexDirection: "row", flexWrap: "wrap" },
  skillChip: {
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: { fontSize: 12, color: "#475467" },
  mapMock: {
    height: 150,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mapText: { color: "#999", marginTop: 10 },
  addressText: { color: "#666", fontSize: 13, lineHeight: 18 },

  // Jobs Tab
  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  jobHeader: { flexDirection: "row" },
  miniLogo: { width: 40, height: 40, borderRadius: 8 },
  jobTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  jobSalary: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tag: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 10, color: "#666" },
  jobFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 10,
  },
  jobLocText: { marginLeft: 5, fontSize: 12, color: "#666" },

  emptyContainer: { flex: 1, padding: 50, alignItems: "center" },
  emptyText: { marginTop: 10, color: "#999" },
});

export default CompanyDetailScreen;
