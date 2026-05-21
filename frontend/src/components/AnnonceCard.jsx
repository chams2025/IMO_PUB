import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { getMediaUrl, PLACEHOLDER_IMAGE } from "../utils/apiError";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AnnonceCard.css";

function AnnonceCard({ annonce, showMatch = false, onFavoriteChange }) {
  const { t } = useI18n();
  const [fav, setFav] = useState(annonce.is_favorite || false);
  const [favId, setFavId] = useState(annonce.favorite_id || null);
  const [favLoading, setFavLoading] = useState(false);

  const imageUrl =
    getMediaUrl(annonce.main_image || annonce.image) || PLACEHOLDER_IMAGE;

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem(ACCESS_TOKEN)) return;
    setFavLoading(true);
    try {
      if (fav && favId) {
        await api.delete(`/favorites/${favId}/`);
        setFav(false);
        setFavId(null);
        onFavoriteChange?.(annonce.id, false);
      } else {
        const { data } = await api.post("/favorites/", { annonce: annonce.id });
        setFav(true);
        setFavId(data.id);
        onFavoriteChange?.(annonce.id, true);
      }
    } catch {
      /* parent may show error */
    } finally {
      setFavLoading(false);
    }
  };

  const whyLabels = {
    city_match: "Ville",
    type_match: "Type",
    rooms_match: "Pièces",
    price_match: "Prix",
    surface_match: "Surface",
    keywords_match: "Mots-clés",
    listing: "Annonce",
  };

  return (
    <article className="acard visible">
      <div className="acard-img-wrap">
        <img
          src={imageUrl}
          alt={annonce.titre}
          className="acard-img"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        <span className="acard-badge">{annonce.type_bien}</span>
        {localStorage.getItem(ACCESS_TOKEN) && (
          <button
            type="button"
            className={`acard-fav-btn ${fav ? "active" : ""}`}
            onClick={toggleFavorite}
            disabled={favLoading}
            aria-label="Favoris"
          >
            {fav ? "♥" : "♡"}
          </button>
        )}
      </div>

      <div className="acard-body">
        <h3 className="acard-titre">{annonce.titre}</h3>
        <p className="acard-ville">📍 {annonce.ville}</p>

        <div className="acard-details">
          <span>🛏 {annonce.nombre_pieces} pièces</span>
          <span>·</span>
          <span>📐 {annonce.superficie} m²</span>
        </div>

        {showMatch && annonce.why_matched?.length > 0 && (
          <div className="acard-match-tags">
            {annonce.score != null && (
              <span className="acard-score">
                {t("score")}: {annonce.score}
              </span>
            )}
            {annonce.why_matched.map((w) => (
              <span key={w} className="match-tag">
                {whyLabels[w] || w}
              </span>
            ))}
          </div>
        )}

        <div className="acard-footer">
          <span className="acard-prix">
            {annonce.prix
              ? `${Number(annonce.prix).toLocaleString()} DA`
              : "Prix non défini"}
          </span>
          <Link to={`/annonces/${annonce.id}`} className="acard-btn">
            Voir →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default AnnonceCard;
