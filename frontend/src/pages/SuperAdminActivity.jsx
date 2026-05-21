import React, { useEffect, useMemo, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";
import api from "../api";
import { superAdminTimelineFromRecent } from "../utils/adminData";

export default function SuperAdminActivity() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/admin/recent-activity/");
        if (!cancelled) setRecent(data || {});
      } catch {
        if (!cancelled) setRecent({});
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activities = useMemo(
    () => superAdminTimelineFromRecent(recent),
    [recent]
  );

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(search.toLowerCase())
  );

  const nu = (recent.latest_users || []).length;
  const na = (recent.latest_annonces || []).length;
  const nm = (recent.latest_messages || []).length;

  return (
    <SuperAdminShell
      title={t("superActivityTitle")}
      subtitle={t("superActivitySubtitle")}
    >
      <div className="sa-page">
        <section className="sa-activity-hero">
          <div>
            <span className="sa-badge">AUDIT TRAIL</span>
            <h2>Centre d’activité</h2>
            <p>
              Consultez les actions récentes, les événements critiques et les
              changements effectués par les utilisateurs et managers.
            </p>
          </div>

          <div className="sa-activity-live">
            <span></span>
            <strong>Live tracking</strong>
            <p>Surveillance active</p>
          </div>
        </section>

        <section className="sa-activity-kpis">
          <div className="sa-activity-kpi">
            <span>⚡</span>
            <div>
              <p>Événements (aperçu)</p>
              <h3>{nu + na + nm}</h3>
            </div>
          </div>

          <div className="sa-activity-kpi">
            <span>🚩</span>
            <div>
              <p>Messages récents</p>
              <h3>{nm}</h3>
            </div>
          </div>

          <div className="sa-activity-kpi">
            <span>👥</span>
            <div>
              <p>Nouveaux comptes</p>
              <h3>{nu}</h3>
            </div>
          </div>

          <div className="sa-activity-kpi">
            <span>🏠</span>
            <div>
              <p>Annonces récentes</p>
              <h3>{na}</h3>
            </div>
          </div>
        </section>

        <section className="sa-activity-layout">
          <div className="sa-panel">
            <div className="sa-panel-head">
              <div>
                <h3>Flux d’activité</h3>
                <p>Timeline des actions récentes.</p>
              </div>

              <div className="sa-tools">
                <input
                  type="text"
                  placeholder="Rechercher une activité..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="button">Filtrer</button>
              </div>
            </div>

            <div className="sa-timeline">
              {filteredActivities.length === 0 ? (
                <article className="sa-timeline-item">
                  <div className="sa-timeline-icon normal">ℹ️</div>
                  <div className="sa-timeline-card">
                    <div className="sa-timeline-head">
                      <div>
                        <h4>Aucune activité</h4>
                        <p>Les données s’afficheront lorsque l’API sera disponible.</p>
                      </div>
                      <span>—</span>
                    </div>
                  </div>
                </article>
              ) : (
                filteredActivities.map((activity, index) => (
                  <article className="sa-timeline-item" key={activity.title + index}>
                    <div className={`sa-timeline-icon ${activity.level}`}>
                      {activity.icon}
                    </div>

                    <div className="sa-timeline-card">
                      <div className="sa-timeline-head">
                        <div>
                          <h4>{activity.title}</h4>
                          <p>{activity.description}</p>
                        </div>

                        <span>{activity.time}</span>
                      </div>

                      <div className="sa-timeline-meta">
                        <b>{activity.user}</b>
                        <em>{activity.type}</em>
                        <small>{activity.date}</small>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="sa-activity-side">
            <div className="sa-side-card dark">
              <h3>Résumé sécurité</h3>
              <p>
                Surveillez les messages et signalements depuis la section dédiée.
              </p>
              <button type="button">Voir détails</button>
            </div>

            <div className="sa-side-card">
              <h3>Sources</h3>

              <div className="sa-type-row">
                <span>Utilisateurs</span>
                <b>{nu}</b>
                <i
                  style={{
                    width: `${nu + na + nm ? Math.round((nu / (nu + na + nm)) * 100) : 0}%`,
                  }}
                ></i>
              </div>

              <div className="sa-type-row">
                <span>Annonces</span>
                <b>{na}</b>
                <i
                  style={{
                    width: `${nu + na + nm ? Math.round((na / (nu + na + nm)) * 100) : 0}%`,
                  }}
                ></i>
              </div>

              <div className="sa-type-row">
                <span>Messages</span>
                <b>{nm}</b>
                <i
                  style={{
                    width: `${nu + na + nm ? Math.round((nm / (nu + na + nm)) * 100) : 0}%`,
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
