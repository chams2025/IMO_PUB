import React, { useEffect, useMemo, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/SuperAdminPages.css";
import api from "../api";
import { formatPriceDa, typesToPercents } from "../utils/adminData";

function typeEmoji(typeBien) {
  const x = String(typeBien || "").toLowerCase();
  if (x.includes("terrain")) return "🌿";
  if (x.includes("appart")) return "🏢";
  if (x.includes("studio")) return "🏠";
  return "🏡";
}

export default function SuperAdminAnnonces() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [annonces, setAnnonces] = useState([]);
  const [charts, setCharts] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [annRes, chartsRes] = await Promise.all([
          api.get("/admin/annonces/"),
          api.get("/admin/charts/"),
        ]);
        if (cancelled) return;
        const data = annRes.data;
        setAnnonces(Array.isArray(data) ? data : data?.results || []);
        setCharts(chartsRes.data || {});
      } catch {
        if (!cancelled) {
          setAnnonces([]);
          setCharts({});
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
      annonces.map((a) => ({
        id: a.id,
        title: a.titre,
        city: a.ville,
        type: a.type_bien,
        price: formatPriceDa(a.prix),
        status: "Publié",
        owner: a.proprietaire ?? "—",
        views: "—",
        img: typeEmoji(a.type_bien),
      })),
    [annonces]
  );

  const filteredAnnonces = rows.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const repartition = useMemo(
    () => typesToPercents(charts.annonces_by_type).slice(0, 3),
    [charts]
  );

  return (
    <SuperAdminShell
      title={t("superAnnoncesTitle")}
      subtitle={t("superAnnoncesSubtitle")}
    >
      <div className="sa-page">
        <section className="sa-annonces-hero">
          <div>
            <span className="sa-badge">PROPERTY CONTROL</span>
            <h2>Centre de supervision des annonces</h2>
            <p>
              Analysez les biens publiés, validez les annonces et surveillez les
              publications sensibles.
            </p>
          </div>

          <div className="sa-annonces-stat">
            <strong>{annonces.length}</strong>
            <span>Annonces totales</span>
          </div>
        </section>

        <section className="sa-annonces-toolbar">
          <div className="sa-annonces-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sa-annonces-filters">
            <button type="button" className="active">
              Toutes
            </button>
            <button type="button">Validées</button>
            <button type="button">En attente</button>
            <button type="button">Signalées</button>
          </div>
        </section>

        <section className="sa-annonces-insights">
          <div className="sa-side-card">
            <h3>Répartition</h3>

            {repartition.length === 0 ? (
              <div className="sa-type-row">
                <span>—</span>
                <b>—</b>
                <i style={{ width: "0%" }}></i>
              </div>
            ) : (
              repartition.map((item, i) => (
                <div className="sa-type-row" key={item.label + i}>
                  <span>{item.label}</span>
                  <b>{item.pct}%</b>
                  <i style={{ width: `${item.pct}%` }}></i>
                </div>
              ))
            )}
          </div>

          <div className="sa-side-card dark">
            <h3>Alertes</h3>
            <p>
              Consultez les signalements pour les annonces nécessitant une
              vérification.
            </p>
            <button type="button">Voir signalements</button>
          </div>
        </section>

        <section className="sa-annonces-grid">
          {filteredAnnonces.length === 0 ? (
            <p>Aucune annonce</p>
          ) : (
            filteredAnnonces.map((annonce) => (
              <article className="sa-property-card" key={annonce.id}>
                <div className="sa-property-visual">
                  <span>{annonce.img}</span>
                  <b>{annonce.type}</b>
                </div>

                <div className="sa-property-content">
                  <div className="sa-property-head">
                    <div>
                      <h3>{annonce.title}</h3>
                      <p>
                        {annonce.city} · Publiée par {annonce.owner}
                      </p>
                    </div>

                    <span className="sa-status active">{annonce.status}</span>
                  </div>

                  <div className="sa-property-meta">
                    <div>
                      <span>Prix</span>
                      <strong>{annonce.price}</strong>
                    </div>
                    <div>
                      <span>Vues</span>
                      <strong>{annonce.views}</strong>
                    </div>
                    <div>
                      <span>Type</span>
                      <strong>{annonce.type}</strong>
                    </div>
                  </div>

                  <div className="sa-property-actions">
                    <button type="button">Voir détail</button>
                    <button type="button">Valider</button>
                    <button type="button" className="danger">
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </SuperAdminShell>
  );
}
