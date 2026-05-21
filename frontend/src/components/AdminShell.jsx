import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo-gold.png";
import LanguageSwitcher from "./LanguageSwitcher";
import ConfirmModal from "./ConfirmModal";
import { useI18n } from "../i18n/I18nContext";

export default function AdminShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    isActive ? "menu-item active" : "menu-item";

  return (
    <div className="admin-dashboard">
      <ConfirmModal
        open={confirmLogout}
        title={t("logout")}
        message={t("confirmLogout")}
        danger
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
      <aside className="sidebar">
        <div className="admin-logo">
          <img className="admin-logo-img" src={logo} alt="Saheliq logo" />
          <span>Saheliq</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/admin-dashboard" className={navClass}>
            <span>📊</span> {t("navDashboard")}
          </NavLink>
          <NavLink to="/admin/users" className={navClass}>
            <span>👤</span> {t("navUsers")}
          </NavLink>
          <NavLink to="/admin/annonces" className={navClass}>
            <span>🏠</span> {t("navAnnonces")}
          </NavLink>
          <NavLink to="/admin/reports" className={navClass}>
            <span>🚩</span> {t("navReports")}
          </NavLink>
          <NavLink to="/admin/stats" className={navClass}>
            <span>📈</span> {t("navStats")}
          </NavLink>
          <NavLink to="/admin/activity" className={navClass}>
            <span>🕒</span> {t("navActivity")}
          </NavLink>
          <NavLink to="/admin/contact-messages" className={navClass}>
            <span>✉️</span> {t("navContactAgency")}
          </NavLink>
          <button
            type="button"
            className="menu-item logout-btn"
            onClick={() => setConfirmLogout(true)}
          >
            <span>⏻</span> {t("navLogout")}
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-right">
            <LanguageSwitcher />
            <div className="profile-box">
              <div className="avatar">A</div>
              <div>
                <h4>{t("roleManager")}</h4>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
