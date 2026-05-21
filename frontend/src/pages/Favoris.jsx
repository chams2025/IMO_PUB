import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Favoris.css";
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

function formatPriceDa(prix) {
  if (prix === null || prix === undefined || prix === "") return "—";
  const n = Number(prix);
  if (Number.isNaN(n)) return String(prix);
  return `${n.toLocaleString("fr-FR")} DA`;
}

function formatFavDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return (
      "Ajoutée le " +
      d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  } catch {
    return "—";
  }
}

function mapFavoriteRow(fav) {
  const a = fav.annonce;
  if (!a || typeof a !== "object") return null;
  const img = getImageUrl(a.main_image || a.image);
  return {
    id: fav.id,
    annonceId: a.id,
    title: a.titre || "—",
    city: a.ville || "—",
    commune: a.ville || "—",
    type: a.type_bien || "—",
    price: formatPriceDa(a.prix),
    surface:
      a.superficie != null && a.superficie !== ""
        ? `${a.superficie} m²`
        : "—",
    bedrooms: a.nombre_pieces ?? "—",
    bathrooms: "—",
    status: "Disponible",
    badge: "Favori",
    date: formatFavDate(fav.date_ajout),
    image: img,
  };
}

export default function Favoris() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [cityFilter, setCityFilter] = useState("Toutes");
  const [sortBy, setSortBy] = useState("recent");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/favorites/");
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map(mapFavoriteRow).filter(Boolean);
        if (!cancelled) setFavorites(mapped);
      } catch {
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cities = useMemo(() => {
    return ["Toutes", ...new Set(favorites.map((item) => item.city))];
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    let data = [...favorites];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.city.toLowerCase().includes(keyword) ||
          item.commune.toLowerCase().includes(keyword) ||
          item.type.toLowerCase().includes(keyword)
      );
    }

    if (typeFilter !== "Tous") {
      data = data.filter((item) => item.type === typeFilter);
    }

    if (cityFilter !== "Toutes") {
      data = data.filter((item) => item.city === cityFilter);
    }

    if (sortBy === "price-asc") {
      data.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
    } else if (sortBy === "price-desc") {
      data.sort((a, b) => extractPrice(b.price) - extractPrice(a.price));
    } else {
      data.sort((a, b) => b.id - a.id);
    }

    return data;
  }, [favorites, search, typeFilter, cityFilter, sortBy]);

  const totalCount = favorites.length;
  const availableCount = favorites.filter(
    (item) => item.status === "Disponible"
  ).length;

  const removeFavorite = async (favoritePk) => {
    try {
      await api.delete(`/favorites/${favoritePk}/`);
      setFavorites((prev) => prev.filter((item) => item.id !== favoritePk));
    } catch {
      window.alert("Impossible de retirer ce favori.");
    }
  };

  const clearAll = async () => {
    if (!favorites.length) return;
    if (!window.confirm("Retirer tous les favoris ?")) return;
    try {
      await Promise.all(
        favorites.map((f) => api.delete(`/favorites/${f.id}/`).catch(() => null))
      );
      setFavorites([]);
    } catch {
      window.alert("Une erreur est survenue.");
    }
  };

  return (
    <main className="favorites-page">
      <div className="favorites-shell">
        <section className="favorites-topbar">
          <div>
            <span className="favorites-kicker">Sélection premium</span>
            <h1>Vos annonces favorites</h1>
            <p>
              Retrouvez toutes les annonces que vous avez enregistrées pour les
              comparer, les consulter plus tard ou contacter rapidement les
              propriétaires.
            </p>
          </div>

          <div className="favorites-topbar-actions">
            <button className="secondary-btn" onClick={clearAll}>
              Tout vider
            </button>
            <Link to="/" className="primary-btn">
              Explorer plus d’annonces
            </Link>
          </div>
        </section>

        {loading && (
          <p className="favorites-loading-hint">Chargement…</p>
        )}

        <section className="favorites-toolbar">
          <div className="toolbar-search">
            <input
              type="text"
              placeholder="Rechercher par titre, ville, commune..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-controls">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="Tous">Tous les types</option>
              <option value="Appartement">Appartement</option>
              <option value="Villa">Villa</option>
              <option value="Maison">Maison</option>
              <option value="Studio">Studio</option>
              <option value="Duplex">Duplex</option>
              <option value="Terrain">Terrain</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Plus récentes</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </section>

        <section className="favorites-meta">
          <div className="meta-item">
            <strong>{totalCount}</strong>
            <span>Annonces sauvegardées</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <strong>{availableCount}</strong>
            <span>Encore disponibles</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <strong>{filteredFavorites.length}</strong>
            <span>Résultats affichés</span>
          </div>
        </section>

        {!loading && filteredFavorites.length === 0 && (
          <section className="favorites-empty">
            <div className="empty-icon">♡</div>
            <h2>Aucune annonce favorite</h2>
            <p>
              Commencez à enregistrer des biens pour les retrouver rapidement
              ici.
            </p>
            <Link to="/" className="primary-btn">
              Découvrir les annonces
            </Link>
          </section>
        )}

        {!loading && filteredFavorites.length > 0 && (
          <section className="favorites-grid">
            {filteredFavorites.map((item) => (
              <article className="favorite-card" key={item.id}>
                <div
                  className={`favorite-card-media${item.image ? "" : " favorite-card-media--empty"}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <span>Pas d’image</span>
                  )}
                  <span
                    className={`favorite-status ${
                      item.status === "Disponible"
                        ? "is-available"
                        : "is-reserved"
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    className="favorite-heart-btn"
                    onClick={() => removeFavorite(item.id)}
                    aria-label="Retirer des favoris"
                    title="Retirer des favoris"
                  >
                    ♥
                  </button>
                </div>

                <div className="favorite-card-body">
                  <div className="favorite-card-tags">
                    <span>{item.badge}</span>
                    <span>{item.type}</span>
                    <span>{item.city}</span>
                  </div>

                  <h2>{item.title}</h2>

                  <div className="favorite-card-location">
                    {item.commune}, {item.city}
                  </div>

                  <div className="favorite-card-info">
                    <p className="favorite-price">{item.price}</p>
                    <p className="favorite-date">{item.date}</p>
                  </div>

                  <div className="favorite-features">
                    <span>{item.surface}</span>
                    <span>{item.bedrooms} ch.</span>
                    <span>{item.bathrooms} sdb.</span>
                  </div>

                  <div className="favorite-card-actions">
                    <Link
                      to={`/annonces/${item.annonceId}`}
                      className="text-btn"
                    >
                      Voir détails
                    </Link>
                    <button type="button" className="text-btn">
                      Contacter
                    </button>
                    <button
                      className="danger-text-btn"
                      type="button"
                      onClick={() => removeFavorite(item.id)}
                    >
                      Retirer
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

function extractPrice(price) {
  if (typeof price === "number" && !Number.isNaN(price)) return price;
  return Number(String(price).replace(/[^\d]/g, "")) || 0;
}
