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
import { useAuth } from "../../Auth/AuthContext"; // Kho lưu trạng thái đăng nhập

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Kiểm tra dữ liệu đầu vào trống
    if (!email.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      // 2. Truy vấn trực tiếp vào bảng "USERS" trong Database của bạn
      const { data: users, error } = await supabase
        .from("USERS")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("password_hash", password) // Đối chiếu mật khẩu (thô) trùng khớp với DB
        .single(); // Lấy duy nhất 1 bản ghi thỏa mãn

      if (error || !users) {
        Alert.alert(
          "Đăng nhập thất bại",
          "Email hoặc Mật khẩu không chính xác.",
        );
        setLoading(false);
        return;
      }

      // 3. Kiểm tra phân quyền (Role) - CHỈ CHO PHÉP ỨNG VIÊN VÀO LUỒNG NÀY
      if (users.role !== "candidate") {
        Alert.alert(
          "Từ chối truy cập",
          "Tài khoản này không thuộc luồng Ứng viên. Vui lòng kiểm tra lại.",
        );
        setLoading(false);
        return;
      }

      // 4. Kiểm tra xem tài khoản có đang bị khóa hay không
      if (users.is_active === false) {
        Alert.alert("Thông báo", "Tài khoản của bạn hiện đang bị tạm khóa.");
        setLoading(false);
        return;
      }

      // 5. Thỏa mãn mọi điều kiện -> Kích hoạt login nạp dữ liệu vào Context để tự động mở HomeScreen
      login(users);
      Alert.alert("Thành công", `Chào mừng ứng viên trở lại!`);
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
        {/* Header Thương hiệu */}
        <View style={styles.header}>
          <Text style={styles.logo}>ITJOBPRO</Text>
          <Text style={styles.subTitle}>Đăng nhập để bắt đầu tìm việc</Text>
        </View>

        {/* Form Nhập dữ liệu */}
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
              placeholder="Email của bạn"
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
              placeholder="Mật khẩu"
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

          {/* Nút Đăng nhập ứng viên */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.mainButtonText}>Đăng nhập ứng viên</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Các liên kết chuyển màn hình */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterScreen")}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              Chưa có tài khoản?{" "}
              <Text style={styles.linkHighlight}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Nút rẽ nhánh sang luồng của bạn bạn (Nhà tuyển dụng) */}
          <Text style={styles.footerText}>Bạn là nhà tuyển dụng?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("LoginToDash")}
            disabled={loading}
          >
            <Text style={styles.employerLink}>Truy cập trang quản trị</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, padding: 30, justifyContent: "center" },
  header: { marginBottom: 40 },
  logo: {
    fontSize: 40,
    fontWeight: "900",
    color: "#B22222",
    textAlign: "center",
    letterSpacing: -1,
  },
  subTitle: { fontSize: 16, color: "#777", textAlign: "center", marginTop: 5 },
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
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    width: "100%",
    marginVertical: 25,
  },
  footerText: { fontSize: 14, color: "#999" },
  employerLink: {
    color: "#B22222",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },
});

export default LoginScreen;
