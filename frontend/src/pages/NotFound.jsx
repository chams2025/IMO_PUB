import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.code}>404</h1>
        <div style={styles.icon}>🏚️</div>
        <h2 style={styles.title}>Page introuvable</h2>
        <p style={styles.subtitle}>
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link to="/" style={styles.btn}>
          🏠 Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  content: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  code: {
    fontSize: "100px",
    fontWeight: "bold",
    color: "#e8f0fe",
    margin: 0,
    lineHeight: 1,
  },
  icon: {
    fontSize: "64px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#888",
    margin: 0,
  },
  btn: {
    backgroundColor: "#1a1a2e",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "15px",
    marginTop: "8px",
  },
}

export default NotFound