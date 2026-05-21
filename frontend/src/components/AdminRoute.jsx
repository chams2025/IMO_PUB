import { Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";

function AdminRoute({ children }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_staff) return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;