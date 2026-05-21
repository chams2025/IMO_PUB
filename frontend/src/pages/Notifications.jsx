import React, { useEffect, useMemo, useState } from "react";
import "../styles/Notifications.css";
import api from "../api";

function fmtNotifTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function mapUiType(type_notification) {
  switch (type_notification) {
    case "message":
      return "message";
    case "annonce":
      return "favorite";
    case "system":
      return "system";
    default:
      return "listing";
  }
}

function mapTag(type_notification) {
  switch (type_notification) {
    case "message":
      return "Messagerie";
    case "annonce":
      return "Annonces";
    case "system":
      return "Compte";
    default:
      return "Alerte";
  }
}

function normalizeNotifications(apiData) {
  const rows = Array.isArray(apiData) ? apiData : [];
  return rows.map((n) => ({
    ...n,
    read: Boolean(n.is_read),
    title: n.titre != null ? String(n.titre) : "",
    description: n.contenu != null ? String(n.contenu) : "",
    time: fmtNotifTime(n.created_at),
    type: mapUiType(n.type_notification),
    tag: mapTag(n.type_notification),
  }));
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/notifications/");
        if (!cancelled) setNotifications(normalizeNotifications(data));
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.read);
    }
    if (filter === "read") {
      return notifications.filter((item) => item.read);
    }
    return notifications;
  }, [notifications, filter]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true, is_read: true } : item
        )
      );
    } catch {
      window.alert("Action impossible pour le moment.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read/");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true, is_read: true }))
      );
    } catch {
      window.alert("Action impossible pour le moment.");
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch {
      window.alert("Suppression impossible.");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return "✉";
      case "favorite":
        return "♥";
      case "listing":
        return "▣";
      case "visit":
        return "◔";
      case "alert":
        return "⚑";
      default:
        return "✦";
    }
  };

  return (
    <main className="notifications-page">
      <div className="notifications-shell">
        <section className="notifications-hero">
          <div className="notifications-hero-copy">
            <span className="notifications-kicker">Centre de notifications</span>
            <h1>Restez informé de tout ce qui compte</h1>
            <p>
              Suivez vos messages, l’activité sur vos annonces, vos performances
              et les alertes utiles depuis une interface claire, premium et
              professionnelle.
            </p>

            <div className="notifications-hero-actions">
              <button className="gold-btn" onClick={markAllAsRead}>
                Tout marquer comme lu
              </button>
              <button className="outline-btn">Préférences</button>
            </div>
          </div>

          <aside className="notifications-summary-card">
            <span className="section-tag">Résumé</span>
            <h3>Votre activité récente</h3>

            <div className="summary-metric">
              <strong>{notifications.length}</strong>
              <span>Notifications totales</span>
            </div>

            <div className="summary-metric">
              <strong>{unreadCount}</strong>
              <span>Notifications non lues</span>
            </div>

            <div className="summary-mini-list">
              <div>
                <b>Messagerie</b>
                <span>Réponses et nouveaux contacts</span>
              </div>
              <div>
                <b>Annonces</b>
                <span>Vues, favoris et publications</span>
              </div>
              <div>
                <b>Compte</b>
                <span>Conseils et rappels utiles</span>
              </div>
            </div>
          </aside>
        </section>

        {loading && (
          <p className="notifications-loading-hint">Chargement…</p>
        )}

        <section className="notifications-toolbar">
          <div className="toolbar-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Toutes
            </button>
            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Non lues
            </button>
            <button
              className={filter === "read" ? "active" : ""}
              onClick={() => setFilter("read")}
            >
              Lues
            </button>
          </div>

          <div className="toolbar-badge">
            <span>{filteredNotifications.length}</span>
            <p>éléments affichés</p>
          </div>
        </section>

        {!loading && filteredNotifications.length === 0 && (
          <section className="notifications-empty">
            <div className="empty-icon">✦</div>
            <h2>Aucune notification</h2>
            <p>Tout est à jour pour le moment.</p>
          </section>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <section className="notifications-list">
            {filteredNotifications.map((item) => (
              <article
                key={item.id}
                className={`notification-card ${item.read ? "is-read" : "is-unread"}`}
              >
                <div className="notification-icon-wrap">
                  <div className={`notification-icon type-${item.type}`}>
                    {getIcon(item.type)}
                  </div>
                  {!item.read && <span className="notification-dot" />}
                </div>

                <div className="notification-content">
                  <div className="notification-top">
                    <div>
                      <div className="notification-topline">
                        <span className="notification-tag">{item.tag}</span>
                        <span className="notification-time">{item.time}</span>
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                  </div>

                  <p>{item.description}</p>

                  <div className="notification-actions">
                    {!item.read && (
                      <button
                        className="text-btn"
                        onClick={() => markAsRead(item.id)}
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button type="button" className="text-btn">
                      Voir détails
                    </button>
                    <button
                      className="danger-text-btn"
                      onClick={() => removeNotification(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
