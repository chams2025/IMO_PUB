import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import api from "../api";

const API_ORIGIN =
  (import.meta.env.VITE_APP_API_URL || "").replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:8000";

function getImageUrl(imageField) {
  if (!imageField) return "";
  const s = String(imageField);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const path = s.startsWith("/") ? s : `/${s}`;
  return `${API_ORIGIN}${path}`;
}

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

const Dashboard = () => {
  const username = localStorage.getItem("username") || "Utilisateur";
  const [stats, setStats] = useState(null);
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, annoncesRes, notifRes] = await Promise.all([
          api.get("/user/dashboard/"),
          api.get("/my-annonces/"),
          api.get("/notifications/"),
        ]);

        setStats(statsRes.data);
        const rawAnnonces = annoncesRes.data;
        setMyAnnonces(Array.isArray(rawAnnonces) ? rawAnnonces : []);
        const rawNotifs = notifRes.data;
        setNotifications(Array.isArray(rawNotifs) ? rawNotifs : []);
      } catch (err) {
        console.log("DASHBOARD ERROR:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const menu = [
    { name: "Tableau de bord", path: "/dashboard" },
    { name: "Mes annonces", path: "/mes-annonces" },
    { name: "Ajouter une annonce", path: "/publier" },
    { name: "Favoris", path: "/favoris" },
    { name: "Messages", path: "/mes-messages" },
    { name: "Notifications", path: "/notifications" },
    { name: "Déconnexion", path: "/logout" },
  ];
  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="sidebar">
          <nav className="menu">
            {menu.map((item, index) => (
              <Link
                to={item.path}
                key={item.name}
                className={`menu-item ${index === 0 ? "active" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <header className="welcome-header">
            <h1>
              Bonjour, <span>{username}</span>
            </h1>
            <p>Bienvenue dans votre espace personnel</p>
          </header>

          <section className="stats-grid">
            {[
              { title: "Mes annonces", value: stats?.my_annonces_count || 0, tag: "Annonces actives" },
              { title: "Messages non lus", value: stats?.my_messages_unread || 0, tag: "Cette semaine" },
              { title: "Mes favoris", value: stats?.my_favorites_count ||   0, tag: "Biens suivis" },
              { title: "Notifications", value: stats?.notifications_unread || 0, tag: "Nouvelles" },
            ].map((stat) => (
              <div className="stat-card" key={stat.title}>
                <div>
                  <h4>{stat.title}</h4>
                  <span>{stat.tag}</span>
                </div>
                <strong>{stat.value}</strong>
              </div>
            ))
          }
          </section>

          <section className="content-grid">
            <div className="panel large-panel">
              <div className="panel-header">
                <h3>Mes annonces récentes</h3>
                <button>+ Élément</button>
              </div>

              <div className="listing-list">
                {myAnnonces.slice(0, 3).map((item) => {
                  const imgSrc = getImageUrl(item.main_image || item.image);
                  const title = item.titre || "Annonce";
                  const sideDate = formatShortDate(item.date_publication);
                  return (
                    <div className="listing-item" key={item.id ?? title}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={title} />
                      ) : (
                        <div className="listing-item-thumb-placeholder" aria-hidden />
                      )}
                      <div className="listing-info">
                        <h4>{title}</h4>
                        <p>
                          {item.ville || "—"} • {item.type_bien || "—"}
                        </p>
                        <div className="listing-actions">
                          <Link to={`/annonces/${item.id}`}>Voir</Link>
                          <Link to={`/annonces/${item.id}/edit`}>Modifier</Link>
                          <Link to="/mes-annonces">Supprimer</Link>
                        </div>
                      </div>
                      <div className="listing-side">
                        <span>{sideDate}</span>
                        <Link
                          to={`/annonces/${item.id}`}
                          className="listing-link-btn"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel small-panel">
              <div className="panel-header">
                <h3>Notifications récentes</h3>
              </div>

              <div className="notification-list">
                {notifications.slice(0, 4).map((item, idx) => {
                  const titre = item.titre != null ? String(item.titre) : "";
                  const contenu =
                    item.contenu != null ? String(item.contenu) : "";
                  const initial =
                    titre.trim().length > 0
                      ? titre.trim().charAt(0).toUpperCase()
                      : "N";
                  const when = formatShortDate(item.created_at);
                  return (
                    <div
                      className="notification-item"
                      key={item.id != null ? `n-${item.id}` : `n-idx-${idx}`}
                    >
                      <div className="notification-avatar">{initial}</div>
                      <div className="notification-info">
                        <h4>{titre || "Notification"}</h4>
                        <p>{contenu}</p>
                      </div>
                      <span>{when}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;