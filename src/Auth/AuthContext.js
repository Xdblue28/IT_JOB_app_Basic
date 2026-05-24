import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra session khi app khởi động
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem("userSession");
        if (savedSession) {
          setUserSession(JSON.parse(savedSession));
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (sessionData) => {
    try {
      setUserSession(sessionData);
      await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
    } catch (error) {
      console.error("Lỗi khi lưu session:", error);
    }
  };

  const logout = async () => {
    try {
      setUserSession(null);
      await AsyncStorage.removeItem("userSession");
    } catch (error) {
      console.error("Lỗi khi xóa session:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userSession, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
