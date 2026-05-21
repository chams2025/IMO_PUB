import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/MesAnnonces.css";
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

function formatPrice(prix) {
  if (prix === null || prix === undefined || prix === "") return "—";
  const n = Number(prix);
  if (Number.isNaN(n)) return String(prix);
  return `${n.toLocaleString("fr-FR")} DA`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(iso);
  }
}

function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchAnnonces = useCallback(async () => {
    setLoadError("");
    try {
      const { data } = await api.get("/my-annonces/");
      setAnnonces(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(
        "Impossible de charger vos annonces. Vérifiez votre connexion."
      );
      setAnnonces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/annonces/${id}/`);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch {
      window.alert("La suppression a échoué. Réessayez.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="my-listings-page">
      <div className="my-listings-shell">
        <section className="my-listings-topbar">
          <div>
            <span className="my-listings-kicker">Espace propriétaire</span>
            <h1>Mes annonces</h1>
            <p>
              Consultez, modifiez et gérez vos biens publiés depuis un espace
              sobre, clair et structuré.
            </p>
          </div>

          <Link to="/publier" className="primary-btn">
            Nouvelle annonce
          </Link>
        </section>

        <section className="my-listings-toolbar">
          <div className="toolbar-search">
            <input type="text" placeholder="Rechercher une annonce" />
          </div>

          <div className="toolbar-controls">
            <select defaultValue="">
              <option value="">Tous les statuts</option>
              <option value="publie">Publié</option>
              <option value="attente">En attente</option>
            </select>

            <select defaultValue="">
              <option value="">Tous les types</option>
              <option value="Appartement">Appartement</option>
              <option value="Villa">Villa</option>
              <option value="Maison">Maison</option>
              <option value="Studio">Studio</option>
            </select>

            <button className="secondary-btn">Trier par date</button>
          </div>
        </section>

        {loadError && (
          <p className="my-listings-feedback">{loadError}</p>
        )}

        {loading ? (
          <p className="my-listings-loading-text">Chargement…</p>
        ) : (
          <section className="my-listings-grid">
            {annonces.length === 0 ? (
              <p className="my-listings-empty-text">
                Aucune annonce pour le moment.{" "}
                <Link to="/publier">Publier une annonce</Link>
              </p>
            ) : (
              annonces.map((annonce) => {
                const imgSrc = getImageUrl(
                  annonce.main_image || annonce.image
                );
                return (
                  <article className="listing-card" key={annonce.id}>
                    <div
                      className={`listing-card-media${imgSrc ? "" : " listing-card-media--empty"}`}
                    >
                      {imgSrc ? (
                        <>
                          <img src={imgSrc} alt={annonce.titre || ""} />
                          <span className="listing-status is-published">
                            Publié
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Pas d’image</span>
                          <span className="listing-status is-published">
                            Publié
                          </span>
                        </>
                      )}
                    </div>

                    <div className="listing-card-body">
                      <div className="listing-card-tags">
                        <span>{annonce.type_bien}</span>
                        <span>{annonce.ville}</span>
                      </div>

                      <h2>{annonce.titre}</h2>

                      <div className="listing-card-info">
                        <p className="listing-price">
                          {formatPrice(annonce.prix)}
                        </p>
                        <p className="listing-date">
                          Publié le{" "}
                          {formatDate(annonce.date_publication)}
                        </p>
                      </div>

                      <div className="listing-card-actions">
                        <Link
                          to={`/annonces/${annonce.id}`}
                          className="text-btn"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/annonces/${annonce.id}/edit`}
                          className="text-btn"
                        >
                          Modifier
                        </Link>
                        <button
                          className="danger-text-btn"
                          type="button"
                          disabled={deletingId === annonce.id}
                          onClick={() => handleDelete(annonce.id)}
                        >
                          {deletingId === annonce.id
                            ? "Suppression…"
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default MesAnnonces;
