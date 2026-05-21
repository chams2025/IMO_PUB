import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function AdminLogin() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await api.post("/admin/login/", {
        username: loginData.email,
        password: loginData.password,
      });

      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      localStorage.setItem("username", res.data.username || loginData.email);

      const profileRes = await api.get("/profile/");
      const user = profileRes.data;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.is_superuser) {
        localStorage.clear();
        setLoginError("Ce login est réservé aux admins seulement.");
        return;
      }

      if (user.is_staff) {
        navigate("/admin-dashboard", { replace: true });
      } else {
        localStorage.clear();
        setLoginError("Vous n'avez pas les droits d'administration.");
      }
    } catch (error) {
      console.error(error);
      setLoginError("Erreur serveur. Vérifiez que le backend Django est lancé.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: "450px", minHeight: "auto" }}>
        <div className="form-container sign-in" style={{ width: "100%", position: "relative" }}>
          <form onSubmit={handleLogin}>
            <h1>Connexion Admin</h1>
            <span>Manager uniquement</span>

            <input
              type="text"
              placeholder="Email ou nom d'utilisateur"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />

            {loginError && <p className="auth-error">{loginError}</p>}

            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Connexion..." : "Connexion Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
