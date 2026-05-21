import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import { getApiError } from "../utils/apiError";
import { useI18n } from "../i18n/I18nContext";
import "../styles/PublierAnnonce.css";

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

export default function ModifierAnnonce() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [priceHint, setPriceHint] = useState("");
  const [estimateInfo, setEstimateInfo] = useState("");
  const [priceCheck, setPriceCheck] = useState(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type_bien: "Appartement",
    superficie: "",
    nombre_pieces: "",
    prix: "",
    ville: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/annonces/${id}/`);
        if (cancelled) return;
        setForm({
          titre: data.titre || "",
          description: data.description || "",
          type_bien: data.type_bien || "Appartement",
          superficie: data.superficie ?? "",
          nombre_pieces: data.nombre_pieces ?? "",
          prix: data.prix ?? "",
          ville: data.ville || "",
        });
        const img = data.main_image || data.image;
        if (img) setImagePreview(getImageUrl(img));
      } catch {
        if (!cancelled) setError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const runEstimate = async () => {
    setEstimateInfo("");
    setPriceHint("");
    try {
      const { data } = await api.post("/estimate-price/", {
        ville: form.ville,
        type_bien: form.type_bien,
        superficie: form.superficie,
        nombre_pieces: form.nombre_pieces || 1,
      });
      setForm((p) => ({ ...p, prix: String(data.estimated_price) }));
      setEstimateInfo(
        `${data.message || ""} (${data.method || ""}, ${data.confidence || ""})`
      );
    } catch (err) {
      setEstimateInfo(getApiError(err));
    }
  };

  const runPriceCheck = async () => {
    setPriceHint("");
    setPriceCheck(null);
    if (!form.prix || !form.ville) return;
    try {
      const { data } = await api.post("/check-price/", {
        prix: form.prix,
        ville: form.ville,
        type_bien: form.type_bien,
        superficie: form.superficie,
        nombre_pieces: form.nombre_pieces || 1,
      });
      setPriceCheck(data);
      const map = {
        high: t("priceTooHigh"),
        low: t("priceTooLow"),
        normal: t("priceFair"),
      };
      setPriceHint(map[data.status] || data.message);
    } catch (err) {
      setPriceHint(getApiError(err));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.append("titre", form.titre);
    formData.append("description", form.description);
    formData.append("type_bien", form.type_bien);
    formData.append("superficie", form.superficie);
    formData.append("nombre_pieces", form.nombre_pieces);
    formData.append("prix", form.prix);
    formData.append("ville", form.ville);
    if (imageFile) formData.append("image", imageFile);

    try {
      await api.patch(`/annonces/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/mes-annonces");
    } catch (err) {
      setError(getApiError(err, t("loadError")));
    } finally {
      setSaving(false);
    }
  };

  const badgeClass =
    priceCheck?.status === "high"
      ? "price-badge high"
      : priceCheck?.status === "low"
        ? "price-badge low"
        : "price-badge normal";

  if (loading) {
    return (
      <div className="edit-annonce-page publier-page">
        <div className="publier-shell">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-annonce-page publier-page">
      <div className="publier-shell">
        <header className="publier-header">
          <span className="publier-kicker">{t("editAnnonce")}</span>
          <h1>{t("editAnnonce")}</h1>
          <p>{t("editAnnonceSubtitle")}</p>
        </header>

        {error && <div className="publier-error">{error}</div>}

        <form className="publier-form" onSubmit={handleSubmit}>
          <label>
            Titre
            <input name="titre" value={form.titre} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </label>
          <label>
            Type de bien
            <select name="type_bien" value={form.type_bien} onChange={handleChange}>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
            </select>
          </label>
          <div className="publier-row">
            <label>
              Ville
              <input name="ville" value={form.ville} onChange={handleChange} required />
            </label>
            <label>
              Superficie (m²)
              <input
                name="superficie"
                type="number"
                value={form.superficie}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="publier-row">
            <label>
              Pièces
              <input
                name="nombre_pieces"
                type="number"
                value={form.nombre_pieces}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Prix (DA)
              <input
                name="prix"
                type="number"
                value={form.prix}
                onChange={handleChange}
                onBlur={runPriceCheck}
              />
            </label>
          </div>
          <div className="price-tools">
            <button type="button" className="outline-btn" onClick={runEstimate}>
              {t("priceEstimate")}
            </button>
            <button type="button" className="outline-btn" onClick={runPriceCheck}>
              {t("verifyPrice")}
            </button>
            {estimateInfo && <p className="price-hint">{estimateInfo}</p>}
            {priceHint && <p className="price-hint">{priceHint}</p>}
            {priceCheck && (
              <div className={badgeClass}>
                <strong>
                  {priceCheck.status === "high"
                    ? t("badgeHigh")
                    : priceCheck.status === "low"
                      ? t("badgeLow")
                      : t("badgeFair")}
                </strong>
                <span>
                  {t("estimatedPrice")}:{" "}
                  {Number(priceCheck.estimated_price).toLocaleString()} DA —{" "}
                  {t("differencePercent")}: {priceCheck.difference_percent}%
                </span>
              </div>
            )}
          </div>
          <label>
            Photo
            <input type="file" accept="image/*" onChange={handleImage} />
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 16 }}
            />
          )}
          <div className="publier-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? t("saving") : t("save")}
            </button>
            <Link to="/mes-annonces" className="outline-btn">
              {t("cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
