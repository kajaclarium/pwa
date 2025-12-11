import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_BASE = "http://localhost:5000"; // central API url

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  /* ------------------------------
      Load user if token exists
  ------------------------------- */
  useEffect(() => {
    if (token) fetchUserProfile();
    else setLoading(false);
  }, [token]);

  /* ------------------------------
      LOGIN
  ------------------------------- */
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("login data:", data);

    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token + user
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  /* ------------------------------
      REGISTER (normal user)
  ------------------------------- */
  const register = async (email, password, username) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await res.json();
    return data;
  };

  /* ------------------------------
      FETCH PROFILE (/auth/me)
  ------------------------------- */
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If token expired or invalid → logout user
      if (!res.ok) {
        logout();
        return;
      }

      const data = await res.json();

      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        logout(); // just to be safe
      }
    } catch (err) {
      logout();
    }

    setLoading(false);
  };

  /* ------------------------------
      LOGOUT
  ------------------------------- */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        setUser,
        fetchUserProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
