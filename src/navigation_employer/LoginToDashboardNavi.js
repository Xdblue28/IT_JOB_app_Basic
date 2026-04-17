import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text } from "react-native";
import LoginScreen from "../screens/LoginEmployeeScreen";
import MainAppBottomTab from "./MainAppBottomTab";
import { useEffect, useState } from "react";

const Stack = createStackNavigator();
export default function AppNavi() {
  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="LoginEmployee"
          component={LoginScreen}
        ></Stack.Screen>
        <Stack.Screen
          name="MainApp"
          component={MainAppBottomTab}
        ></Stack.Screen>
      </Stack.Group>
    </Stack.Navigator>
  );
}
