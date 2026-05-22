import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginEmployeeScreen";
import EmployerSignup from "../screens/RegisterEmployee";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator()
export default function LoginToRegister({ setSession }) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="LoginEmployee" options={{ headerShown: false }} >{(props) => <LoginScreen {...props} setSession={setSession} />}</Stack.Screen>
            <Stack.Screen name="RegisterEmployee" component={EmployerSignup} options={{ headerShown: false }} />

        </Stack.Navigator>
    )
}
