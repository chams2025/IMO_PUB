import React, { useEffect, useMemo, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";
import api from "../api";
import {
  formatDateFr,
  userMapFromRows,
  annonceMapFromRows,
} from "../utils/adminData";

export default function SuperAdminReports() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [annoncesList, setAnnoncesList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [repRes, usersRes, annRes] = await Promise.all([
          api.get("/admin/reports/"),
          api.get("/admin/users/"),
          api.get("/admin/annonces/"),
        ]);
        if (cancelled) return;
        const r = repRes.data;
        setReports(Array.isArray(r) ? r : r?.results || []);
        const u = usersRes.data;
        setUsersList(Array.isArray(u) ? u : u?.results || []);
        const an = annRes.data;
        setAnnoncesList(Array.isArray(an) ? an : an?.results || []);
      } catch {
        if (!cancelled) {
          setReports([]);
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

  const mapped = useMemo(
    () =>
      reports.map((report) => {
        const u = userMap[report.user];
        const a = annonceMap[report.annonce];
        return {
          id: report.id,
          user: u?.username ?? `#${report.user}`,
          annonce: a?.titre ?? `#${report.annonce}`,
          reason: report.reason,
          priority: "—",
          status: "En attente",
          date: formatDateFr(report.created_at),
        };
      }),
    [reports, userMap, annonceMap]
  );

  const filteredReports = mapped.filter((report) =>
    report.annonce.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SuperAdminShell
      title={t("superReportsTitle")}
      subtitle={t("superReportsSubtitle")}
    >
      <div className="sa-page">
        <section className="sa-reports-hero">
          <div>
            <span className="sa-badge">ALERT CENTER</span>
            <h2>Centre de signalements</h2>
            <p>
              Analysez les signalements, identifiez les annonces sensibles et
              traitez les alertes prioritaires.
            </p>
          </div>

          <div className="sa-report-warning">
            <strong>{reports.length}</strong>
            <span>Signalements</span>
          </div>
        </section>

        <section className="sa-reports-kpis">
          <div className="sa-report-kpi danger">
            <span>🚨</span>
            <div>
              <p>Urgents</p>
              <h3>—</h3>
            </div>
          </div>

          <div className="sa-report-kpi pending">
            <span>⏳</span>
            <div>
              <p>En attente</p>
              <h3>{reports.length}</h3>
            </div>
          </div>

          <div className="sa-report-kpi progress">
            <span>🔍</span>
            <div>
              <p>En cours</p>
              <h3>—</h3>
            </div>
          </div>

          <div className="sa-report-kpi solved">
            <span>✅</span>
            <div>
              <p>Résolus</p>
              <h3>—</h3>
            </div>
          </div>
        </section>

        <section className="sa-reports-layout">
          <div className="sa-panel">
            <div className="sa-panel-head">
              <div>
                <h3>Liste des signalements</h3>
                <p>Traitez les cas selon leur priorité.</p>
              </div>

              <div className="sa-tools">
                <input
                  type="text"
                  placeholder="Rechercher une annonce..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="button">Filtrer</button>
              </div>
            </div>

            <div className="sa-table-wrap">
              <table className="sa-pro-table sa-report-table">
                <thead>
                  <tr>
                    <th>Annonce</th>
                    <th>Utilisateur</th>
                    <th>Raison</th>
                    <th>Priorité</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7}>Aucun signalement</td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div className="sa-report-annonce">
                            <span>🏠</span>
                            <strong>{report.annonce}</strong>
                          </div>
                        </td>

                        <td>{report.user}</td>
                        <td>{report.reason}</td>

                        <td>
                          <span className="sa-priority medium">
                            {report.priority}
                          </span>
                        </td>

                        <td>
                          <span className="sa-status pending">
                            {report.status}
                          </span>
                        </td>

                        <td>{report.date}</td>

                        <td>
                          <div className="sa-action-row">
                            <button type="button" className="sa-action-btn">
                              Examiner
                            </button>
                            <button type="button" className="sa-action-btn danger">
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="sa-report-side">
            <div className="sa-side-card dark">
              <h3>Conseil de modération</h3>
              <p>
                Priorisez les signalements récents puis vérifiez les annonces
                avec plusieurs plaintes.
              </p>
              <button type="button">Voir règles</button>
            </div>

            <div className="sa-side-card">
              <h3>Total</h3>

              <div className="sa-type-row">
                <span>Signalements</span>
                <b>{reports.length}</b>
                <i
                  style={{
                    width: `${Math.min(reports.length * 5, 100)}%`,
                  }}
                ></i>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </SuperAdminShell>
  );
}
