import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const { access_token } = response.data;

      // Save token in state
      setToken(access_token);

      // Attach token to API instance
      API.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      // Fetch real user
      await getCurrentUser();

      console.log("✅ LOGIN SUCCESS");
    } catch (error) {
      console.log(
        "❌ LOGIN ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FETCH CURRENT USER
  // -----------------------------
  const getCurrentUser = async () => {
    try {
      const response = await API.get("/auth/me");
      setUser(response.data);
      console.log("👤 USER FETCHED:", response.data);
    } catch (error) {
      console.log("❌ USER FETCH ERROR:", error.message);
      logout();
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    console.log("🚪 LOGGED OUT");
  };

  useEffect(() => {
    // Future: restore token from storage
  }, []);

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