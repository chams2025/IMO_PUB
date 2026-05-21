import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminPages.css";
import api from "../api";
import {
  formatDateFr,
  userMapFromRows,
  annonceMapFromRows,
} from "../utils/adminData";

export default function AdminReports() {
  const { t } = useI18n();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [annoncesList, setAnnoncesList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [repRes, statsRes, usersRes, annRes] = await Promise.all([
          api.get("/admin/reports/"),
          api.get("/admin/stats/"),
          api.get("/admin/users/"),
          api.get("/admin/annonces/"),
        ]);
        if (cancelled) return;
        const r = repRes.data;
        setReports(Array.isArray(r) ? r : r?.results || []);
        setStats(statsRes.data || {});
        const u = usersRes.data;
        setUsersList(Array.isArray(u) ? u : u?.results || []);
        const an = annRes.data;
        setAnnoncesList(Array.isArray(an) ? an : an?.results || []);
      } catch {
        if (!cancelled) {
          setReports([]);
          setStats({});
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

  const total = stats?.total_reports ?? reports.length;

  return (
    <AdminShell
      title={t("adminReportsTitle")}
      subtitle={t("adminReportsSubtitle")}
    >
      <div className="admin-page-grid">
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <h3>Signalements totaux</h3>
            <p>{total}</p>
          </div>
          <div className="admin-kpi-card">
            <h3>Urgents</h3>
            <p>—</p>
          </div>
          <div className="admin-kpi-card">
            <h3>Traités</h3>
            <p>—</p>
          </div>
          <div className="admin-kpi-card">
            <h3>En attente</h3>
            <p>{reports.length}</p>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Derniers signalements</h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Annonce</th>
                  <th>Raison</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun signalement</td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const u = userMap[report.user];
                    const a = annonceMap[report.annonce];
                    return (
                      <tr key={report.id}>
                        <td>{u?.username ?? `#${report.user}`}</td>
                        <td>{a?.titre ?? `#${report.annonce}`}</td>
                        <td>
                          <span className="status-pill status-report">
                            {report.reason}
                          </span>
                        </td>
                        <td>{formatDateFr(report.created_at)}</td>
                        <td>
                          <button type="button" className="admin-tag-btn">
                            Voir
                          </button>{" "}
                          <button type="button" className="admin-secondary-btn">
                            Ignorer
                          </button>{" "}
                          <button type="button" className="admin-danger-btn">
                            Supprimer annonce
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
