import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
// Import cả 2 bộ điều hướng để bạn dễ quản lý
import CandidateNavigation from "./src/navigation_employee/Navigation";
import EmployerNavigation from "./src/navigation_employer/LoginToDashboardNavi";

export default function App() {
  // Sau này bạn sẽ dùng biến state để check xem User chọn vào cổng nào
  // Tạm thời mình render luồng Candidate trước để test
  const userType = "candidate"; // 'candidate' hoặc 'employer'

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {userType === "candidate" ? (
        <CandidateNavigation />
      ) : (
        <EmployerNavigation />
      )}
    </SafeAreaProvider>
  );
}
