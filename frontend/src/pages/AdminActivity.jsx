import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminPages.css";
import { FaUserPlus, FaHome, FaCog, FaEnvelope } from "react-icons/fa";
import api from "../api";
import { buildAdminTimeline } from "../utils/adminData";

export default function AdminActivity() {
  const { t } = useI18n();
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

  const activity = useMemo(() => buildAdminTimeline(recent), [recent]);

  return (
    <AdminShell
      title={t("adminActivityTitle")}
      subtitle={t("adminActivitySubtitle")}
    >
      <div className="admin-page-grid">
        <div className="admin-card">
          <h2 className="admin-card-title">Timeline d’activité</h2>

          <div className="activity-timeline">
            {activity.length === 0 ? (
              <div className="timeline-item">
                <div className="timeline-icon user">
                  <FaCog />
                </div>
                <div className="timeline-content">
                  <strong>Aucune activité</strong>
                  <p>Les données apparaîtront ici.</p>
                  <span>—</span>
                </div>
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div
                    className={`timeline-icon ${
                      item.type === "message" ? "annonce" : item.type
                    }`}
                  >
                    {item.type === "user" && <FaUserPlus />}
                    {item.type === "annonce" && <FaHome />}
                    {item.type === "message" && <FaEnvelope />}
                  </div>
                  <div className="timeline-content">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
