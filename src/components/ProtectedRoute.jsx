import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    <div>
      <h2>Access Denied</h2>
      <p>You must be logged in to view this page.</p>
    </div>
    navigate("/login");
  }

  return children;
}
