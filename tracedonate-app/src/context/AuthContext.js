import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // INITIALIZE SESSION
  // -----------------------------
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        if (storedToken) {
          setToken(storedToken);
          API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          // Optionally fetch user to verify token is still valid
          const response = await API.get("/auth/me");
          setUser(response.data);
          console.log("🔄 SESSION RESTORED");
        }
      } catch (error) {
        console.log("❌ SESSION RESTORE ERROR:", error.message);
        await logout();
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await API.post("/auth/login", { email, password });
      const { access_token } = response.data;

      // Save token in memory
      setToken(access_token);

      // Save token in persistent storage
      await AsyncStorage.setItem("userToken", access_token);

      // Attach token to API instance
      API.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Fetch user details
      const userResponse = await API.get("/auth/me");
      setUser(userResponse.data);

      console.log("✅ LOGIN SUCCESS");
    } catch (error) {
      console.log("❌ LOGIN ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
    } catch (err) {
      console.log("❌ LOGOUT STORAGE ERROR:", err.message);
    }
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    console.log("🚪 LOGGED OUT");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};