import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text } from "react-native";
import LoginScreen from "../screens/LoginEmployeeScreen";
import MainAppBottomTab from "./MainAppBottomTab";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import LoginToRegister from "./LoginToRegister";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();
export default function AppNavi() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("session-user");

        // Sửa lỗi sai tên biến: Kiểm tra sessionData chứ không phải session
        if (sessionData != null) {
          const userData = JSON.parse(sessionData);

          if (userData.role === 'employer') {
            setSession(userData);
          } else {
            setSession(null);
          }
        }
      } catch (error) {
        console.error("Lỗi đọc AsyncStorage:", error);
      }
    };


    checkSession();
  }, [])
  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerShown: false }}>
        {session ? (<Stack.Screen
          name="MainApp"
        >{(props) => <MainAppBottomTab {...props} setSession={setSession} />}</Stack.Screen>) : (<Stack.Screen
          name="LoginToRegister"
        >{(props) => <LoginToRegister {...props} setSession={setSession} />}</Stack.Screen>)}
      </Stack.Group>
    </Stack.Navigator>
  );
}
