import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function SuperAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
     e.preventDefault();
     setError("");
     if (!username || !password) {
     setError("Veuillez remplir tous les champs.");
     return;
     }

    try {
      const res = await api.post("/super-admin/login/", { username, password });

      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

      const profileRes = await api.get("/profile/");
      const user = profileRes.data;

      if (!user.is_superuser) {
        localStorage.clear();
        setError("Ce login est réservé au super admin seulement.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("username", user.username);
      localStorage.setItem("email", user.email);

      navigate("/super-admin-dashboard", { replace: true });
    } catch {
      setError("Identifiants super admin incorrects.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Super Admin Login</h2>
      {error && <p>{error}</p>}

      <input
        type="text"
        placeholder="Username ou email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Se connecter super admin</button>
    </form>
  );
}