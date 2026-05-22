import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput as RNTextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import { supabase } from '../../utils/supabase';
import * as ImagePicker from 'expo-image-picker';

const EmployerSignup = ({ navigation }) => {
    // --- Các State Đăng Nhập Cơ Bản ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Toàn Bộ State Tương Ứng Với Bảng COMPANIES ---
    const [companyName, setCompanyName] = useState('');
    const [city, setCity] = useState('');
    const [companySize, setCompanySize] = useState('1-50 employees');
    const [expertise, setExpertise] = useState('');
    const [link, setLink] = useState('');
    const [headline, setHeadline] = useState('');
    const [industry, setIndustry] = useState('');
    const [country, setCountry] = useState('Vietnam');
    const [companyModel, setCompanyModel] = useState(''); // Ví dụ: Outsourcing, Product
    const [workingHours, setWorkingHours] = useState(''); // Ví dụ: Monday - Friday
    const [otPolicy, setOtPolicy] = useState('');         // Ví dụ: No OT, OT is paid
    const [detailedIntroduction, setDetailedIntroduction] = useState('');
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    // Hàm mở thư viện chọn ảnh thực tế từ Expo
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Quyền truy cập", "Ứng dụng cần quyền truy cập thư viện ảnh để tải logo.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    // Hàm bổ trợ chuyển đổi file cục bộ thành Blob để đẩy lên Supabase Storage
    const uploadImageToBucket = async (localUri) => {
        if (!localUri || localUri.startsWith('http')) return localUri;

        try {
            const response = await fetch(localUri);
            const blob = await response.blob();

            const fileExt = localUri.split('.').pop() || 'png';
            const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('company-logos')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('company-logos')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Lỗi trong quá trình upload ảnh lên Storage:", error);
            throw new Error("Không thể upload logo công ty, vui lòng thử lại.");
        }
    };

    const handleSignUp = async () => {
        // Kiểm tra các trường bắt buộc cơ bản
        if (!email || !password || !companyName) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc (Email, Mật khẩu, Tên công ty).");
            return;
        }

        setIsLoading(true);

        try {
            // Bước 1: Xử lý upload ảnh lên Bucket trước nếu người dùng có chọn logo
            let finalLogoUrl = null;
            if (selectedImageUri) {
                finalLogoUrl = await uploadImageToBucket(selectedImageUri);
            }

            // Bước 2: Tạo bản ghi tài khoản đăng nhập trong bảng USERS
            const { data: userData, error: userError } = await supabase
                .from("USERS")
                .insert([
                    {
                        email: email.trim(),
                        password_hash: password,
                        role: "employer",
                        is_active: false
                    }
                ])
                .select()
                .single();

            if (userError) throw userError;

            const newUserId = userData.id;

            // Bước 3: Đẩy toàn bộ thông tin đã nhập vào bảng COMPANIES (Khớp hoàn toàn Schema hệ thống)
            const { error: companyError } = await supabase
                .from("COMPANIES")
                .insert([
                    {
                        user_id: newUserId,
                        name: companyName,
                        logo_url: finalLogoUrl,
                        city: city,
                        status: 'pending',
                        CompanySize: companySize,
                        Expertise: expertise,
                        Link: link,
                        headline: headline,
                        industry: industry,
                        country: country,
                        CompanyModel: companyModel,
                        WorkingHours: workingHours,
                        OtPolicy: otPolicy,
                        DetailedIntroduction: detailedIntroduction,
                        collaboration: null,    // Để null hoặc giá trị mặc định tùy logic của bạn
                        BannerUrl: null,        // Thiết lập sau ở trang quản lý profile doanh nghiệp
                        GalleryImageUrls: null  // Thiết lập sau ở trang quản lý profile doanh nghiệp
                    }
                ]);

            if (companyError) {
                // Hủy bỏ (Rollback) User vừa tạo nếu lưu thông tin công ty thất bại
                await supabase.from("USERS").delete().eq("id", newUserId);
                throw companyError;
            }

            Alert.alert(
                "Đăng ký thành công",
                "Thông tin doanh nghiệp của bạn đã được gửi tới Admin kiểm duyệt để kích hoạt tài khoản!",
                [{ text: "OK", onPress: () => navigation.navigate("LoginEmployee") }]
            );

            // Xóa sạch trạng thái form sau khi hoàn tất thành công
            setEmail(''); setPassword(''); setCompanyName(''); setCity('');
            setSelectedImageUri(null); setExpertise(''); setLink(''); setHeadline('');
            setIndustry(''); setCountry('Vietnam'); setCompanyModel('');
            setWorkingHours(''); setOtPolicy(''); setDetailedIntroduction('');

        } catch (error) {
            console.log("Xảy ra lỗi đăng ký: ", error);
            Alert.alert("Đăng ký thất bại", error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>PRECISION</Text>
                    <TouchableOpacity>
                        <Text style={styles.helpText}>HELP</Text>
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        Scale your <Text style={styles.highlightText}>technical team.</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Access the top 1% of specialized talent through our precision-vetted network.
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <View style={styles.redBar} />

                    <Text style={styles.cardTitle}>Employer Signup</Text>
                    <Text style={styles.cardSubtitle}>Join the elite network of hiring managers.</Text>

                    {/* --- THÔNG TIN TÀI KHOẢN --- */}
                    <Text style={styles.sectionDividerText}>ACCOUNT INFORMATION</Text>

                    <CustomInput
                        label="EMAIL ADDRESS *"
                        placeholder="name@company.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <CustomInput
                        label="CREATE PASSWORD *"
                        placeholder="........"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* --- THÔNG TIN DOANH NGHIỆP --- */}
                    <Text style={styles.sectionDividerText}>COMPANY PROFILE</Text>

                    <CustomInput
                        label="COMPANY NAME *"
                        placeholder="Engineering Corp"
                        value={companyName}
                        onChangeText={setCompanyName}
                    />
                    <CustomInput
                        label="COMPANY HEADLINE"
                        placeholder="e.g. Leading the future of AI technology"
                        value={headline}
                        onChangeText={setHeadline}
                    />

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>COMPANY LOGO</Text>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
                            <Text style={styles.imagePickerButtonText}>
                                {selectedImageUri ? "✓ Đã chọn ảnh logo công ty" : "📸 Bấm để chọn ảnh từ thiết bị..."}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <CustomInput
                        label="INDUSTRY"
                        placeholder="e.g. Information Technology, FinTech"
                        value={industry}
                        onChangeText={setIndustry}
                    />
                    <CustomInput
                        label="COMPANY MODEL"
                        placeholder="e.g. Product, Outsourcing, Hybrid"
                        value={companyModel}
                        onChangeText={setCompanyModel}
                    />
                    <CustomInput
                        label="COMPANY SIZE"
                        placeholder="e.g. 1-50 employees, 500+ employees"
                        value={companySize}
                        onChangeText={setCompanySize}
                    />
                    <CustomInput
                        label="EXPERTISE"
                        placeholder="Describe your team's technical focus..."
                        multiline
                        value={expertise}
                        onChangeText={setExpertise}
                    />

                    {/* --- ĐỊA LÝ & LIÊN HỆ --- */}
                    <Text style={styles.sectionDividerText}>LOCATION & CONTACT</Text>

                    <CustomInput
                        label="CITY"
                        placeholder="e.g. Ho Chi Minh City, San Francisco"
                        value={city}
                        onChangeText={setCity}
                    />
                    <CustomInput
                        label="COUNTRY"
                        placeholder="e.g. Vietnam, USA"
                        value={country}
                        onChangeText={setCountry}
                    />
                    <CustomInput
                        label="WEBSITE LINK"
                        placeholder="https://company.com"
                        value={link}
                        onChangeText={setLink}
                    />

                    {/* --- CHẾ ĐỘ & MÔI TRƯỜNG LÀM VIỆC --- */}
                    <Text style={styles.sectionDividerText}>WORKING CONDITIONS</Text>

                    <CustomInput
                        label="WORKING HOURS"
                        placeholder="e.g. Monday - Friday (8:00 AM - 5:00 PM)"
                        value={workingHours}
                        onChangeText={setWorkingHours}
                    />
                    <CustomInput
                        label="OT POLICY"
                        placeholder="e.g. No OT / OT lunch allowance / OT 150%"
                        value={otPolicy}
                        onChangeText={setOtPolicy}
                    />
                    <CustomInput
                        label="DETAILED INTRODUCTION"
                        placeholder="Tell candidates more about your culture, benefits, and workplace..."
                        multiline
                        value={detailedIntroduction}
                        onChangeText={setDetailedIntroduction}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleSignUp}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>CREATE ACCOUNT  →</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footerLink} onPress={() => { navigation.navigate("LoginEmployee") }}>
                        <Text style={styles.footerText}>
                            Already have an account? <Text style={styles.signInText}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const CustomInput = ({ label, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <RNTextInput
            style={[styles.input, props.multiline && styles.textArea]}
            placeholderTextColor="#999"
            autoCapitalize="none"
            {...props}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB', paddingTop: StatusBar.currentHeight || 0 },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    logoText: { fontWeight: '900', color: '#B21E24', fontSize: 18, letterSpacing: 1 },
    helpText: { color: '#666', fontSize: 12, fontWeight: '600' },
    heroSection: { paddingHorizontal: 25, paddingVertical: 30 },
    heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 40 },
    highlightText: { color: '#B21E24' },
    heroSubtitle: { fontSize: 16, color: '#555', marginTop: 15, lineHeight: 24 },
    card: { backgroundColor: '#FFF', marginHorizontal: 15, borderRadius: 8, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    redBar: { height: 3, backgroundColor: '#B21E24', width: 60, position: 'absolute', top: 0, right: 20 },
    cardTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
    cardSubtitle: { fontSize: 14, color: '#777', marginTop: 5, marginBottom: 20 },

    // Header phân vùng thông tin cho form dài dễ nhìn
    sectionDividerText: { fontSize: 12, fontWeight: '800', color: '#B21E24', marginTop: 20, marginBottom: 15, letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5 },

    inputContainer: { marginBottom: 15 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#444', marginBottom: 8, letterSpacing: 0.5 },
    input: { backgroundColor: '#E8F0FE', height: 45, borderRadius: 4, paddingHorizontal: 15, fontSize: 14, color: '#333' },
    textArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },

    imagePickerButton: {
        backgroundColor: '#E8F0FE',
        height: 45,
        borderRadius: 4,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed'
    },
    imagePickerButtonText: {
        fontSize: 14,
        color: '#555',
    },

    submitButton: { backgroundColor: '#B21E24', height: 55, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    footerLink: { marginTop: 25, alignItems: 'center' },
    footerText: { fontSize: 13, color: '#666' },
    signInText: { color: '#B21E24', fontWeight: 'bold' },
});

export default EmployerSignup;