import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Bell, Edit2, Plus, User } from "lucide-react-native";

const { width } = Dimensions.get("window");

const InfoRow = ({ label, value, isLink }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
    <Text style={[styles.infoValue, isLink && styles.linkText]}>{value}</Text>
  </View>
);

export default function CompanyProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <User size={18} color="#fff" />
        </View>
        <Text style={styles.brandText}>PRECISION</Text>
        <Bell size={24} color="#374151" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.categoryTitle}>ACCOUNT SETTINGS</Text>
        <Text style={styles.mainTitle}>Company Profile</Text>

        {/* Section: Visual Identity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Visual Identity</Text>
          <TouchableOpacity style={styles.editButton}>
            <Edit2 size={14} color="#dc2626" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.visualContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1497366216548-37526070297c",
            }}
            style={styles.coverImage}
          />
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>P.</Text>
          </View>
        </View>
        <Text style={styles.helperText}>
          Your visual identity is displayed on all job postings and candidate
          touchpoints.
        </Text>

        {/* Section: Company Overview */}
        <Text
          style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          Company Overview
        </Text>
        <View style={styles.overviewCard}>
          <InfoRow label="Legal Name" value="Google" />
          <InfoRow label="Headquarters" value="New York" />
          <InfoRow label="Company Size" value="500-1000 employers" />
          <InfoRow label="Website" value="https://www.google.com" isLink />
        </View>

        {/* Section: Expertise */}
        <Text
          style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}
        >
          Our Expertise
        </Text>
        <View style={styles.tagContainer}>
          {["AI", "Web Application", "Embedded"].map((tag, i) => (
            <View
              key={i}
              style={[styles.expertTag, i === 0 && styles.activeExpertTag]}
            >
              <Text
                style={[
                  styles.expertTagText,
                  i === 0 && styles.activeExpertTagText,
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addTagButton}>
            <Plus size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Section: Culture Gallery */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Culture Gallery</Text>
          <Text style={styles.photoCount}>8 photos</Text>
        </View>
        <View style={styles.galleryGrid}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
            }}
            style={styles.galleryImage}
          />
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
            }}
            style={styles.galleryImage}
          />
          <View style={styles.morePhotosContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1497215842964-222925615a41",
              }}
              style={[styles.galleryImage, { width: "100%", marginBottom: 0 }]}
            />
            <View style={styles.overlayMore}>
              <Text style={styles.overlayText}>+5 more</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.publishButton}>
          <Text style={styles.publishButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", marginTop: "10%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontWeight: "800",
    fontSize: 18,
    color: "#dc2626",
    letterSpacing: 1,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  editButton: { flexDirection: "row", alignItems: "center" },
  editButtonText: {
    color: "#dc2626",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 14,
  },

  visualContainer: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "visible",
    marginBottom: 25,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#1e293b",
  },
  logoBadge: {
    position: "absolute",
    bottom: -15,
    left: 15,
    width: 60,
    height: 60,
    backgroundColor: "#b91c1c",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  logoText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  helperText: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 5 },

  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  infoRow: { marginBottom: 15 },
  infoLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoValue: { fontSize: 14, color: "#1f2937", fontWeight: "600" },
  linkText: { color: "#dc2626", textDecorationLine: "underline" },

  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  expertTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  activeExpertTag: { backgroundColor: "#dc2626" },
  expertTagText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  activeExpertTagText: { color: "#fff" },
  addTagButton: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  photoCount: { fontSize: 12, color: "#94a3b8" },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImage: {
    width: "48%",
    height: 140,
    borderRadius: 12,
    marginBottom: 15,
  },
  morePhotosContainer: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  overlayMore: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(185, 28, 28, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  publishButton: {
    backgroundColor: "#b91c1c",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  publishButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
