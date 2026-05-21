import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);

    if (!refresh) {
      setIsAuthorized(false);
      return;
    }

    try {
      const res = await api.post("/refresh/", {
        refresh,
      });

      if (res.status === 200 && res.data.access) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      localStorage.clear();
      setIsAuthorized(false);
    }
  };

  const authUser = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshAccessToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Token decode error:", error);
      localStorage.clear();
      setIsAuthorized(false);
    }
  };

 useEffect(() => {
  (async () => {
    await authUser()
  })()
}, [])

  if (isAuthorized === null) {
    return <LoadingIndicator />;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;