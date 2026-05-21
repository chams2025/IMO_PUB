import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";

function SuperAdminRoute({ children }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_superuser) return <Navigate to="/" replace />;

  return children;
}

export default SuperAdminRoute;