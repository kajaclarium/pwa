import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL;

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      logout();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      if (!data?.user) {
        logout();
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Login failed");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const register = async (email, password, username) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Registration failed");
    return data;
  };

  const value = { user, token, isAuthenticated, loading, login, logout, register };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
