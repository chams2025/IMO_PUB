import React, { useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";

const tabs = [
  { id: "general", label: "Général", icon: "⚙️" },
  { id: "security", label: "Sécurité", icon: "🔐" },
  { id: "roles", label: "Rôles", icon: "🛡️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
];

function Toggle({ active = true }) {
  const [enabled, setEnabled] = useState(active);

  return (
    <button
      type="button"
      className={enabled ? "sa-toggle active" : "sa-toggle"}
      onClick={() => setEnabled((prev) => !prev)}
    >
      <span></span>
    </button>
  );
}

export default function SuperAdminSettings() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <SuperAdminShell
      title={t("superSettingsTitle")}
      subtitle={t("superSettingsSubtitle")}
    >
      <div className="sa-page">
        <section className="sa-settings-hero">
          <div>
            <span className="sa-badge">PLATFORM SETTINGS</span>
            <h2>Centre de configuration</h2>
            <p>
              Gérez les informations générales, la sécurité, les rôles et les
              notifications de Saheliq.
            </p>
          </div>

          <div className="sa-settings-status">
            <strong>98%</strong>
            <span>Configuration complète</span>
          </div>
        </section>

        <section className="sa-settings-shell">
          <aside className="sa-settings-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </aside>

          <div className="sa-settings-content">
            {activeTab === "general" && (
              <div className="sa-settings-panel">
                <div className="sa-settings-head">
                  <h3>Informations générales</h3>
                  <p>Paramètres principaux visibles sur la plateforme.</p>
                </div>

                <div className="sa-form-grid">
                  <label>
                    Nom de la plateforme
                    <input type="text" defaultValue="Saheliq" />
                  </label>

                  <label>
                    Email officiel
                    <input type="email" defaultValue="contact@saheliq.com" />
                  </label>

                  <label>
                    Téléphone
                    <input type="text" defaultValue="+213 555 000 000" />
                  </label>

                  <label>
                    Adresse
                    <input type="text" defaultValue="Alger, Algérie" />
                  </label>
                </div>

                <div className="sa-upload-card">
                  <div>
                    <h4>Logo de la plateforme</h4>
                    <p>Importer ou modifier le logo officiel.</p>
                  </div>
                  <button>Changer logo</button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="sa-settings-panel">
                <div className="sa-settings-head">
                  <h3>Sécurité</h3>
                  <p>Protégez l’accès super admin et les sessions.</p>
                </div>

                <div className="sa-setting-list">
                  <div className="sa-setting-row">
                    <div>
                      <h4>Authentification à deux facteurs</h4>
                      <p>Ajouter une couche de sécurité au compte.</p>
                    </div>
                    <Toggle active={true} />
                  </div>

                  <div className="sa-setting-row">
                    <div>
                      <h4>Déconnexion de toutes les sessions</h4>
                      <p>Forcer la reconnexion sur tous les appareils.</p>
                    </div>
                    <button className="sa-danger-btn">Déconnecter</button>
                  </div>

                  <div className="sa-password-box">
                    <h4>Changer le mot de passe</h4>
                    <div className="sa-form-grid">
                      <label>
                        Mot de passe actuel
                        <input type="password" placeholder="••••••••" />
                      </label>
                      <label>
                        Nouveau mot de passe
                        <input type="password" placeholder="••••••••" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div className="sa-settings-panel">
                <div className="sa-settings-head">
                  <h3>Gestion des rôles</h3>
                  <p>Contrôlez les permissions des managers.</p>
                </div>

                <div className="sa-permission-grid">
                  <div className="sa-permission-card">
                    <h4>Gestion utilisateurs</h4>
                    <p>Autoriser les managers à consulter les utilisateurs.</p>
                    <Toggle active={true} />
                  </div>

                  <div className="sa-permission-card">
                    <h4>Suppression annonces</h4>
                    <p>Autoriser la suppression des annonces sensibles.</p>
                    <Toggle active={true} />
                  </div>

                  <div className="sa-permission-card">
                    <h4>Création managers</h4>
                    <p>Autoriser la création d’autres comptes managers.</p>
                    <Toggle active={false} />
                  </div>

                  <div className="sa-permission-card">
                    <h4>Accès statistiques</h4>
                    <p>Autoriser l’accès aux statistiques globales.</p>
                    <Toggle active={true} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="sa-settings-panel">
                <div className="sa-settings-head">
                  <h3>Notifications</h3>
                  <p>Choisissez les alertes importantes à recevoir.</p>
                </div>

                <div className="sa-setting-list">
                  <div className="sa-setting-row">
                    <div>
                      <h4>Alertes email</h4>
                      <p>Recevoir les notifications importantes par email.</p>
                    </div>
                    <Toggle active={true} />
                  </div>

                  <div className="sa-setting-row">
                    <div>
                      <h4>Signalements urgents</h4>
                      <p>Alerte lorsqu’une annonce est signalée plusieurs fois.</p>
                    </div>
                    <Toggle active={true} />
                  </div>

                  <div className="sa-setting-row">
                    <div>
                      <h4>Résumé hebdomadaire</h4>
                      <p>Rapport automatique chaque semaine.</p>
                    </div>
                    <Toggle active={false} />
                  </div>
                </div>
              </div>
            )}

            <div className="sa-settings-actions">
              <button className="sa-secondary-btn">Annuler</button>
              <button className="sa-save-btn">Enregistrer les modifications</button>
            </div>
          </div>
        </section>
      </div>
    </SuperAdminShell>
  );
}