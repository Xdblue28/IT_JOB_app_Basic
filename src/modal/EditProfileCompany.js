import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { supabase } from '../../utils/supabase';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const EditCompanyDialog = ({ visible, company, onClose, onSaveSuccess }) => {
    const [name, setName] = useState('');
    const [headline, setHeadline] = useState('');
    const [industry, setIndustry] = useState('');
    const [companyModel, setCompanyModel] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [expertise, setExpertise] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [link, setLink] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [otPolicy, setOtPolicy] = useState('');
    const [detailedIntroduction, setDetailedIntroduction] = useState('');

    // --- State mới cho logo ---
    const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
    const [newLogoUri, setNewLogoUri] = useState(null); // URI local ảnh mới chọn
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && company) {
            setName(company.name || '');
            setHeadline(company.headline || '');
            setIndustry(company.industry || '');
            setCompanyModel(company.CompanyModel || '');
            setCompanySize(company.CompanySize || '');
            setExpertise(company.Expertise || '');
            setCity(company.city || '');
            setCountry(company.country || '');
            setLink(company.Link || '');
            setWorkingHours(company.WorkingHours || '');
            setOtPolicy(company.OtPolicy || '');
            setDetailedIntroduction(company.DetailedIntroduction || '');
            setCurrentLogoUrl(company.logo_url || null);
            setNewLogoUri(null); // Reset ảnh mới mỗi lần mở dialog
        }
    }, [visible, company]);

    // --- Chọn ảnh từ thư viện ---
    const handlePickLogo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Quyền truy cập", "Ứng dụng cần quyền truy cập thư viện ảnh.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setNewLogoUri(result.assets[0].uri);
        }
    };

    // --- Upload logo mới lên Supabase Storage bằng FormData ---
    const uploadLogo = async (localUri) => {
        const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
            uri: localUri,
            name: fileName,
            type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        });

        const uploadResponse = await fetch(
            `${SUPABASE_URL}/storage/v1/object/company-logos/${fileName}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'x-upsert': 'false',
                    // ⚠️ Không set Content-Type thủ công
                },
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errBody = await uploadResponse.text();
            throw new Error(`Upload logo thất bại: ${errBody}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('company-logos')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    };

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên công ty không được để trống");
            return;
        }

        setLoading(true);
        try {
            // Upload logo mới nếu người dùng có chọn
            let finalLogoUrl = currentLogoUrl;
            if (newLogoUri) {
                setIsUploadingLogo(true);
                finalLogoUrl = await uploadLogo(newLogoUri);
                setIsUploadingLogo(false);
            }

            const { error } = await supabase
                .from('COMPANIES')
                .update({
                    name: name.trim(),
                    headline: headline.trim(),
                    industry: industry.trim(),
                    CompanyModel: companyModel.trim(),
                    CompanySize: companySize.trim(),
                    Expertise: expertise.trim(),
                    city: city.trim(),
                    country: country.trim(),
                    Link: link.trim(),
                    WorkingHours: workingHours.trim(),
                    OtPolicy: otPolicy.trim(),
                    DetailedIntroduction: detailedIntroduction.trim(),
                    logo_url: finalLogoUrl, // ← Cập nhật logo mới
                })
                .eq('id', company.id);

            if (error) throw error;

            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            Alert.alert("Lỗi cập nhật", error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
            setIsUploadingLogo(false);
        }
    };

    // Ảnh hiển thị preview: ưu tiên ảnh mới chọn, fallback về ảnh hiện tại
    const previewUri = newLogoUri || currentLogoUrl;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>Chỉnh sửa thông tin doanh nghiệp</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>

                        {/* --- LOGO SECTION --- */}
                        <Text style={styles.sectionLabel}>Logo công ty</Text>
                        <View style={styles.logoSection}>
                            {previewUri ? (
                                <Image
                                    source={{ uri: previewUri }}
                                    style={styles.logoPreview}
                                />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Text style={styles.logoPlaceholderText}>Chưa có logo</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.changeLogoBtn} onPress={handlePickLogo}>
                                <Text style={styles.changeLogoBtnText}>
                                    {newLogoUri ? '✓ Đã chọn ảnh mới' : '📸 Đổi logo'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {newLogoUri && (
                            <TouchableOpacity onPress={() => setNewLogoUri(null)}>
                                <Text style={styles.cancelLogoText}>✕ Hủy đổi logo</Text>
                            </TouchableOpacity>
                        )}

                        {/* --- CÁC TRƯỜNG TEXT --- */}
                        <Text style={styles.sectionLabel}>Thông tin chung</Text>
                        <TextInput style={styles.input} placeholder="Tên công ty *" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="Slogan / Headline" value={headline} onChangeText={setHeadline} />
                        <TextInput style={styles.input} placeholder="Lĩnh vực hoạt động (Ví dụ: IT, FinTech)" value={industry} onChangeText={setIndustry} />
                        <TextInput style={styles.input} placeholder="Mô hình công ty (Ví dụ: Product, Outsourcing)" value={companyModel} onChangeText={setCompanyModel} />
                        <TextInput style={styles.input} placeholder="Quy mô nhân viên (Ví dụ: 50-100 nhân viên)" value={companySize} onChangeText={setCompanySize} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Kỹ năng chuyên môn" value={expertise} onChangeText={setExpertise} multiline />

                        <Text style={styles.sectionLabel}>Địa lý & Liên kết</Text>
                        <TextInput style={styles.input} placeholder="Thành phố" value={city} onChangeText={setCity} />
                        <TextInput style={styles.input} placeholder="Quốc gia" value={country} onChangeText={setCountry} />
                        <TextInput style={styles.input} placeholder="Link Website công ty" value={link} onChangeText={setLink} keyboardType="url" autoCapitalize="none" />

                        <Text style={styles.sectionLabel}>Chế độ làm việc</Text>
                        <TextInput style={styles.input} placeholder="Thời gian làm việc" value={workingHours} onChangeText={setWorkingHours} />
                        <TextInput style={styles.input} placeholder="Chính sách OT" value={otPolicy} onChangeText={setOtPolicy} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Giới thiệu chi tiết về công ty..." value={detailedIntroduction} onChangeText={setDetailedIntroduction} multiline />
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose} disabled={loading}>
                            <Text style={styles.btnTextCancel}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleUpdate} disabled={loading}>
                            {loading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator color="#FFF" size="small" />
                                    <Text style={[styles.btnTextSave, { marginLeft: 6 }]}>
                                        {isUploadingLogo ? 'Đang upload...' : 'Đang lưu...'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.btnTextSave}>Lưu thay đổi</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    dialog: { width: '90%', maxHeight: '85%', backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 5 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e293b', textAlign: 'center' },
    formScroll: { marginBottom: 15 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#dc2626', marginTop: 10, marginBottom: 8, letterSpacing: 0.5 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 10, marginBottom: 12, borderRadius: 6, fontSize: 14, color: '#333', backgroundColor: '#f8fafc' },
    textArea: { minHeight: 60, textAlignVertical: 'top' },

    // Logo styles
    logoSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
    logoPreview: { width: 72, height: 72, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    logoPlaceholder: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    logoPlaceholderText: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
    changeLogoBtn: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', borderRadius: 6, padding: 10, backgroundColor: '#f8fafc', alignItems: 'center' },
    changeLogoBtnText: { fontSize: 13, color: '#475569' },
    cancelLogoText: { fontSize: 12, color: '#dc2626', marginBottom: 10, textAlign: 'right' },

    buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, minWidth: 100, alignItems: 'center' },
    btnCancel: { backgroundColor: '#f1f5f9' },
    btnSave: { backgroundColor: '#dc2626' },
    btnTextCancel: { color: '#475569', fontWeight: '600' },
    btnTextSave: { color: '#FFF', fontWeight: '600' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
});

export default EditCompanyDialog;