import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminPages.css";
import api from "../api";

export default function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get("/admin/users/"),
        api.get("/admin/stats/"),
      ]);
      const u = usersRes.data;
      setUsers(Array.isArray(u) ? u : u?.results || []);
      setStats(statsRes.data || {});
    } catch {
      setUsers([]);
      setStats({});
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    const total = users.length;
    const active = users.filter((x) => x.is_active).length;
    const managers = users.filter((x) => x.is_staff && !x.is_superuser).length;
    const blocked = users.filter((x) => !x.is_active).length;
    return { total, active, managers, blocked };
  }, [users]);

  const toggleUser = async (userId) => {
    try {
      await api.post(`/admin/toggle-user/${userId}/`);
      await load();
    } catch {
      window.alert("Impossible de modifier le statut.");
    }
  };

  return (
    <AdminShell
      title={t("adminUsersTitle")}
      subtitle={t("adminUsersSubtitle")}
    >
      <div className="admin-page-grid">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <input
              className="admin-input"
              placeholder="Rechercher un utilisateur..."
            />
            <select className="admin-select" defaultValue="all">
              <option value="all">Tous les rôles</option>
              <option value="user">Users</option>
              <option value="manager">Managers</option>
            </select>
          </div>

          <div className="admin-toolbar-right">
            <button type="button" className="admin-secondary-btn">
              Exporter
            </button>
            <button type="button" className="admin-primary-btn">
              Ajouter un utilisateur
            </button>
          </div>
        </div>

        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <h3>Total utilisateurs</h3>
            <p>{stats?.total_users ?? kpis.total}</p>
          </div>
          <div className="admin-kpi-card">
            <h3>Actifs</h3>
            <p>{stats?.active_users ?? kpis.active}</p>
          </div>
          <div className="admin-kpi-card">
            <h3>Managers</h3>
            <p>{kpis.managers}</p>
          </div>
          <div className="admin-kpi-card">
            <h3>Bloqués</h3>
            <p>{stats?.blocked_users ?? kpis.blocked}</p>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Liste des utilisateurs</h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun utilisateur</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const role = user.is_superuser
                      ? "Super admin"
                      : user.is_staff
                        ? "Manager"
                        : "User";
                    const status = user.is_active ? "Actif" : "Bloqué";
                    return (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{role}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              status === "Actif"
                                ? "status-active"
                                : "status-blocked"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="admin-tag-btn">
                            Voir
                          </button>{" "}
                          <button type="button" className="admin-secondary-btn">
                            Modifier
                          </button>{" "}
                          <button
                            type="button"
                            className="admin-danger-btn"
                            onClick={() => toggleUser(user.id)}
                          >
                            {user.is_active ? "Bloquer" : "Débloquer"}
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
