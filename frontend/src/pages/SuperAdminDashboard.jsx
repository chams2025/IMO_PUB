import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/SuperAdminDashboard.css";
import logo from "../assets/logo-gold.png";
import api from "../api";
import {
  buildDashboardActivities,
  citiesToPercentBars,
  formatMonthShort,
  typesToPercents,
} from "../utils/adminData";

function polylinePointsSa(values) {
  const n = values.length;
  if (n < 2) return "0,170 600,170";
  const nums = values.map((v) => Number(v) || 0);
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const range = max - min || 1;
  return nums
    .map((v, i) => {
      const x = (i / (n - 1)) * 600;
      const ny = (v - min) / range;
      const y = 210 - ny * 175;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("light");
  const [language, setLanguage] = React.useState("FR");

  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [recent, setRecent] = useState({});
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, chartsRes, recentRes, staffRes] = await Promise.all([
          api.get("/admin/stats/"),
          api.get("/admin/charts/"),
          api.get("/admin/recent-activity/"),
          api.get("/super-admin/managers/"),
        ]);
        if (cancelled) return;
        setStats(statsRes.data || {});
        setCharts(chartsRes.data || {});
        setRecent(recentRes.data || {});
        const s = staffRes.data;
        setStaff(Array.isArray(s) ? s : s?.results || []);
      } catch {
        if (!cancelled) {
          setStats({});
          setCharts({});
          setRecent({});
          setStaff([]);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }) =>
    isActive ? "sa-menu-item active" : "sa-menu-item";

  const changeTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const annMonths = useMemo(
    () => (charts.annonces_by_month || []).slice(-7),
    [charts]
  );
  const annPointsGold = useMemo(
    () => polylinePointsSa(annMonths.map((x) => x.count)),
    [annMonths]
  );
  const annPointsBlue = useMemo(
    () =>
      polylinePointsSa(
        annMonths.map((x) => Math.round((Number(x.count) || 0) * 0.85))
      ),
    [annMonths]
  );

  const typePercents = useMemo(
    () => typesToPercents(charts.annonces_by_type),
    [charts]
  );
  const donutTotal = stats.total_annonces ?? "—";

  const cityBars = useMemo(
    () => citiesToPercentBars(charts.annonces_by_city, 5),
    [charts]
  );

  const activities = useMemo(
    () => buildDashboardActivities(recent).slice(0, 4),
    [recent]
  );

  const managersActive = useMemo(
    () => staff.filter((m) => m.is_active && !m.is_superuser).length,
    [staff]
  );

  const staffNonSuper = useMemo(
    () => staff.filter((m) => !m.is_superuser),
    [staff]
  );
  const superCount = useMemo(
    () => staff.filter((m) => m.is_superuser).length,
    [staff]
  );
  const particuliers = Math.max(
    0,
    (stats.total_users || 0) - staff.length
  );

  return (
    <div className="sa-dashboard">
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <img src={logo} alt="Saheliq" />
          <span>Saheliq</span>
        </div>

        <p className="sa-sidebar-label">SUPER ADMIN</p>

        <nav className="sa-menu">
          <NavLink to="/super-admin-dashboard" className={navClass}>
            <span>▦</span> Tableau de bord
          </NavLink>
          <NavLink to="/super-admin/managers" className={navClass}>
            <span>👥</span> Managers
          </NavLink>
          <NavLink to="/super-admin/users" className={navClass}>
            <span>👤</span> Utilisateurs
          </NavLink>
          <NavLink to="/super-admin/annonces" className={navClass}>
            <span>📣</span> Annonces
          </NavLink>
          <NavLink to="/super-admin/reports" className={navClass}>
            <span>⚠</span> Signalements
          </NavLink>
          <NavLink to="/super-admin/stats" className={navClass}>
            <span>▣</span> Statistiques
          </NavLink>
          <NavLink to="/super-admin/activity" className={navClass}>
            <span>●</span> Activité récente
          </NavLink>
          <NavLink to="/super-admin/settings" className={navClass}>
            <span>⚙</span> Paramètres
          </NavLink>

          <button className="sa-menu-item sa-logout" onClick={logout}>
            <span>⏻</span> Déconnexion
          </button>
        </nav>

        <div className="sa-quick-card">
          <h4>Aperçu rapide</h4>
          <p>
            <span></span> Plateforme en ligne
          </p>
          <small>Version 2.4.1</small>
        </div>
      </aside>

      <main className="sa-main">
        <header className="sa-header">
          <div>
            <h1>Super Admin Dashboard</h1>
            <p>Vue d’ensemble complète de la plateforme</p>
          </div>
          <div className="sa-header-actions">
            <div className="sa-profile-wrap">
              <button
                type="button"
                className="sa-profile"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <div className="sa-avatar">S</div>
                <div>
                  <strong>Super Admin</strong>
                  <span>Super Administrateur</span>
                </div>
                <em>⌄</em>
              </button>

              {profileOpen && (
                <div className="sa-profile-menu">
                  <button type="button" onClick={changeTheme}>
                    {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
                  </button>

                  <div className="sa-lang-title">Language</div>

                  <button type="button" onClick={() => changeLanguage("FR")}>
                    🇫🇷 Français {language === "FR" && "✓"}
                  </button>

                  <button type="button" onClick={() => changeLanguage("EN")}>
                    🇬🇧 English {language === "EN" && "✓"}
                  </button>

                  <button type="button" onClick={() => changeLanguage("AR")}>
                    🇩🇿 العربية {language === "AR" && "✓"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="sa-kpis">
          <Kpi
            icon="👥"
            title="Utilisateurs totaux"
            value={String(stats.total_users ?? "—")}
            trend="—"
            good
          />
          <Kpi
            icon="🏷"
            title="Annonces totales"
            value={String(stats.total_annonces ?? "—")}
            trend="—"
            good
          />
          <Kpi
            icon="⚠"
            title="Signalements"
            value={String(stats.total_reports ?? "—")}
            trend="—"
            danger
          />
          <Kpi
            icon="🛡"
            title="Managers actifs"
            value={String(managersActive)}
            trend="—"
            good
          />
          <Kpi
            icon="🎯"
            title="Visites plateforme"
            value="98,745"
            trend="↑ 15.8%"
            good
          />
        </section>

        <section className="sa-grid top">
          <div className="sa-card sa-line-card">
            <div className="sa-card-head">
              <h2>Évolution des annonces</h2>
              <button type="button">6 derniers mois⌄</button>
            </div>

            <div className="sa-chart-legend">
              <span>
                <i className="gold"></i> Annonces publiées
              </span>
              <span>
                <i className="blue"></i> Estimation active
              </span>
            </div>

            <div className="sa-line-chart">
              <svg viewBox="0 0 600 220" preserveAspectRatio="none">
                <polyline points={annPointsGold} />
                <polyline
                  className="blue-line"
                  points={annPointsBlue}
                />
              </svg>
              <div className="sa-months">
                {annMonths.length > 0 ? (
                  annMonths.map((m, i) => (
                    <span key={i}>{formatMonthShort(m.month)}</span>
                  ))
                ) : (
                  <>
                    <span>—</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="sa-card">
            <h2>Annonces par catégorie</h2>
            <div className="sa-donut-row">
              <div className="sa-donut">
                <div>
                  <strong>{donutTotal}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="sa-donut-list">
                {typePercents.length === 0 ? (
                  <p>
                    <span>
                      <i className="gold"></i> —
                    </span>
                    <b>—</b>
                  </p>
                ) : (
                  typePercents.slice(0, 5).map((item, i) => (
                    <p key={item.label + i}>
                      <span>
                        <i
                          className={
                            ["gold", "navy", "purple", "green", "gray"][i % 5]
                          }
                        ></i>{" "}
                        {item.label}
                      </span>
                      <b>{item.pct}%</b>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="sa-grid bottom">
          <div className="sa-card">
            <h2>Utilisateurs par rôle</h2>
            <div className="sa-role-wrap">
              <div className="sa-role-donut">
                <div>
                  <strong>{stats.total_users ?? "—"}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="sa-role-list">
                <p>
                  <span>
                    <i className="gold"></i> Particuliers
                  </span>
                  <b>{particuliers}</b>
                </p>
                <p>
                  <span>
                    <i className="navy"></i> Managers
                  </span>
                  <b>{staffNonSuper.length}</b>
                </p>
                <p>
                  <span>
                    <i className="green"></i> Super admins
                  </span>
                  <b>{superCount}</b>
                </p>
                <p>
                  <span>
                    <i className="purple"></i> Staff total
                  </span>
                  <b>{staff.length}</b>
                </p>
              </div>
            </div>
          </div>

          <div className="sa-card">
            <h2>Activité récente</h2>
            <div className="sa-activity">
              {activities.length === 0 ? (
                <Activity
                  icon="ℹ️"
                  title="Aucune activité"
                  text="Les événements récents s’afficheront ici."
                  time="—"
                />
              ) : (
                activities.map((item) => (
                  <Activity
                    key={item.id}
                    icon={
                      item.id.startsWith("ann")
                        ? "🏠"
                        : item.id.startsWith("msg")
                          ? "✉️"
                          : "👤"
                    }
                    title={item.action}
                    text={`${item.name} · ${item.time}`}
                    time={item.time}
                  />
                ))
              )}
            </div>
          </div>

          <div className="sa-card">
            <h2>Top 5 des villes</h2>
            {cityBars.length === 0 ? (
              <City name="—" value="—" width="0%" />
            ) : (
              cityBars.map((c) => (
                <City
                  key={c.name}
                  name={c.name}
                  value={String(c.count)}
                  width={`${c.value}%`}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ icon, title, value, trend, good, danger }) {
  return (
    <div className="sa-kpi">
      <div className="sa-kpi-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span className={danger ? "danger" : good ? "good" : ""}>
          {trend} <small>vs mois dernier</small>
        </span>
      </div>
    </div>
  );
}

function Activity({ icon, title, text, time }) {
  return (
    <div className="sa-activity-item">
      <div>{icon}</div>
      <section>
        <strong>{title}</strong>
        <p>{text}</p>
      </section>
      <span>{time}</span>
    </div>
  );
}

function City({ name, value, width }) {
  return (
    <div className="sa-city">
      <span>{name}</span>
      <div>
        <i style={{ width }}></i>
      </div>
      <b>{value}</b>
    </div>
  );
}
