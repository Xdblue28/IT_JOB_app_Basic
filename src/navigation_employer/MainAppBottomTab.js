import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import DashboardScreen from "../screens/DashboardEmployee";
import JobManageScreen from "../screens/JobManageEmployee";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ApplicantsScreen from "../screens/ApplicantEmployee";
import CompanyProfileScreen from "../screens/ProfileEmployee";
const Tab = createBottomTabNavigator();
export default function MainAppBottomTab({ setSession }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "DashboardEmployee") {
            iconName = "dashboard";
          } else if (route.name === "JobManage") {
            iconName = "list-alt";
          } else if (route.name === "Applicant") {
            iconName = "format-list-bulleted";
          } else {
            iconName = "person";
          }
          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "red",
        headerShown: false,

      })}

    >
      <Tab.Screen
        name="DashboardEmployee"
        component={DashboardScreen}
      ></Tab.Screen>
      <Tab.Screen name="JobManage" component={JobManageScreen}></Tab.Screen>
      <Tab.Screen name="Applicant" component={ApplicantsScreen}></Tab.Screen>
      <Tab.Screen name="Profile" component={CompanyProfileScreen} initialParams={{ setSession: setSession }}></Tab.Screen>
    </Tab.Navigator>
  );
}
