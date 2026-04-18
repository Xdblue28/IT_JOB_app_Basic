import React, { useState } from 'react';
import {
    StyleSheet, View, Text, FlatList, TouchableOpacity,
    SafeAreaView, Image, ScrollView, StatusBar
} from 'react-native';
import { Bell, ArrowRight, User } from 'lucide-react-native';

// 1. MOCK DATA (Dữ liệu mẫu)
const FILTERS = ['All Candidates', 'Technical', 'Design', 'Product'];
const APPLICANTS = [
    { id: '1', name: 'Sarah Chen', role: 'Senior Solutions Architect', tags: ['CLOUD NATIVE', 'KUBERNETES', 'GO'], match: '98%', image: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Marcus Thorne', role: 'Principal UX Researcher', tags: ['HCI', 'QUANTITATIVE', 'STRATEGY'], match: '84%', image: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Elena Rodriguez', role: 'Lead DevOps Engineer', tags: ['TERRAFORM', 'AWS', 'SECURITY'], match: '92%', image: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Julian Voss', role: 'Fullstack Developer', tags: ['REACT', 'NODE.JS'], match: null, image: 'https://i.pravatar.cc/150?u=4' },
];

const ApplicantCard = ({ item }) => (
    <View style={styles.card}>
        {item.match && (
            <View style={[styles.matchBadge, { backgroundColor: parseInt(item.match) > 90 ? '#dc2626' : '#94a3b8' }]}>
                <Text style={styles.matchText}>{item.match} MATCH</Text>
            </View>
        )}

        <View style={styles.cardHeader}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
            </View>
        </View>

        <View style={styles.tagContainer}>
            {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
        </View>

        <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>VIEW APPLICATION</Text>
            <ArrowRight size={16} color="#dc2626" />
        </TouchableOpacity>
    </View>
);

export default function ApplicantsScreen() {
    const [activeFilter, setActiveFilter] = useState('All Candidates');

    const renderHeader = () => (
        <View>
            <Text style={styles.title}>Applicants</Text>
            <Text style={styles.subtitle}>Reviewing 24 active candidates for high-impact roles.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {FILTERS.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        onPress={() => setActiveFilter(filter)}
                        style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
                    >
                        <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* Top Navigation Bar */}
            <View style={styles.topNav}>
                <View style={styles.profileCircle}><User size={18} color="#fff" /></View>
                <Text style={styles.brand}>PRECISION</Text>
                <Bell size={24} color="#374151" />
            </View>

            <FlatList
                data={APPLICANTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ApplicantCard item={item} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', marginTop: '10%' },
    topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    profileCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    brand: { fontWeight: '800', fontSize: 18, color: '#dc2626', letterSpacing: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginTop: 10 },
    subtitle: { color: '#6b7280', fontSize: 14, marginTop: 5, marginBottom: 20, lineHeight: 20 },

    // Filter Tabs
    filterScroll: { marginBottom: 20, flexDirection: 'row' },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    activeFilterTab: { backgroundColor: '#b91c1c', borderColor: '#b91c1c' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    activeFilterText: { color: '#fff' },

    // Card Styles
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    matchBadge: { position: 'absolute', top: -8, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e2e8f0' },
    infoContainer: { marginLeft: 12 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    role: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginTop: 2 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8, marginBottom: 6 },
    tagText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
    viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    viewButtonText: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', letterSpacing: 0.5 }
});