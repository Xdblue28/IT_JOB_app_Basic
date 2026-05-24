import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../Config/supabaseClient"; // File cấu hình kết nối Supabase của bạn

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Kiểm tra dữ liệu đầu vào trống
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    // 2. Kiểm tra độ dài mật khẩu (bảo mật tối thiểu)
    if (password.length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    // 3. Kiểm tra mật khẩu nhập lại khớp nhau
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setLoading(true);

    try {
      // BƯỚC A: Thêm dữ liệu vào bảng "USERS" trước
      // Sử dụng .select() để lấy về cục dữ liệu vừa chèn (trong đó có ID tự tăng)
      const { data: userData, error: userError } = await supabase
        .from("USERS")
        .insert([
          {
            email: email.trim().toLowerCase(),
            password_hash: password, // Sau này bạn có thể mã hóa hash, tạm thời lưu thô để chạy luồng
            role: "candidate", // Ép cứng luồng này của bạn là Ứng viên
            is_active: true,
          },
        ])
        .select();

      if (userError) {
        Alert.alert(
          "Đăng ký thất bại",
          "Email đã tồn tại hoặc lỗi hệ thống: " + userError.message,
        );
        setLoading(false);
        return;
      }

      // BƯỚC B: Nếu chèn bảng USERS thành công, lấy ID đó chèn tiếp vào bảng "CANDIDATES"
      if (userData && userData.length > 0) {
        const newUserId = userData[0].id; // Lấy ID vừa sinh từ bảng USERS

        const { error: candidateError } = await supabase
          .from("CANDIDATES")
          .insert([
            {
              user_id: newUserId, // Khóa ngoại trỏ về USERS
              fullname: "", // Khởi tạo các giá trị ban đầu trống để ứng viên cập nhật sau
              phone: "",
              city: "",
              YearsExperience: 0,
            },
          ]);

        if (candidateError) {
          // Trường hợp hi hữu lỗi bảng CANDIDATES thì xóa luôn user vừa tạo ở bảng USERS để tránh rác data
          await supabase.from("USERS").delete().eq("id", newUserId);

          Alert.alert(
            "Lỗi lưu trữ",
            "Không thể khởi tạo hồ sơ ứng viên: " + candidateError.message,
          );
          setLoading(false);
          return;
        }

        // HOÀN THÀNH HOÀN HẢO CẢ 2 BƯỚC
        Alert.alert(
          "Thành công",
          "Tạo tài khoản Ứng viên thành công! Bạn có thể tiến hành đăng nhập.",
          [
            {
              text: "Đăng nhập ngay",
              onPress: () => navigation.navigate("LoginScreen"),
            },
          ],
        );
      }
    } catch (err) {
      Alert.alert(
        "Lỗi hệ thống",
        "Đã xảy ra lỗi ngoài ý muốn. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Nút quay lại màn hình Login nhanh */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#B22222" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subTitle}>
            Tìm kiếm cơ hội việc làm IT tốt nhất
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Ô nhập Email */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#4A4A4A"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0A0A0"
              editable={!loading}
            />
          </View>

          {/* Ô nhập Mật khẩu */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#4A4A4A"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (từ 6 ký tự)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#4A4A4A"
              />
            </TouchableOpacity>
          </View>

          {/* Ô nhập lại Mật khẩu */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={22}
              color="#4A4A4A"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#4A4A4A"
              />
            </TouchableOpacity>
          </View>

          {/* Nút Đăng ký */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.mainButtonText}>Đăng ký ngay</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Chuyển hướng nhanh xuống footer */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate("LoginScreen")}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              Bạn đã có tài khoản?{" "}
              <Text style={styles.linkHighlight}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, padding: 30, justifyContent: "center" },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 10 },
  header: { marginBottom: 35 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
  },
  subTitle: { fontSize: 15, color: "#777", textAlign: "center", marginTop: 5 },
  form: { gap: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  mainButton: {
    backgroundColor: "#B22222",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  mainButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  footerLinks: { marginTop: 30, alignItems: "center" },
  switchText: { fontSize: 15, color: "#555" },
  linkHighlight: { fontWeight: "bold", color: "#B22222" },
});

export default RegisterScreen;
