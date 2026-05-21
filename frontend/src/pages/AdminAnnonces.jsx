import React, { useCallback, useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminPages.css";
import api from "../api";

export default function AdminAnnonces() {
  const { t } = useI18n();
  const [annonces, setAnnonces] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/annonces/");
      const rows = Array.isArray(data) ? data : data?.results || [];
      setAnnonces(rows);
    } catch {
      setAnnonces([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeAnnonce = async (id) => {
    if (!window.confirm(t("confirmDeleteAnnonce"))) return;
    try {
      await api.delete(`/admin/annonces/${id}/delete/`);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch {
      window.alert("Suppression impossible.");
    }
  };

  return (
    <AdminShell
      title={t("adminAnnoncesTitle")}
      subtitle={t("adminAnnoncesSubtitle")}
    >
      <div className="admin-page-grid">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <input
              className="admin-input"
              placeholder="Rechercher une annonce..."
            />
            <select className="admin-select" defaultValue="all">
              <option value="all">Tous les statuts</option>
              <option value="published">Publiées</option>
              <option value="hidden">Masquées</option>
            </select>
          </div>

          <div className="admin-toolbar-right">
            <button type="button" className="admin-secondary-btn">
              Filtrer
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Liste des annonces</h2>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Propriétaire</th>
                  <th>Ville</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {annonces.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucune annonce</td>
                  </tr>
                ) : (
                  annonces.map((item) => (
                    <tr key={item.id}>
                      <td>{item.titre}</td>
                      <td>{item.proprietaire ?? "—"}</td>
                      <td>{item.ville}</td>
                      <td>
                        <span className="status-pill status-published">
                          Publié
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
                          onClick={() => removeAnnonce(item.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
