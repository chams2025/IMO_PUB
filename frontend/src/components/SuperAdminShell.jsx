import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo-gold.png";
import "../styles/SuperAdminDashboard.css";
import LanguageSwitcher from "./LanguageSwitcher";
import ConfirmModal from "./ConfirmModal";
import { useI18n } from "../i18n/I18nContext";

export default function SuperAdminShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    isActive ? "sa-menu-item active" : "sa-menu-item";

  return (
    <div className="sa-dashboard">
      <ConfirmModal
        open={confirmLogout}
        title={t("logout")}
        message={t("confirmLogout")}
        danger
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <img src={logo} alt="Saheliq" />
          <span>Saheliq</span>
        </div>
        <p className="sa-sidebar-label">{t("superAdmin").toUpperCase()}</p>
        <nav className="sa-menu">
          <NavLink to="/super-admin-dashboard" className={navClass}>
            <span>▦</span> {t("navDashboard")}
          </NavLink>
          <NavLink to="/super-admin/managers" className={navClass}>
            <span>👥</span> {t("navManagers")}
          </NavLink>
          <NavLink to="/super-admin/users" className={navClass}>
            <span>👤</span> {t("navUsers")}
          </NavLink>
          <NavLink to="/super-admin/annonces" className={navClass}>
            <span>📣</span> {t("navAnnonces")}
          </NavLink>
          <NavLink to="/super-admin/reports" className={navClass}>
            <span>⚠</span> {t("navReports")}
          </NavLink>
          <NavLink to="/super-admin/stats" className={navClass}>
            <span>▣</span> {t("navStats")}
          </NavLink>
          <NavLink to="/super-admin/contact-messages" className={navClass}>
            <span>✉️</span> {t("navContactAgency")}
          </NavLink>
          <NavLink to="/super-admin/activity" className={navClass}>
            <span>●</span> {t("navActivity")}
          </NavLink>
          <NavLink to="/super-admin/settings" className={navClass}>
            <span>⚙</span> {t("navSettings")}
          </NavLink>
          <button className="sa-menu-item sa-logout" type="button" onClick={() => setConfirmLogout(true)}>
            <span>⏻</span> {t("navLogout")}
          </button>
        </nav>
        <div className="sa-quick-card">
          <h4>{t("quickOverview")}</h4>
          <p><span></span> {t("platformOnline")}</p>
        </div>
      </aside>
      <main className="sa-main">
        <header className="sa-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <LanguageSwitcher />
        </header>
        {children}
      </main>
    </div>
  );
}
