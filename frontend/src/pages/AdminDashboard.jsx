import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/AdminDashboard.css";
import logo from "../assets/logo-gold.png";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";
import { useI18n } from "../i18n/I18nContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import {
  buildDashboardActivities,
  cityBarsFromCharts,
  formatDateFr,
  formatMonthShort,
  scaleCountsForLine,
  typesToPercents,
  userMapFromRows,
  annonceMapFromRows,
} from "../utils/adminData";

const TYPE_DOT = ["gold", "blue", "light", "dark"];

function polylinePoints(values, invertY = true) {
  const n = values.length;
  if (n < 2) return "0,50 100,50";
  const nums = values.map((v) => Number(v) || 0);
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const range = max - min || 1;
  return nums
    .map((v, i) => {
      const x = (i / (n - 1)) * 100;
      const ny = (v - min) / range;
      const y = invertY ? 90 - ny * 75 : 10 + ny * 75;
      return `${x},${y}`;
    })
    .join(" ");
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const menuRef = useRef(null);

  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState({});
  const [charts, setCharts] = useState({});
  const [reportRows, setReportRows] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [annoncesList, setAnnoncesList] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [
          statsRes,
          recentRes,
          chartsRes,
          reportsRes,
          usersRes,
          annoncesRes,
        ] = await Promise.all([
          api.get("/admin/stats/"),
          api.get("/admin/recent-activity/"),
          api.get("/admin/charts/"),
          api.get("/admin/reports/"),
          api.get("/admin/users/"),
          api.get("/admin/annonces/"),
        ]);
        if (cancelled) return;
        setStats(statsRes.data || {});
        setRecent(recentRes.data || {});
        setCharts(chartsRes.data || {});
        const rep = reportsRes.data;
        setReportRows(Array.isArray(rep) ? rep : rep?.results || []);
        const u = usersRes.data;
        setUsersList(Array.isArray(u) ? u : u?.results || []);
        const an = annoncesRes.data;
        setAnnoncesList(Array.isArray(an) ? an : an?.results || []);
      } catch {
        if (!cancelled) {
          setStats({});
          setRecent({});
          setCharts({});
          setReportRows([]);
          setUsersList([]);
          setAnnoncesList([]);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const userMap = useMemo(() => userMapFromRows(usersList), [usersList]);
  const annonceMap = useMemo(
    () => annonceMapFromRows(annoncesList),
    [annoncesList]
  );

  const cityBars = useMemo(
    () => cityBarsFromCharts(charts.annonces_by_city, 8),
    [charts]
  );

  const typePercents = useMemo(
    () => typesToPercents(charts.annonces_by_type),
    [charts]
  );

  const annMonths = useMemo(
    () => (charts.annonces_by_month || []).slice(-6),
    [charts]
  );
  const usrMonths = useMemo(
    () => (charts.users_by_month || []).slice(-6),
    [charts]
  );

  const evolutionData = useMemo(
    () => scaleCountsForLine(annMonths.map((x) => x.count)),
    [annMonths]
  );
  const newUsersData = useMemo(
    () => scaleCountsForLine(usrMonths.map((x) => x.count)),
    [usrMonths]
  );

  const annoncePoints = useMemo(
    () => polylinePoints(annMonths.map((x) => Number(x.count) || 0)),
    [annMonths]
  );
  const userPoints = useMemo(
    () => polylinePoints(usrMonths.map((x) => Number(x.count) || 0)),
    [usrMonths]
  );

  const dashboardActivities = useMemo(
    () => buildDashboardActivities(recent).slice(0, 8),
    [recent]
  );

  const tableReports = useMemo(
    () => reportRows.slice(0, 8),
    [reportRows]
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="admin-logo">
          <img className="admin-logo-img" src={logo} alt="Saheliq logo" />
          <span>Saheliq</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>📊</span> {t("navDashboard")}
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>👤</span> {t("navUsers")}
          </NavLink>

          <NavLink
            to="/admin/annonces"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>🏠</span> {t("navAnnonces")}
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>🚩</span> {t("navReports")}
          </NavLink>

          <NavLink
            to="/admin/stats"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>📈</span> {t("navStats")}
          </NavLink>

          <NavLink
            to="/admin/activity"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>🕒</span> {t("navActivity")}
          </NavLink>
        </nav>
        <button className="menu-item logout" type="button" onClick={handleLogout}>
          <span>⏻</span> {t("navLogout")}
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>{t("adminDashboardTitle")}</h1>
            <p>{t("adminDashboardSubtitle")}</p>
          </div>

          <div className="topbar-right">
            <div className="admin-menu-wrapper" ref={menuRef}>
              <button
                className="profile-box profile-box-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                type="button"
              >
                <div className="avatar">A</div>
                <div>
                  <h4>Admin</h4>
                  <span>{t("roleManager")}</span>
                </div>
              </button>

              {menuOpen && (
                <div className="admin-dropdown-menu">
                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={toggleTheme}
                  >
                    {theme === "light" ? `🌙 ${t("darkMode")}` : `☀️ ${t("lightMode")}`}
                  </button>

                  <div className="admin-dropdown-item lang-dropdown-item">
                    <LanguageSwitcher />
                  </div>

                  <button
                    type="button"
                    className="admin-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    ⏻ {t("navLogout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <h3>Total utilisateurs</h3>
              <p>{stats.total_users ?? "—"}</p>
            </div>
            <span className="stat-icon">👥</span>
          </div>

          <div className="stat-card">
            <div>
              <h3>Utilisateurs actifs</h3>
              <p>{stats.active_users ?? "—"}</p>
            </div>
            <span className="stat-icon">🟡</span>
          </div>

          <div className="stat-card">
            <div>
              <h3>Total annonces</h3>
              <p>{stats.total_annonces ?? "—"}</p>
            </div>
            <span className="stat-icon">📨</span>
          </div>

          <div className="stat-card">
            <div>
              <h3>Total messages</h3>
              <p>{stats.total_messages ?? "—"}</p>
            </div>
            <span className="stat-icon">✉️</span>
          </div>
        </section>

        <section className="content-grid two-cols">
          <div className="card">
            <h2>Annonces par ville</h2>

            <div className="bar-chart">
              {cityBars.length === 0 ? (
                <p>Aucune donnée</p>
              ) : (
                cityBars.map((item, index) => (
                  <div key={`${item.ville}-${index}`} className="bar-group">
                    <div className="bars">
                      <div
                        className={`bar ${item.barClass}`}
                        style={{ height: `${item.heightPx}px` }}
                      ></div>
                    </div>
                    <span>{item.ville}</span>
                  </div>
                ))
              )}
            </div>

            <div className="legend">
              {cityBars.slice(0, 4).map((item, index) => (
                <span key={`${item.ville}-lg-${index}`}>
                  <i className={`legend-color ${item.barClass}`}></i>{" "}
                  {item.ville}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Annonces par type</h2>

            <div className="donut-visual-wrap">
              <div className="donut-chart-clean"></div>

              <div className="donut-legend-list">
                {typePercents.length === 0 ? (
                  <div className="donut-legend-item">
                    <div>
                      <i className="legend-dot gold"></i>
                      <span>—</span>
                    </div>
                    <strong>—</strong>
                  </div>
                ) : (
                  typePercents.slice(0, 6).map((item, i) => (
                    <div key={item.label + i} className="donut-legend-item">
                      <div>
                        <i
                          className={`legend-dot ${TYPE_DOT[i % TYPE_DOT.length]}`}
                        ></i>
                        <span>{item.label}</span>
                      </div>
                      <strong>{item.pct}%</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid two-cols">
          <div className="card">
            <h2>Évolution des annonces</h2>
            <div className="line-chart">
              {evolutionData.map((point, index) => (
                <div
                  key={`ev-${index}`}
                  className="line-point"
                  style={{
                    left: `${index * 22}%`,
                    bottom: `${point}px`,
                  }}
                >
                  <span className="dot"></span>
                </div>
              ))}
              <svg className="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#c89c3d"
                  strokeWidth="2"
                  points={annoncePoints}
                />
              </svg>
            </div>
            <div className="line-labels">
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

          <div className="card">
            <h2>Nouveaux utilisateurs</h2>
            <div className="line-chart">
              {newUsersData.map((point, index) => (
                <div
                  key={`nu-${index}`}
                  className="line-point"
                  style={{
                    left: `${index * 22}%`,
                    bottom: `${point}px`,
                  }}
                >
                  <span className="dot"></span>
                </div>
              ))}
              <svg className="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#d7b16a"
                  strokeWidth="2"
                  points={userPoints}
                />
              </svg>
            </div>
            <div className="line-labels">
              {usrMonths.length > 0 ? (
                usrMonths.map((m, i) => (
                  <span key={i}>{formatMonthShort(m.month)}</span>
                ))
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="card reports-card">
            <h2>Signalements récents</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Ville</th>
                    <th>Raison</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableReports.length === 0 ? (
                    <tr>
                      <td colSpan={4}>Aucun signalement</td>
                    </tr>
                  ) : (
                    tableReports.map((report) => {
                      const u = userMap[report.user];
                      const a = annonceMap[report.annonce];
                      return (
                        <tr key={report.id}>
                          <td>{u?.username ?? `#${report.user}`}</td>
                          <td>{a?.ville ?? "—"}</td>
                          <td>{report.reason}</td>
                          <td>{formatDateFr(report.created_at)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button type="button">Précédent</button>
              <button type="button" className="active-page">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">Suivant</button>
            </div>
          </div>

          <div className="right-column">
            <div className="card">
              <h2>Activité récente</h2>
              <div className="activity-list">
                {dashboardActivities.length === 0 ? (
                  <div className="activity-item">
                    <div className="activity-content">
                      <p>Aucune activité récente</p>
                    </div>
                  </div>
                ) : (
                  dashboardActivities.map((item) => (
                    <div className="activity-item" key={item.id}>
                      <div className="activity-avatar">
                        {(item.name || "X").charAt(0)}
                      </div>
                      <div className="activity-content">
                        <strong>{item.name}</strong>
                        <p>{item.action}</p>
                      </div>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <h2>Actions rapides</h2>
              <div className="quick-actions">
                <button type="button" className="quick-btn primary">
                  Envoyer notification
                </button>
                <button type="button" className="quick-btn">
                  Voir les annonces
                </button>
                <button type="button" className="quick-btn">
                  Voir les signalements
                </button>
                <button type="button" className="quick-btn">
                  Voir les utilisateurs
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
