import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import { useEffect } from 'react';
const EditCompanyDialog = ({ visible, company, onClose, onSaveSuccess }) => {
    // State lưu thông tin đang sửa trong Dialog
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [expertise, setExpertise] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (visible && company) {
            setName(company.name || '');
            setCity(company.city || '');
            setCompanySize(company.CompanySize ? String(company.CompanySize) : '');
            setExpertise(company.Expertise || '');
            setLink(company.Link || '');
        }
    }, [visible, company]);
    const handleUpdate = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('COMPANIES')
            .update({ name, city, CompanySize: companySize, Expertise: expertise, Link: link })
            .eq('id', company.id);

        setLoading(false);
        if (!error) {
            onSaveSuccess();
            onClose();
        } else {
            alert(error.message);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>Chỉnh sửa Công ty</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Tên công ty"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Thành phố"
                        value={city}
                        onChangeText={setCity}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Số lượng nhân viên"
                        value={companySize}
                        keyboardType='numeric'
                        onChangeText={setCompanySize}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Lĩnh vực"
                        value={expertise}
                        onChangeText={setExpertise}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Link công ty"
                        value={link}
                        onChangeText={setLink}
                    />



                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" color="red" onPress={onClose} />
                        <Button
                            title={loading ? "Đang lưu..." : "Lưu thay đổi"}
                            onPress={handleUpdate}
                            disabled={loading}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});

export default EditCompanyDialog;