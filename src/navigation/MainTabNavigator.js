import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

// Import đầy đủ các màn hình
import HomeScreen from "../screens/screens_candidate/HomeScreen";
import JobScreen from "../screens/screens_candidate/JobScreen";
import BlogScreen from "../screens/screens_candidate/BlogScreen";
import ManageScreen from "../screens/screens_candidate/ManageScreen";
import ProfileScreen from "../screens/screens_candidate/ProfileScreen";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Job")
            iconName = focused ? "briefcase" : "briefcase-outline";
          else if (route.name === "Blog")
            iconName = focused
              ? "newspaper-variant"
              : "newspaper-variant-outline";
          else if (route.name === "Manage")
            iconName = focused ? "clipboard-text" : "clipboard-text-outline";
          else if (route.name === "Profile")
            iconName = focused ? "account" : "account-outline";

          return (
            <MaterialCommunityIcons name={iconName} size={24} color={color} />
          );
        },
        tabBarActiveTintColor: "#b7131a",
        tabBarInactiveTintColor: "#5f5e5e",
        tabBarStyle: {
          // Tăng chiều cao lên 70 (Android) để có không gian thở cho text
          height: Platform.OS === "ios" ? 88 : 77,
          // Đẩy phần chữ cách đáy hợp lý, né thanh vuốt tràn viền hệ thống
          paddingBottom: Platform.OS === "ios" ? 12 : 12,
          paddingTop: 10,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e2e2",
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 1, // Tạo khoảng cách nhẹ giữa Icon và Chữ
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Job" component={JobScreen} />
      {/* <Tab.Screen name="Blog" component={BlogScreen} />
      <Tab.Screen name="Manage" component={ManageScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
