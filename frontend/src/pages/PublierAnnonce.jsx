import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PublierAnnonce.css";
import api from "../api";
import { getApiError } from "../utils/apiError";
import { useI18n } from "../i18n/I18nContext";

function formatValidationErrors(data) {
  if (!data || typeof data !== "object") {
    return "Impossible de publier l’annonce. Vérifiez les champs et réessayez.";
  }
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(" ");
  const parts = [];
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) parts.push(`${key}: ${val.join(", ")}`);
    else if (typeof val === "string") parts.push(`${key}: ${val}`);
  }
  return parts.length
    ? parts.join("\n")
    : "Certaines informations sont invalides. Corrigez le formulaire.";
}

const initialForm = {
  titre: "",
  type: "Appartement",
  statut: "Vente",
  prix: "",
  surface: "",
  wilaya: "",
  commune: "",
  adresse: "",
  chambres: "",
  sallesDeBain: "",
  description: "",
  imagePrincipale: "",
};

const equipementsList = [
  "Piscine",
  "Garage",
  "Jardin",
  "Balcon",
  "Terrasse",
  "Ascenseur",
  "Climatisation",
  "Cuisine équipée",
  "Sécurité",
  "Vue mer",
  "Vue dégagée",
  "Parking",
];

export default function PublierAnnonce() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [equipements, setEquipements] = useState([
    "Climatisation",
    "Sécurité",
  ]);
  const [images, setImages] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [priceHint, setPriceHint] = useState("");
  const [estimateInfo, setEstimateInfo] = useState("");
  const { t } = useI18n();

  const runEstimate = async () => {
    setEstimateInfo("");
    setPriceHint("");
    try {
      const { data } = await api.post("/estimate-price/", {
        ville: formData.wilaya,
        type_bien: formData.type,
        superficie: formData.surface,
        nombre_pieces: formData.chambres || 1,
      });
      setFormData((p) => ({ ...p, prix: String(data.estimated_price) }));
      setEstimateInfo(`${data.message} (${data.confidence})`);
    } catch (err) {
      setEstimateInfo(getApiError(err));
    }
  };

  const runPriceCheck = async () => {
    setPriceHint("");
    if (!formData.prix || !formData.wilaya) return;
    try {
      const { data } = await api.post("/check-price/", {
        prix: formData.prix,
        ville: formData.wilaya,
        type_bien: formData.type,
        superficie: formData.surface,
        nombre_pieces: formData.chambres || 1,
      });
      const map = { high: t("priceHigh"), low: t("priceLow"), normal: t("priceFair") };
      setPriceHint(map[data.status] || data.message);
    } catch (err) {
      setPriceHint(getApiError(err));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEquipement = (item) => {
    setEquipements((prev) =>
      prev.includes(item)
        ? prev.filter((eq) => eq !== item)
        : [...prev, item]
    );
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("titre", formData.titre.trim());
      form.append("description", formData.description.trim());
      form.append("type_bien", formData.type);
      form.append("superficie", String(formData.surface));
      const pieces =
        formData.chambres === "" || formData.chambres === undefined
          ? "1"
          : String(formData.chambres);
      form.append("nombre_pieces", pieces);
      form.append("prix", String(formData.prix));
      form.append("ville", formData.wilaya.trim());

      if (images[0]) {
        form.append("image", images[0]);
      }

      await api.post("/annonces/", form);

      navigate("/mes-annonces");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 400) {
        setSubmitError(formatValidationErrors(data));
      } else {
        setSubmitError(
          "Une erreur réseau ou serveur est survenue. Réessayez plus tard."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const previewLocation = useMemo(() => {
    return [formData.commune, formData.wilaya].filter(Boolean).join(", ");
  }, [formData.commune, formData.wilaya]);

  const formattedPrice = useMemo(() => {
    if (!formData.prix) return "Prix non renseigné";
    return `${Number(formData.prix).toLocaleString("fr-FR")} DA`;
  }, [formData.prix]);

  return (
    <main className="publish-page">
      <div className="publish-shell">
        <section className="publish-hero">
          <div className="publish-hero-copy">
            <span className="publish-kicker">Création d’annonce premium</span>
            <h1>Publiez un bien qui inspire confiance dès le premier regard</h1>
            <p>
              Structurez votre annonce avec un rendu haut de gamme, des
              informations claires et une présentation qui valorise vraiment
              votre bien immobilier.
            </p>

            <div className="publish-hero-metrics">
              <div className="hero-metric-card">
                <strong>01</strong>
                <span>Présentation soignée</span>
              </div>
              <div className="hero-metric-card">
                <strong>02</strong>
                <span>Informations complètes</span>
              </div>
              <div className="hero-metric-card">
                <strong>03</strong>
                <span>Impact visuel premium</span>
              </div>
            </div>
          </div>

          <aside className="publish-hero-panel">
            <div className="hero-panel-top">
              <span className="mini-badge">Aperçu instantané</span>
              <h3>Votre annonce prend forme en direct</h3>
              <p>
                Remplissez le formulaire et obtenez un rendu cohérent,
                professionnel et prêt à convertir.
              </p>
            </div>

            <div className="luxury-preview-card">
              <div className="luxury-preview-media">
                {formData.imagePrincipale ? (
                  <img src={formData.imagePrincipale} alt="Aperçu du bien" />
                ) : (
                  <div className="luxury-preview-placeholder">
                    <span>Image principale</span>
                  </div>
                )}
                <div className="luxury-preview-badge">{formData.statut}</div>
              </div>

              <div className="luxury-preview-body">
                <div className="luxury-preview-tags">
                  <span>{formData.type}</span>
                  <span>{formData.surface ? `${formData.surface} m²` : "Surface"}</span>
                </div>

                <h4>{formData.titre || "Titre de votre annonce"}</h4>
                <p className="luxury-preview-location">
                  {previewLocation || "Commune, Wilaya"}
                </p>
                <p className="luxury-preview-price">{formattedPrice}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="publish-layout">
          <form className="publish-form-card" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-tag">Section 01</span>
                  <h2>Informations principales</h2>
                </div>
                <p>
                  Donnez une identité forte à votre annonce avec un titre clair,
                  un type de bien précis et des caractéristiques essentielles.
                </p>
              </div>

              <div className="form-grid two">
                <div className="form-group full">
                  <label htmlFor="titre">Titre de l’annonce</label>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    placeholder="Ex : Villa contemporaine avec piscine à Hydra"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type de bien</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option>Appartement</option>
                    <option>Villa</option>
                    <option>Maison</option>
                    <option>Studio</option>
                    <option>Duplex</option>
                    <option>Terrain</option>
                    <option>Local commercial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="statut">Statut</label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                  >
                    <option>Vente</option>
                    <option>Location</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prix">Prix</label>
                  <input
                    id="prix"
                    name="prix"
                    type="number"
                    placeholder="Ex : 18500000"
                    value={formData.prix}
                    onChange={handleChange}
                    onBlur={runPriceCheck}
                    required
                  />
                </div>
                <div className="price-tools">
                  <button type="button" className="outline-btn" onClick={runEstimate}>
                    {t("priceEstimate")}
                  </button>
                  {estimateInfo && <p className="price-hint">{estimateInfo}</p>}
                  {priceHint && <p className="price-hint">{priceHint}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="surface">Surface (m²)</label>
                  <input
                    id="surface"
                    name="surface"
                    type="number"
                    placeholder="Ex : 145"
                    value={formData.surface}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chambres">Chambres</label>
                  <input
                    id="chambres"
                    name="chambres"
                    type="number"
                    placeholder="Ex : 3"
                    value={formData.chambres}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sallesDeBain">Salles de bain</label>
                  <input
                    id="sallesDeBain"
                    name="sallesDeBain"
                    type="number"
                    placeholder="Ex : 2"
                    value={formData.sallesDeBain}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-tag">Section 02</span>
                  <h2>Localisation</h2>
                </div>
                <p>
                  Une localisation bien renseignée augmente la crédibilité de
                  l’annonce et facilite la prise de décision.
                </p>
              </div>

              <div className="form-grid two">
                <div className="form-group">
                  <label htmlFor="wilaya">Wilaya</label>
                  <input
                    id="wilaya"
                    name="wilaya"
                    type="text"
                    placeholder="Ex : Alger"
                    value={formData.wilaya}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="commune">Commune</label>
                  <input
                    id="commune"
                    name="commune"
                    type="text"
                    placeholder="Ex : Hydra"
                    value={formData.commune}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label htmlFor="adresse">Adresse complète</label>
                  <input
                    id="adresse"
                    name="adresse"
                    type="text"
                    placeholder="Ex : Rue des Orangers, Hydra, Alger"
                    value={formData.adresse}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-tag">Section 03</span>
                  <h2>Description & médias</h2>
                </div>
                <p>
                  Racontez le bien, son ambiance, ses points forts et donnez une
                  première impression visuelle de qualité.
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={7}
                    placeholder="Décrivez le bien avec précision : emplacement, finitions, luminosité, voisinage, sécurité, commodités..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label htmlFor="imagePrincipale">URL image principale</label>
                  <input
                    id="imagePrincipale"
                    name="imagePrincipale"
                    type="text"
                    placeholder="https://..."
                    value={formData.imagePrincipale}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full">
                  <label htmlFor="images">Galerie photos</label>

                  <label className="upload-box" htmlFor="images">
                    <div className="upload-box-icon">＋</div>
                    <div>
                      <strong>Ajouter des images du bien</strong>
                      <p>Glissez-déposez vos photos ou cliquez pour importer</p>
                    </div>
                  </label>

                  <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    hidden
                  />

                  {images.length > 0 && (
                    <div className="upload-files">
                      {images.map((file, index) => (
                        <div className="upload-file-chip" key={`${file.name}-${index}`}>
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-tag">Section 04</span>
                  <h2>Équipements & confort</h2>
                </div>
                <p>
                  Mettez en avant les éléments premium qui augmentent la valeur
                  perçue de votre bien.
                </p>
              </div>

              <div className="equipements-grid">
                {equipementsList.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`equipement-chip ${
                      equipements.includes(item) ? "active" : ""
                    }`}
                    onClick={() => toggleEquipement(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="publish-actions">
              <button type="button" className="outline-btn">
                Enregistrer brouillon
              </button>
              <button
                type="submit"
                className="gold-btn"
                disabled={submitting}
              >
                Publier l’annonce
              </button>
            </div>

            {submitError && (
              <div className="publish-error-banner" role="alert">
                {submitError}
              </div>
            )}
          </form>

          <aside className="publish-side-card">
            <div className="side-panel-block">
              <span className="section-tag">Qualité d’annonce</span>
              <h3>Checklist de publication</h3>

              <div className="quality-list">
                <div className="quality-item">
                  <span className="quality-dot" />
                  <div>
                    <strong>Titre percutant</strong>
                    <p>Donnez envie de cliquer dès la première lecture.</p>
                  </div>
                </div>

                <div className="quality-item">
                  <span className="quality-dot" />
                  <div>
                    <strong>Photos nettes</strong>
                    <p>Des visuels lumineux renforcent la confiance.</p>
                  </div>
                </div>

                <div className="quality-item">
                  <span className="quality-dot" />
                  <div>
                    <strong>Description précise</strong>
                    <p>Valorisez les atouts concrets du bien.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="side-panel-block side-dark-card">
              <p className="dark-card-label">Résumé actuel</p>
              <h4>{formData.titre || "Annonce non finalisée"}</h4>
              <p className="dark-card-meta">
                {formData.type} · {formData.statut}
              </p>
              <p className="dark-card-price">{formattedPrice}</p>
              <p className="dark-card-location">
                {previewLocation || "Localisation en attente"}
              </p>

              <div className="dark-card-features">
                <span>{formData.surface ? `${formData.surface} m²` : "Surface"}</span>
                <span>{formData.chambres || "0"} ch.</span>
                <span>{formData.sallesDeBain || "0"} sdb.</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}