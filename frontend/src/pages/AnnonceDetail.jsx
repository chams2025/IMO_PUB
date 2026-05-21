import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN } from "../constants"
import AnnonceCard from "../components/AnnonceCard"
import { useI18n } from "../i18n/I18nContext"
import "../styles/PublierAnnonce.css"

function AnnonceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()

  const [annonce, setAnnonce] = useState(null)
  const [priceCheck, setPriceCheck] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [isFavoris, setIsFavoris] = useState(false)
  const [favoriteId, setFavoriteId] = useState(null)

  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [msgSuccess, setMsgSuccess] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [showReportBox, setShowReportBox] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    setIsLoggedIn(!!token)
    getAnnonce()
    getRecommendations()
    if (token) checkFavoris()
  }, [id])

  useEffect(() => {
    if (!annonce) return
    const { prix, ville, type_bien, superficie, nombre_pieces } = annonce
    if (!prix || !ville || !type_bien || !superficie) return

    let cancelled = false
    api
      .post("/check-price/", {
        prix,
        ville,
        type_bien,
        superficie,
        nombre_pieces: nombre_pieces || 1,
      })
      .then((res) => {
        if (!cancelled) setPriceCheck(res.data)
      })
      .catch(() => {
        if (!cancelled) setPriceCheck(null)
      })

    return () => {
      cancelled = true
    }
  }, [annonce])

  const getAnnonce = () => {
    api.get(`/annonces/${id}/`)
      .then((res) => setAnnonce(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false))
  }

  const getRecommendations = () => {
    api.get(`/annonces/${id}/recommendations/`)
      .then((res) => setRecommendations(res.data))
      .catch(() => {})
  }

  const checkFavoris = () => {
    api.get("/favorites/")
      .then((res) => {
        const fav = res.data.find((f) => {
          const aid = typeof f.annonce === "object" ? f.annonce?.id : f.annonce
          return Number(aid) === Number(id)
        })
        if (fav) {
          setIsFavoris(true)
          setFavoriteId(fav.id)
        }
      })
      .catch(() => {})
  }

  const toggleFavoris = () => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (isFavoris) {
      api.delete(`/favorites/${favoriteId}/`)
        .then(() => {
          setIsFavoris(false)
          setFavoriteId(null)
        })
    } else {
      api.post("/favorites/", { annonce: id })
        .then((res) => {
          setIsFavoris(true)
          setFavoriteId(res.data.id)
        })
    }
  }

  const sendContact = (e) => {
    e.preventDefault()
    api.post(`/annonces/${id}/contact/`, { nom, email, message })
      .then(() => {
        setMsgSuccess(true)
        setNom("")
        setEmail("")
        setMessage("")
      })
      .catch(() => alert("Erreur lors de l'envoi du message."))
  }

  const hideAnnonce = async () => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    setActionLoading(true)
    setActionMessage("")

    try {
      await api.post(`/annonces/${id}/hide/`)
      setActionMessage("✅ Annonce masquée avec succès.")
    } catch {
      setActionMessage("❌ Impossible de masquer cette annonce.")
    } finally {
      setActionLoading(false)
    }
  }

  const submitReport = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (!reportReason) {
      setActionMessage("⚠️ Choisissez une raison pour le signalement.")
      return
    }

    setActionLoading(true)
    setActionMessage("")

    try {
      await api.post(`/annonces/${id}/report/`, {
        reason: reportReason,
        details: reportDetails,
      })

      setActionMessage("✅ Signalement envoyé avec succès.")
      setShowReportBox(false)
      setReportReason("")
      setReportDetails("")
    } catch {
      setActionMessage("❌ Impossible d'envoyer le signalement.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p style={styles.loading}>Chargement...</p>
  if (!annonce) return null

  return (
    <div style={styles.container}>

      {annonce.image ? (
        <img
          src={`${import.meta.env.VITE_APP_API_URL}${annonce.image}`}
          alt={annonce.titre}
          style={styles.image}
        />
      ) : (
        <div style={styles.noImage}>🏠</div>
      )}

      <div style={styles.header}>
        <div>
          <span style={styles.badge}>{annonce.type_bien}</span>
          <h1 style={styles.titre}>{annonce.titre}</h1>
          <p style={styles.ville}>📍 {annonce.ville}</p>
        </div>

        <div style={styles.headerRight}>
          <p style={styles.prix}>
            {annonce.prix
              ? `${Number(annonce.prix).toLocaleString()} DA`
              : "Prix non défini"}
          </p>

          {priceCheck && (
            <div
              className={
                priceCheck.status === "high"
                  ? "price-badge high"
                  : priceCheck.status === "low"
                    ? "price-badge low"
                    : "price-badge normal"
              }
              style={styles.priceBadgeWrap}
            >
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
              {priceCheck.message && (
                <span style={styles.priceMessage}>{priceCheck.message}</span>
              )}
            </div>
          )}

          <div style={styles.headerButtons}>
            <button
              onClick={toggleFavoris}
              style={isFavoris ? styles.favOn : styles.favOff}
            >
              {isFavoris ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={hideAnnonce}
                  style={styles.hideBtn}
                  disabled={actionLoading}
                >
                  {actionLoading ? "..." : "🙈 Masquer"}
                </button>

                <button
                  onClick={() => setShowReportBox((prev) => !prev)}
                  style={styles.reportBtn}
                  disabled={actionLoading}
                >
                  🚩 Signaler
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {actionMessage && (
        <div style={styles.infoBox}>{actionMessage}</div>
      )}

      {isLoggedIn && showReportBox && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Signaler cette annonce</h2>

          <form onSubmit={submitReport} style={styles.form}>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Choisir une raison</option>
              <option value="fake">Annonce suspecte ou fausse</option>
              <option value="spam">Spam</option>
              <option value="duplicate">Annonce dupliquée</option>
              <option value="abuse">Contenu abusif</option>
              <option value="wrong_info">Informations trompeuses</option>
              <option value="other">Autre</option>
            </select>

            <textarea
              placeholder="Ajoutez des détails si nécessaire..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              style={styles.textarea}
            />

            <div style={styles.reportActions}>
              <button type="submit" style={styles.btnSubmit} disabled={actionLoading}>
                {actionLoading ? "Envoi..." : "Envoyer le signalement"}
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowReportBox(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.details}>
        <div style={styles.detailItem}>🛏 <strong>{annonce.nombre_pieces}</strong> pièces</div>
        <div style={styles.detailItem}>📐 <strong>{annonce.superficie}</strong> m²</div>
        <div style={styles.detailItem}>
          📅 {new Date(annonce.date_publication).toLocaleDateString("fr-FR")}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Description</h2>
        <p style={styles.description}>{annonce.description}</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Contacter le propriétaire</h2>
        {msgSuccess ? (
          <p style={styles.success}>✅ Message envoyé avec succès !</p>
        ) : (
          <form onSubmit={sendContact} style={styles.form}>
            <input
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <textarea
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={styles.textarea}
            />
            <button type="submit" style={styles.btnSubmit}>
              Envoyer
            </button>
          </form>
        )}
      </div>

      {recommendations.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Annonces similaires</h2>
          <div style={styles.grid}>
            {recommendations.map((r) => (
              <AnnonceCard key={r.id} annonce={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "24px" },
  loading: { textAlign: "center", marginTop: "60px", color: "#888" },
  image: { width: "100%", height: "380px", objectFit: "cover", borderRadius: "12px" },
  noImage: {
    width: "100%",
    height: "280px",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "80px",
    borderRadius: "12px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    margin: "20px 0",
    flexWrap: "wrap",
    gap: "16px"
  },
  headerRight: { textAlign: "right" },
  headerButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  badge: {
    backgroundColor: "#e8f0fe",
    color: "#1a1a2e",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold"
  },
  titre: { fontSize: "26px", fontWeight: "bold", color: "#1a1a2e", margin: "10px 0 6px" },
  ville: { fontSize: "15px", color: "#666" },
  prix: { fontSize: "24px", fontWeight: "bold", color: "#e74c3c", margin: "0 0 10px" },
  priceBadgeWrap: { marginBottom: 10, textAlign: "right" },
  priceMessage: { display: "block", fontSize: 12, marginTop: 4, opacity: 0.9 },
  favOn: {
    backgroundColor: "#fdecea",
    color: "#e74c3c",
    border: "1px solid #e74c3c",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  favOff: {
    backgroundColor: "white",
    color: "#1a1a2e",
    border: "1px solid #ddd",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  hideBtn: {
    backgroundColor: "#f4f6f8",
    color: "#333",
    border: "1px solid #d9dee3",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  reportBtn: {
    backgroundColor: "#fff5e6",
    color: "#c97a00",
    border: "1px solid #f0c36d",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #dbe4ea",
    color: "#334",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px"
  },
  details: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    backgroundColor: "#f8f9fa",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "24px"
  },
  detailItem: { fontSize: "14px", color: "#444" },
  section: { marginBottom: "32px" },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: "16px",
    borderBottom: "2px solid #e8f0fe",
    paddingBottom: "8px"
  },
  description: { fontSize: "15px", color: "#444", lineHeight: "1.7" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px"
  },
  textarea: {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    minHeight: "120px",
    resize: "vertical"
  },
  reportActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  btnSubmit: {
    padding: "10px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px"
  },
  cancelBtn: {
    padding: "10px 16px",
    backgroundColor: "#f1f3f5",
    color: "#333",
    border: "1px solid #d9dee3",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  success: { color: "green", fontSize: "15px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px"
  },
}

export default AnnonceDetail