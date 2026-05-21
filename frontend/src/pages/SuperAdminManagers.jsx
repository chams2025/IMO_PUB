import React, { useCallback, useEffect, useMemo, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";
import api from "../api";

export default function SuperAdminManagers() {
  const { t } = useI18n();
  const [managers, setManagers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/super-admin/managers/");
      setManagers(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setManagers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    const nonSuper = managers.filter((m) => !m.is_superuser);
    const total = nonSuper.length;
    const active = nonSuper.filter((m) => m.is_active).length;
    const blocked = nonSuper.filter((m) => !m.is_active).length;
    return { total, active, blocked };
  }, [managers]);

  const createManager = async (e) => {
    e.preventDefault();
    try {
      await api.post("/super-admin/managers/create/", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setForm({ username: "", email: "", password: "" });
      setCreating(false);
      await load();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Création impossible.";
      window.alert(msg);
    }
  };

  const toggleManager = async (userId, isSuperuser) => {
    if (isSuperuser) {
      window.alert("Impossible de modifier un super admin.");
      return;
    }
    try {
      await api.post(`/super-admin/managers/${userId}/toggle/`);
      await load();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Action impossible.";
      window.alert(msg);
    }
  };

  const displayRows = useMemo(
    () =>
      managers.map((m) => ({
        ...m,
        name: m.username,
        role: m.is_superuser ? "Super admin" : "Manager",
        status: m.is_active ? "Actif" : "Bloqué",
        annoncesDisplay: "—",
        dateDisplay: "—",
      })),
    [managers]
  );

  return (
    <SuperAdminShell
      title={t("superManagersTitle")}
      subtitle={t("superManagersSubtitle")}
    >
      <div className="sa-page">
        <section className="sa-hero-card">
          <div>
            <span className="sa-badge">SUPER ADMIN CONTROL</span>
            <h2>Managers de la plateforme</h2>
            <p>
              Gérez les managers, suivez leur activité et contrôlez leurs permissions.
            </p>
          </div>

          <button
            type="button"
            className="sa-primary-btn"
            onClick={() => setCreating((v) => !v)}
          >
            + Ajouter manager
          </button>
        </section>

        {creating && (
          <section className="sa-panel">
            <div className="sa-panel-head">
              <div>
                <h3>Nouveau manager</h3>
                <p>Renseignez les identifiants du compte manager.</p>
              </div>
            </div>
            <form className="sa-tools" onSubmit={createManager}>
              <input
                type="text"
                placeholder="Nom d’utilisateur"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
              <button type="submit">Créer</button>
            </form>
          </section>
        )}

        <section className="sa-page-kpis">
          <div className="sa-mini-card">
            <span className="sa-mini-icon">🛡️</span>
            <div>
              <p>Total managers</p>
              <h3>{kpis.total}</h3>
            </div>
          </div>

          <div className="sa-mini-card">
            <span className="sa-mini-icon green">✓</span>
            <div>
              <p>Managers actifs</p>
              <h3>{kpis.active}</h3>
            </div>
          </div>

          <div className="sa-mini-card">
            <span className="sa-mini-icon red">!</span>
            <div>
              <p>Comptes bloqués</p>
              <h3>{kpis.blocked}</h3>
            </div>
          </div>

          <div className="sa-mini-card">
            <span className="sa-mini-icon blue">↗</span>
            <div>
              <p>Incl. super admins</p>
              <h3>{managers.length}</h3>
            </div>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h3>Liste des managers</h3>
              <p>Vue complète des comptes managers et de leur activité.</p>
            </div>

            <div className="sa-tools">
              <input type="text" placeholder="Rechercher un manager..." />
              <button type="button">Filtrer</button>
            </div>
          </div>

          <div className="sa-table-wrap">
            <table className="sa-pro-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Rôle</th>
                  <th>Status</th>
                  <th>Annonces</th>
                  <th>Ajouté le</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Aucun manager</td>
                  </tr>
                ) : (
                  displayRows.map((manager) => (
                    <tr key={manager.id}>
                      <td>
                        <div className="sa-user-cell">
                          <div className="sa-user-avatar">
                            {(manager.name || "?").charAt(0)}
                          </div>
                          <div>
                            <strong>{manager.name}</strong>
                            <span>{manager.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{manager.role}</td>

                      <td>
                        <span
                          className={
                            manager.status === "Actif"
                              ? "sa-status active"
                              : "sa-status blocked"
                          }
                        >
                          {manager.status}
                        </span>
                      </td>

                      <td>{manager.annoncesDisplay}</td>
                      <td>{manager.dateDisplay}</td>

                      <td>
                        <div className="sa-action-row">
                          <button type="button" className="sa-action-btn">
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="sa-action-btn danger"
                            disabled={manager.is_superuser}
                            onClick={() =>
                              toggleManager(manager.id, manager.is_superuser)
                            }
                          >
                            {manager.is_active ? "Bloquer" : "Débloquer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SuperAdminShell>
  );
}
