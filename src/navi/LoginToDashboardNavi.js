import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { View, Text } from "react-native"
import LoginScreen from "../screen/LoginEmployeeScreen"
import DashboardScreen from "../screen/DashboardEmployee"
import MainAppBottomTab from "./MainAppBottomTab"
import { useEffect, useState } from "react"
import { supabase } from "../../utils/supabase"
const Stack = createStackNavigator()
export default function AppNavi() {

    return (
        <NavigationContainer>

            <Stack.Navigator >

                <Stack.Group screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="LoginEmployee" component={LoginScreen} ></Stack.Screen>
                    <Stack.Screen name="MainApp" component={MainAppBottomTab} ></Stack.Screen>

                </Stack.Group>
            </Stack.Navigator>



        </NavigationContainer>
    )
}