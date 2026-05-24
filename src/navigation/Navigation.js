import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../Auth/AuthContext";
import { View, ActivityIndicator } from "react-native";

// Import các màn hình xác thực
import LoginScreen from "../screens/screens_candidate/LoginScreen";
import RegisterScreen from "../screens/screens_candidate/RegisterScreen";

// IMPORT FILE TAB NAVIGATOR ĐÃ TÁCH BIỆT ĐỂ DỄ BẢO TRÌ
import MainTabNavigator from "./MainTabNavigator";
import JobDetailScreen from "../screens/screens_candidate/JobDetailScreen";
import CompanyDetail from "../screens/screens_candidate/CompanyDetail";
import AppNavi from "../navigation_employer/LoginToDashboardNavi";
const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { userSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <ActivityIndicator size="large" color="#b7131a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userSession === null ? (
          // CHƯA ĐĂNG NHẬP: Luồng xác thực ứng viên
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="LoginToDash" component={AppNavi}></Stack.Screen>
          </>
        ) : (
          // ĐÃ ĐĂNG NHẬP: Nhảy vào bộ khung 5 tab (Home, Job, Blog, Manage, Profile)
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
            ></Stack.Screen>
            <Stack.Screen
              name="CompanyDetail"
              component={CompanyDetail}
            ></Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
