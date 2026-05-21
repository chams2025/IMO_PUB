import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getApiError } from "../utils/apiError";
import ConfirmModal from "../components/ConfirmModal";
import { useI18n } from "../i18n/I18nContext";
import "../styles/Profile.css";

export default function Profile() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api
      .get("/profile/")
      .then((res) => {
        setProfile({ username: res.data.username, email: res.data.email });
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch((err) => setError(getApiError(err)));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api.patch("/profile/", profile);
      localStorage.setItem("user", JSON.stringify(res.data));
      setSuccess("Profil mis a jour.");
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess("Mot de passe modifie.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/delete-account/");
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getApiError(err));
      setConfirmDelete(false);
    }
  };

  return (
    <div className="profile-page">
      <ConfirmModal
        open={confirmDelete}
        title={t("delete")}
        message="Etes-vous sur de vouloir supprimer votre compte ?"
        danger
        onConfirm={deleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
      <h1>{t("profile")}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="profile-card" onSubmit={saveProfile}>
        <h2>Informations</h2>
        <label>
          Username
          <input
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </label>
        <button type="submit" className="gold-btn">
          {t("save")}
        </button>
      </form>

      <form className="profile-card" onSubmit={changePassword}>
        <h2>Mot de passe</h2>
        <label>
          Ancien mot de passe
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </label>
        <label>
          Nouveau mot de passe
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <button type="submit" className="gold-btn">
          Changer le mot de passe
        </button>
      </form>

      <div className="profile-card danger-zone">
        <h2>Zone sensible</h2>
        <button
          type="button"
          className="danger-btn"
          onClick={() => setConfirmDelete(true)}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
