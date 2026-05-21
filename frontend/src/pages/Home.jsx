import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import api from "../api"
import AnnonceCard from "../components/AnnonceCard"
import { getApiError } from "../utils/apiError"
import { useI18n } from "../i18n/I18nContext"
import "../styles/Home.css"

// صورك من assets
import heroBg from "../assets/2.jpg"
import ctaBg from "../assets/10.jpg"

import serviceHouse from "../assets/1.jpg"
import serviceAdvice from "../assets/4.jpg"
import serviceGestion from "../assets/6.jpg"
function Home() {
  const { t } = useI18n()
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [smartQuery, setSmartQuery] = useState("")
  const [smartMode, setSmartMode] = useState(false)
  const [ville, setVille] = useState("")
  const [typeBien, setTypeBien] = useState("")
  const [minPrix, setMinPrix] = useState("")
  const [maxPrix, setMaxPrix] = useState("")
  const [minSurface, setMinSurface] = useState("")
  const [maxSurface, setMaxSurface] = useState("")
  const [nombrePieces, setNombrePieces] = useState("")
  const sectionRef = useRef(null)

  const getAnnonces = async () => {
    setLoading(true)
    setError("")
    setSmartMode(false)

    const params = {}
    if (ville) params.ville = ville
    if (typeBien) params.type_bien = typeBien
    if (minPrix) params.min_prix = minPrix
    if (maxPrix) params.max_prix = maxPrix
    if (minSurface) params.min_superficie = minSurface
    if (maxSurface) params.max_superficie = maxSurface
    if (nombrePieces) params.nombre_pieces = nombrePieces

    try {
      const res = await api.get("/annonces/", { params })
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : []
      setAnnonces(list)
    } catch (err) {
      setError(getApiError(err, "Impossible de contacter le serveur."))
      setAnnonces([])
    } finally {
      setLoading(false)
    }
  }

  const runSmartSearch = async (e) => {
    if (e) e.preventDefault()
    if (!smartQuery.trim()) {
      getAnnonces()
      return
    }
    setLoading(true)
    setError("")
    setSmartMode(true)
    try {
      const res = await api.post("/smart-search-nl/", { query: smartQuery.trim() })
      setAnnonces(Array.isArray(res.data?.annonces) ? res.data.annonces : [])
    } catch (err) {
      setError(getApiError(err, "Recherche intelligente indisponible."))
      setAnnonces([])
    } finally {
      setLoading(false)
      sectionRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
      getAnnonces()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.12 }
    )

    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    }, 100)

    return () => observer.disconnect()
   }, [])

   

  const handleSearch = (e) => {
    e.preventDefault()
    getAnnonces()
    sectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const resetFilters = () => {
    setSmartQuery("")
    setVille("")
    setTypeBien("")
    setMinPrix("")
    setMaxPrix("")
    setMinSurface("")
    setMaxSurface("")
    setNombrePieces("")
    setSmartMode(false)
    setTimeout(getAnnonces, 50)
  }

  const servicesTop = [
    {
      icon: "🏠",
      title: "Achat Immobilier",
      text: "Découvrez les meilleures offres pour acheter une maison ou un appartement en toute sérénité.",
    },
    {
      icon: "🔑",
      title: "Vente de Propriétés",
      text: "Vendez votre bien immobilier rapidement avec une présentation élégante et efficace.",
    },
    {
      icon: "🏢",
      title: "Location de Logement",
      text: "Trouvez la location idéale pour vous et votre famille selon votre budget.",
    },
  ]

 const servicesBottom = [
  {
    image: serviceHouse,
    title: "Estimation Gratuite",
    text: "Estimez la valeur de votre bien gratuitement et en quelques clics.",
    link: "/estimation-gratuite",
  },
  {
    image: serviceAdvice,
    title: "Conseils Immobiliers",
    text: "Bénéficiez d’un accompagnement sur mesure pour réussir votre projet.",
    link: "/conseils-immobiliers",
  },
  {
    image: serviceGestion,
    title: "Gestion Locative",
    text: "Confiez-nous la gestion de vos biens en toute tranquillité.",
    link: "/gestion-locative",
  },
]
  return (
    <div className="home-page">
      <section
        className="home-hero"
        style={{ backgroundImage: `linear-gradient(rgba(14, 26, 45, 0.58), rgba(14, 26, 45, 0.58)), url(${heroBg})` }}
      >
        <div className="home-hero-overlay" />
        <div className="home-shell">
          <div className="home-hero-content">
            <div className="hero-copy reveal">
              <span className="hero-kicker">Immobilier premium</span>
              <h1 className="hero-title">Trouvez la maison de vos rêves</h1>
              <p className="hero-text">
                Achetez, vendez et louez en toute confiance avec une expérience
                simple, élégante et moderne.
              </p>
            </div>

            <form className="hero-search reveal smart-search-bar" onSubmit={runSmartSearch}>
              <div className="hero-field full-width">
                <label>Recherche intelligente</label>
                <input
                  type="text"
                  placeholder={t("smartSearchPlaceholder")}
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="hero-search-btn">{t("search")}</button>
            </form>

            <form className="hero-search reveal" onSubmit={handleSearch}>
              <div className="hero-search-grid">
                <div className="hero-field">
                  <label>Type de bien</label>
                  <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)}>
                    <option value="">Tous</option>
                    <option value="Appartement">Appartement</option>
                    <option value="Villa">Villa</option>
                    <option value="Maison">Maison</option>
                    <option value="Studio">Studio</option>
                    <option value="Terrain">Terrain</option>
                    <option value="Local commercial">Local commercial</option>
                  </select>
                </div>

                <div className="hero-field">
                  <label>Localisation</label>
                  <input
                    type="text"
                    placeholder="Ex : Alger, Oran..."
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                  />
                </div>

                <div className="hero-field">
                  <label>Budget min</label>
                  <input
                    type="number"
                    placeholder="0 DA"
                    value={minPrix}
                    onChange={(e) => setMinPrix(e.target.value)}
                  />
                </div>

                <div className="hero-field">
                  <label>Budget max</label>
                  <input
                    type="number"
                    placeholder="Sans limite"
                    value={maxPrix}
                    onChange={(e) => setMaxPrix(e.target.value)}
                  />
                </div>

                <button type="submit" className="hero-search-btn">
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="top-services">
        <div className="home-shell">
          <div className="top-services-grid">
           
           {servicesTop.map((item, index) => (
  <article
    key={item.title}
    className="top-service-card reveal"
    style={{ transitionDelay: `${index * 0.08}s` }}
  >
    <div className="top-service-icon">{item.icon}</div>
    <h3>{item.title}</h3>
    <p>{item.text}</p>

    {index === 0 && (
      <Link to="/achat-immobilier" className="gold-btn small">
        Voir plus
      </Link>
    )}

    {index === 1 && (
      <Link to="/vente-proprietes" className="gold-btn small">
        Voir plus
      </Link>
    )}

    {index === 2 && (
      <Link to="/location-logement" className="gold-btn small">
        Voir plus
      </Link>
    )}
  </article>
))}
           
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="home-shell">
          <div className="section-head reveal">
            <span className="section-line" />
            <h2>Nos Services</h2>
            <span className="section-line" />
          </div>

          <div className="services-grid">
            {servicesBottom.map((item, index) => (
              <article
                key={item.title}
                className="service-card reveal"
                style={{ transitionDelay: `${index * 0.08}s` }}
              >
                <div className="service-image-wrap">
                  <img src={item.image} alt={item.title} className="service-image" />
                </div>
                <div className="service-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
<Link to={item.link} className="gold-btn small">
  En savoir plus
</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

<section id="annonces" className="annonces-section" ref={sectionRef}>
        <div className="home-shell">
          <div className="annonces-header reveal">
            <div>
              <span className="section-tag">Biens disponibles</span>
              <h2 className="annonces-title">Découvrez nos annonces</h2>
              <p className="annonces-subtitle">
                Une sélection de biens immobiliers présentés dans un style premium.
              </p>
            </div>

            <button className="outline-btn" onClick={resetFilters}>
              Réinitialiser
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={getAnnonces} className="retry-btn">
                Réessayer
              </button>
            </div>
          )}

          {loading ? (
            <div className="listing-skeletons">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="listing-skeleton" />
              ))}
            </div>
          ) : annonces.length === 0 && !error ? (
            <div className="empty-state reveal">
              <div className="empty-icon">🏡</div>
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez un autre filtre ou réinitialisez la recherche.</p>
              <button className="gold-btn" onClick={resetFilters}>
                Voir tout
              </button>
            </div>
          ) : (
            <div className="listing-grid">
              {annonces.map((annonce, index) => (
                <div
                  key={annonce.id}
                  className="reveal"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <AnnonceCard annonce={annonce} showMatch={smartMode} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="home-cta"
        style={{ backgroundImage: `linear-gradient(rgba(14, 26, 45, 0.72), rgba(14, 26, 45, 0.72)), url(${ctaBg})` }}
      >
        <div className="home-shell">
          <div className="cta-box reveal">
            <h2>Inscrivez-vous aujourd’hui !</h2>
            <p>Et trouvez la maison parfaite en quelques clics.</p>
            <Link to="/login#signup" className="gold-btn cta-btn">
              S’inscrire
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home