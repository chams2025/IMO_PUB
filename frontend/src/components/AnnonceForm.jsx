import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"

function AnnonceForm() {
  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const [typeBien, setTypeBien] = useState("Appartement")
  const [superficie, setSuperficie] = useState("")
  const [nombrePieces, setNombrePieces] = useState("")
  const [prix, setPrix] = useState("")
  const [ville, setVille] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData()
    formData.append("titre", titre)
    formData.append("description", description)
    formData.append("type_bien", typeBien)
    formData.append("superficie", superficie)
    formData.append("nombre_pieces", nombrePieces)
    formData.append("prix", prix)
    formData.append("ville", ville)
    if (image) formData.append("image", image)
    try {
      await api.post("/annonces/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      navigate("/mes-annonces")
    } catch {
      setError("Erreur lors de la publication. Vérifiez vos informations.")
    } finally {
      setLoading(false)
    }
  }

  const typesOptions = [
    { val: "Appartement",      icon: "🏢" },
    { val: "Villa",            icon: "🏡" },
    { val: "Maison",           icon: "🏠" },
    { val: "Studio",           icon: "🛋" },
    { val: "Terrain",          icon: "🌿" },
    { val: "Local commercial", icon: "🏪" },
  ]

  return (
    <>
      <style>{`
        .af-wrap {
          padding: 40px 48px 48px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .af-section { margin-bottom: 32px; }

        .af-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #2d6a4f;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .af-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e8e3;
        }

        .af-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .af-field { display: flex; flex-direction: column; gap: 6px; }

        .af-label {
          font-size: 12px;
          font-weight: 600;
          color: #5a7a65;
          letter-spacing: 0.4px;
        }

        .af-input-wrap { position: relative; }

        .af-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          pointer-events: none;
          opacity: 0.6;
          z-index: 1;
        }
        .af-icon.top { top: 16px; transform: none; }

        .af-input,
        .af-textarea {
          width: 100%;
          background: #f5f7f0;
          border: 1.5px solid #e0e8e3;
          border-radius: 12px;
          padding: 12px 16px 12px 42px;
          font-size: 14px;
          color: #1a3a2a;
          font-family: inherit;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .af-input::placeholder,
        .af-textarea::placeholder { color: #a0b8a8; }
        .af-input:focus,
        .af-textarea:focus {
          background: #fff;
          border-color: #2d6a4f;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.1);
        }
        .af-textarea {
          resize: none;
          height: 110px;
          padding-top: 13px;
          line-height: 1.6;
        }
        .af-input.no-icon { padding-left: 16px; }

        .af-prix-wrap { position: relative; }
        .af-prix-suffix {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 600;
          color: #7a9a85;
          pointer-events: none;
        }

        /* Upload */
        .af-upload-label {
          display: block;
          border: 2px dashed #c8ddd0;
          border-radius: 16px;
          padding: 36px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f5f7f0;
        }
        .af-upload-label:hover {
          border-color: #2d6a4f;
          background: #edf3ef;
        }
        .af-upload-label:hover .af-upload-icon { transform: scale(1.15) translateY(-3px); }
        .af-upload-input { display: none; }
        .af-upload-icon {
          font-size: 32px;
          margin-bottom: 8px;
          display: block;
          transition: transform 0.3s ease;
        }
        .af-upload-text {
          font-size: 14px;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0 0 4px;
        }
        .af-upload-sub {
          font-size: 12px;
          color: #7a9a85;
          margin: 0;
        }

        /* Preview */
        .af-preview {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          height: 180px;
          border: 2px solid #c8ddd0;
        }
        .af-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .af-preview-change-label {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(26,58,42,0.85);
          color: white;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .af-preview-change-label:hover { background: #1a3a2a; }

        /* Type bien */
        .af-type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .af-type-btn {
          padding: 10px 8px;
          border-radius: 12px;
          border: 1.5px solid #e0e8e3;
          background: #f5f7f0;
          font-size: 13px;
          font-weight: 600;
          color: #5a7a65;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-family: inherit;
        }
        .af-type-btn:hover {
          border-color: #2d6a4f;
          color: #1a3a2a;
          background: #edf3ef;
        }
        .af-type-btn.af-active {
          background: #1a3a2a;
          color: white;
          border-color: #1a3a2a;
          box-shadow: 0 4px 12px rgba(26,58,42,0.2);
        }

        /* Erreur */
        .af-error {
          background: #fff0f0;
          border: 1.5px solid #ffcdd2;
          color: #c0392b;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: afShake 0.4s both;
        }
        @keyframes afShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }

        /* Submit */
        .af-submit {
          width: 100%;
          padding: 15px;
          background: #1a3a2a;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
          box-shadow: 0 4px 20px rgba(26,58,42,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }
        .af-submit:hover:not(:disabled) {
          background: #2d5a3e;
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(26,58,42,0.35);
        }
        .af-submit:active:not(:disabled) { transform: translateY(0); }
        .af-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .af-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: afSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes afSpin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .af-wrap { padding: 28px 20px; }
          .af-row { grid-template-columns: 1fr; }
          .af-type-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="af-wrap">

        {error && <div className="af-error"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* 1. Infos générales */}
          <div className="af-section">
            <div className="af-section-label">Informations générales</div>

            <div className="af-field" style={{ marginBottom: "14px" }}>
              <label className="af-label">Titre de l'annonce</label>
              <div className="af-input-wrap">
                <span className="af-icon">📝</span>
                <input
                  type="text"
                  placeholder="Ex : Bel appartement F3 à Alger Centre"
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  className="af-input"
                  required
                />
              </div>
            </div>

            <div className="af-field">
              <label className="af-label">Description</label>
              <div className="af-input-wrap">
                <span className="af-icon top">📄</span>
                <textarea
                  placeholder="Décrivez votre bien : état, équipements, environnement..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="af-textarea"
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Type de bien */}
          <div className="af-section">
            <div className="af-section-label">Type de bien</div>
            <div className="af-type-grid">
              {typesOptions.map(({ val, icon }) => (
                <button
                  key={val}
                  type="button"
                  className={`af-type-btn ${typeBien === val ? "af-active" : ""}`}
                  onClick={() => setTypeBien(val)}
                >
                  {icon} {val}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Localisation & caractéristiques */}
          <div className="af-section">
            <div className="af-section-label">Localisation & caractéristiques</div>

            <div className="af-row">
              <div className="af-field">
                <label className="af-label">Ville</label>
                <div className="af-input-wrap">
                  <span className="af-icon">📍</span>
                  <input
                    type="text"
                    placeholder="Ex : Alger, Oran..."
                    value={ville}
                    onChange={e => setVille(e.target.value)}
                    className="af-input"
                    required
                  />
                </div>
              </div>
              <div className="af-field">
                <label className="af-label">Superficie (m²)</label>
                <div className="af-input-wrap">
                  <span className="af-icon">📐</span>
                  <input
                    type="number"
                    placeholder="Ex : 85"
                    value={superficie}
                    onChange={e => setSuperficie(e.target.value)}
                    className="af-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="af-row" style={{ marginTop: "14px" }}>
              <div className="af-field">
                <label className="af-label">Nombre de pièces</label>
                <div className="af-input-wrap">
                  <span className="af-icon">🚪</span>
                  <input
                    type="number"
                    placeholder="Ex : 3"
                    value={nombrePieces}
                    onChange={e => setNombrePieces(e.target.value)}
                    className="af-input"
                    required
                  />
                </div>
              </div>
              <div className="af-field">
                <label className="af-label">Prix</label>
                <div className="af-prix-wrap">
                  <input
                    type="number"
                    placeholder="Ex : 8 500 000"
                    value={prix}
                    onChange={e => setPrix(e.target.value)}
                    className="af-input no-icon"
                    style={{ paddingRight: "48px" }}
                  />
                  <span className="af-prix-suffix">DA</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Photo */}
          <div className="af-section">
            <div className="af-section-label">Photo du bien</div>

            {imagePreview ? (
              <div className="af-preview">
                <img src={imagePreview} alt="Aperçu" />
                <label className="af-preview-change-label">
                  Changer la photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="af-upload-input"
                  />
                </label>
              </div>
            ) : (
              <label className="af-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="af-upload-input"
                />
                <span className="af-upload-icon">🖼️</span>
                <p className="af-upload-text">Cliquez pour ajouter une photo</p>
                <p className="af-upload-sub">JPG, PNG, WEBP — max 5 Mo</p>
              </label>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="af-submit" disabled={loading}>
            {loading
              ? <><span className="af-spinner" /> Publication en cours...</>
              : <>Publier l'annonce →</>
            }
          </button>

        </form>
      </div>
    </>
  )
}

export default AnnonceForm