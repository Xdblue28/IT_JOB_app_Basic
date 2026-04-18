import React, { useState } from 'react';

import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    return (
        <SafeAreaView style={styles.container}>
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
                            secureTextEntry={showPassword === false} // Tuyệt đối an toàn cho Boolean
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.signUpButton} onPress={() => { navigation.replace('MainApp') }}>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableOpacity>

                </View>



            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginTop: '10%' },
    content: { padding: 25, paddingTop: 60 },
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
    footerText: { textAlign: 'center', marginTop: 40, color: '#666', fontSize: 13 },
    linkText: { color: '#C62828', fontWeight: 'bold' }
});