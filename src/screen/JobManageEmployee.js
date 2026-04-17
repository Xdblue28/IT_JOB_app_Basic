import React, { useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TextInput,
    TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';
import { Search, SlidersHorizontal, Bell, User } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons'

// 1. TÁCH DỮ LIỆU MẪU (Mock Data)
const COLORS = {
    primary: '#8A000E'
}
const JOBS_DATA = [
    { id: '1', level: 'Senior Level', title: 'Principal Cloud Architect', tags: ['AWS', 'Terraform', 'Go'], salary: '$180k — $240k', applicants: '42', match: '98%' },
    { id: '2', level: 'Mid-Senior', title: 'Full Stack Engineer', tags: ['React', 'Node.js', 'PostgreSQL'], salary: '$140k — $195k', applicants: '119' },
    { id: '3', level: 'Lead', title: 'Mobile Product Lead', tags: ['Swift', 'Kotlin', 'GraphQL'], salary: '$165k — $210k', applicants: '24' },
    { id: '4', level: 'Junior', title: 'Frontend Developer', tags: ['TypeScript', 'Tailwind'], salary: '$80k — $110k', applicants: '255' },
];

// 2. COMPONENT CON (UI con)
const JobCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.card}>
        {item.match && (
            <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{item.match} MATCH</Text>
            </View>
        )}
        <Text style={styles.jobLevel}>{item.level.toUpperCase()}</Text>
        <Text style={styles.jobTitle}>{item.title}</Text>

        <View style={styles.tagContainer}>
            {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                </View>
            ))}
        </View>

        <View style={styles.cardFooter}>
            <View>
                <Text style={styles.footerLabel}>SALARY RANGE</Text>
                <Text style={styles.footerValue}>{item.salary}</Text>
            </View>
            <View style={styles.applicantButton}>
                <User size={14} color="#4b5563" fill="#4b5563" />
                <Text style={styles.applicantText}>{item.applicants} Applicants</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function JobManageScreen() {
    const [searchText, setSearchText] = useState('');

    const renderHeader = () => (
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.title}>Open <Text style={styles.titleRed}>Roles</Text></Text>
            <Text style={styles.subtitle}>Managing 14 active listings across Engineering.</Text>

            <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search by title or stack..."
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity>
                    <SlidersHorizontal size={20} color="#dc2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.promoBanner}>
            <Text style={styles.promoTitle}>Elite Executive Placements</Text>
            <Text style={styles.promoSubtitle}>Curated high-impact roles for industry leaders.</Text>
            <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>EXPLORE TIERS</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Real Header */}
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <User color="#fff" size={20} />
                </View>
                <Text style={styles.brandText}>PRECISION</Text>
                <TouchableOpacity>
                    <Bell size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* DANH SÁCH CHÍNH DÙNG FLATLIST */}
            <FlatList
                data={JOBS_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <JobCard item={item} />}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.fab}>
                <AntDesign name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const NavItem = ({ icon, label, active }) => (
    <TouchableOpacity style={styles.navItem}>
        <View style={[styles.navIconContainer, active && styles.navIconActive]}>
            {icon}
        </View>
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', marginTop: '10%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    avatarPlaceholder: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    brandText: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
    titleRed: { color: '#dc2626' },
    subtitle: { color: '#6b7280', fontSize: 14, marginTop: 5, marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#1f2937' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    matchBadge: { position: 'absolute', top: -10, right: 10, backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    jobLevel: { fontSize: 11, color: '#dc2626', fontWeight: '700', marginBottom: 4 },
    jobTitle: { fontSize: 19, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 8, marginBottom: 5 },
    tagText: { fontSize: 10, fontWeight: '600', color: '#64748b' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    footerLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
    footerValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    applicantButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    applicantText: { fontSize: 12, color: '#4b5563', marginLeft: 6, fontWeight: '500' },
    promoBanner: { backgroundColor: '#b91c1c', borderRadius: 16, padding: 25, marginTop: 10 },
    promoTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    promoSubtitle: { color: '#fca5a5', fontSize: 14, marginBottom: 20 },
    promoButton: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
    promoButtonText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 12 },
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navIconContainer: { padding: 8, borderRadius: 12 },
    navIconActive: { backgroundColor: '#fef2f2' },
    navLabel: { fontSize: 9, color: '#9ca3af', marginTop: 4, fontWeight: '700' },
    navLabelActive: { color: '#dc2626' },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        backgroundColor: COLORS.primary, width: 56, height: 56,
        borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowOpacity: 0.3
    }
});