import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, setSession }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const { data, error } = await supabase.from("USERS")
            .select('*')
            .eq('email', email)
            .eq('password_hash', password)
            .single();

        if (error || !data) {
            Alert.alert("Sai thông tin", "Sai tài khoản hoặc mật khẩu");
            return;
        }
        if (data.role.toLowerCase() === 'employer' && data.is_active === true) {
            await AsyncStorage.setItem("session-user", JSON.stringify(data));
            if (setSession) {
                setSession(data);
            }
            Alert.alert("Thành công", "Đăng nhập thành công");
        } else {
            Alert.alert("Thông báo", "Đăng nhập thất bại, vui lòng liên hệ tới người quản trị nếu tài khoản chưa được kích hoạt")
        }

    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.navigationHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                    <Text style={styles.backButtonText}>Trang chủ</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Create your Suite</Text>
                <Text style={styles.subtitle}>Access the recruitment architecture tools for your team.</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Company Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="name@company.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="........"
                            secureTextEntry={showPassword === false}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.signUpButton} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.footerText}>Or</Text>
                    </View>

                    <TouchableOpacity style={styles.signUpButton} onPress={() => { navigation.navigate("RegisterEmployee") }}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginTop: '10%' },


    navigationHeader: {
        paddingHorizontal: 20,
        paddingTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        gap: 5,
    },
    backButtonText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },


    content: { padding: 25, paddingTop: 20 },

    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginVertical: 10 },
    form: { marginTop: 30 },
    label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
    input: {
        height: 50, backgroundColor: '#F9F9F9', borderRadius: 8,
        paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#EEE'
    },
    passwordContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
        borderRadius: 8, borderWidth: 1, borderColor: '#EEE', paddingHorizontal: 15, marginBottom: 30
    },
    passwordInput: { flex: 1, height: 50 },
    signUpButton: {
        backgroundColor: '#C62828', height: 55, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center'
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footerText: { textAlign: 'center', marginTop: 40, marginBottom: 40, color: '#666', fontSize: 13 },
    linkText: { color: '#C62828', fontWeight: 'bold' }
});