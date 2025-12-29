import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./../styles/header.css";

export default function Header() {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <h1 className="text-white text-xl font-bold tracking-wide">PWA App</h1>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            Home
          </Link>

          <Link to="/user" className="text-white hover:bg-white/20 px-3 py-1 rounded transition flex items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/93/YT_Profile_icon.png"
              alt="User"
              className="inline h-6 w-6 mr-1 mb-1 border border-white-600"
            />
            {user?.role?.toUpperCase() || "Guest"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
