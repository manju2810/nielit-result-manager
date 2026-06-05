import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuth();

  // Token nahi hai — login page pe bhejo
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin only route pe normal user aaye
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;