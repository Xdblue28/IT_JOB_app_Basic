import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import DashboardScreen from "../screen/DashboardEmployee";
import JobManageScreen from "../screen/JobManageEmployee";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ApplicantsScreen from "../screen/ApplicantEmployee";
import CompanyProfileScreen from "../screen/ProfileEmployee";
const Tab = createBottomTabNavigator()
export default function MainAppBottomTab() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'DashboardEmployee') {
                    iconName = 'dashboard'
                } else if (route.name === 'JobManage') {
                    iconName = 'list-alt'
                } else if (route.name === 'Applicant') {
                    iconName = "format-list-bulleted"
                } else {
                    iconName = 'person'
                }
                return (<MaterialIcons name={iconName} size={24} color={color} />)
            },
            tabBarActiveTintColor: "red",
            headerShown: false

        })}>
            <Tab.Screen name="DashboardEmployee" component={DashboardScreen}></Tab.Screen>
            <Tab.Screen name="JobManage" component={JobManageScreen}></Tab.Screen>
            <Tab.Screen name="Applicant" component={ApplicantsScreen} ></Tab.Screen>
            <Tab.Screen name="Profile" component={CompanyProfileScreen}></Tab.Screen>
        </Tab.Navigator>
    )
}