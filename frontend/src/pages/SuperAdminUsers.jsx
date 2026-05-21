import React, { useEffect, useMemo, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";
import api from "../api";

export default function SuperAdminUsers() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get("/admin/users/"),
          api.get("/admin/stats/"),
        ]);
        if (cancelled) return;
        const u = usersRes.data;
        setUsers(Array.isArray(u) ? u : u?.results || []);
        setStats(statsRes.data || {});
      } catch {
        if (!cancelled) {
          setUsers([]);
          setStats({});
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.username,
        email: u.email,
        type: u.is_superuser ? "Super admin" : u.is_staff ? "Manager" : "Particulier",
        status: u.is_active ? "Actif" : "Bloqué",
        annonces: u.annonces_count ?? "—",
        city: "—",
        date: "—",
      })),
    [users]
  );

  const filteredUsers = rows.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SuperAdminShell
      title={t("superUsersTitle")}
      subtitle={t("superUsersSubtitle")}
    >
      <div className="sa-page">
        <section className="sa-users-hero">
          <div>
            <span className="sa-badge">USER INSIGHTS</span>
            <h2>Centre des utilisateurs</h2>
            <p>
              Suivez les membres, leurs annonces, leur statut et leur activité
              sur la plateforme.
            </p>
          </div>

          <div className="sa-users-search">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button">Rechercher</button>
          </div>
        </section>

        <section className="sa-user-summary">
          <div className="sa-summary-main">
            <span>👥</span>
            <div>
              <p>Total utilisateurs</p>
              <h3>{stats.total_users ?? rows.length}</h3>
            </div>
          </div>

          <div className="sa-summary-side">
            <div>
              <strong>{stats.active_users ?? "—"}</strong>
              <span>Actifs</span>
            </div>
            <div>
              <strong>{stats.blocked_users ?? "—"}</strong>
              <span>Bloqués</span>
            </div>
            <div>
              <strong>{stats.total_annonces ?? "—"}</strong>
              <span>Annonces</span>
            </div>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h3>Comptes utilisateurs</h3>
              <p>Liste filtrable avec informations principales.</p>
            </div>

            <div className="sa-filter-pills">
              <button type="button" className="active">
                Tous
              </button>
              <button type="button">Actifs</button>
              <button type="button">Bloqués</button>
              <button type="button">Professionnels</button>
            </div>
          </div>

          <div className="sa-users-grid">
            {filteredUsers.length === 0 ? (
              <p>Aucun utilisateur</p>
            ) : (
              filteredUsers.map((user) => (
                <article className="sa-user-profile-card" key={user.id}>
                  <div className="sa-user-profile-top">
                    <div className="sa-user-avatar">{user.name.charAt(0)}</div>

                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>

                    <span
                      className={
                        user.status === "Actif"
                          ? "sa-status active"
                          : "sa-status blocked"
                      }
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="sa-user-profile-info">
                    <div>
                      <span>Type</span>
                      <strong>{user.type}</strong>
                    </div>
                    <div>
                      <span>Ville</span>
                      <strong>{user.city}</strong>
                    </div>
                    <div>
                      <span>Annonces</span>
                      <strong>{user.annonces}</strong>
                    </div>
                    <div>
                      <span>Inscrit le</span>
                      <strong>{user.date}</strong>
                    </div>
                  </div>

                  <div className="sa-user-profile-actions">
                    <button type="button">Voir profil</button>
                    <button type="button" className="danger">
                      Bloquer
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </SuperAdminShell>
  );
}
