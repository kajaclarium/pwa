import { useContext, useEffect, useState } from "react";
import "./../styles/header.css";
import { AuthContext } from "../context/AuthContext";

export default function Header() {

  const { token, logout, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      if(data?.user) {
        setUserData(data.user);
        setUser(data.user);
      }
      else {
        logout();
      }
    }
    catch (err) {
      logout();
    }
    setLoading(false);
  }
 useEffect(() => {
    fetchUserProfile();
  }
, []);
 //console.log("Header fetch user profile:", userData?.role);
  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        
        {/* Logo */}
        <h1 className="text-white text-xl font-bold tracking-wide">
          PWA App
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a href="/" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            Home
          </a>

          <a href="/pwa/user" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/YT_Profile_icon.png" alt="User" className="inline h-6 w-6 mr-1 mb-1 border border-white-600"/>
            {userData?.role.toUpperCase() || 'Guest'}
          </a>

          {/* <a href="/about" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            About
          </a> */}
        </nav>
      </div>
    </header>
  );
}
