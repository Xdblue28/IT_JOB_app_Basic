// src/navigation/Navigation.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import màn hình chính
import HomeScreen from "../screens/HomeScreen";
import CompanyScreen from "../screens/CompanyScreen";
import BlogsScreen from "../screens/BlogsScreen";
// Khởi tạo các bộ điều hướng
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CVScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Quản lý CV của bạn</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Hồ sơ cá nhân</Text>
  </View>
);

/**
 * Cấu hình Bottom Tab Navigation
 */
function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8B0000", // Màu đỏ đậm ITviec khi chọn
        tabBarInactiveTintColor: "#666", // Màu xám khi không chọn
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#EEE",
        },
      }}
    >
      <Tab.Screen
        name="JOBS"
        component={HomeScreen}
        options={{
          tabBarLabel: "JOBS",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="briefcase"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="COMPANIES"
        component={CompanyScreen}
        options={{
          tabBarLabel: "COMPANIES",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="office-building"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BLOG"
        component={BlogsScreen}
        options={{
          tabBarLabel: "BLOG",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CV"
        component={CVScreen}
        options={{
          tabBarLabel: "CV",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="file-account"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PROFILE"
        component={ProfileScreen}
        options={{
          tabBarLabel: "PROFILE",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Component điều hướng chính của toàn bộ App
 */
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Màn hình chính chứa Bottom Tabs */}
        <Stack.Screen name="Main" component={MyTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});
