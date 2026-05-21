import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import api from "../api"
import { ACCESS_TOKEN } from "../constants"
import logoBlue from "../assets/logo-blue.png"

function NavbarPrivate() {
  const location = useLocation()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr")
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

  const [username, setUsername] = useState(localStorage.getItem("username") || "Utilisateur")
  const [email, setEmail] = useState(localStorage.getItem("email") || "")

  const [unreadCount] = useState(0)

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

  const [profileName, setProfileName] = useState(localStorage.getItem("username") || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.classList.remove("theme-light", "theme-dark")
    document.documentElement.classList.add(theme === "dark" ? "theme-dark" : "theme-light")
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr")
    localStorage.setItem("lang", lang)
  }, [lang])

  useEffect(() => {
    setMenuOpen(false)
    setPanelOpen(false)
    setProfileSuccess("")
    setProfileError("")
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [panelOpen])

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Utilisateur"
    const storedEmail = localStorage.getItem("email") || ""
    setUsername(storedUsername)
    setProfileName(storedUsername)
    setEmail(storedEmail)
  }, [])

  const initials = useMemo(() => {
    const clean = (username || "U").trim()
    return clean.charAt(0).toUpperCase()
  }, [username])

  const labels = {
    fr: {
      home: "Accueil",
      dashboard: "Dashboard",
      myAnnonces: "Mes annonces",
      favorites: "Favoris",
      messages: "Messages",
      publish: "Publier",
      notifications: "Notifications",
      account: "Mon compte",
      editProfile: "Modifier le compte",
      username: "Nom d'utilisateur",
      email: "Email",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      save: "Enregistrer",
      logout: "Déconnexion",
      appearance: "Apparence",
      language: "Langue",
      light: "Clair",
      dark: "Sombre",
      navigation: "Navigation",
      infos: "Informations",
      about: "À propos",
      blog: "Blog",
      contact: "Contact",
      updated: "Compte mis à jour avec succès.",
      fillAll: "Remplis tous les champs du mot de passe.",
      mismatch: "Les nouveaux mots de passe ne correspondent pas.",
      shortPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      requiredName: "Le nom d'utilisateur est obligatoire.",
      impossible: "Impossible de mettre à jour le compte.",
    },
    en: {
      home: "Home",
      dashboard: "Dashboard",
      myAnnonces: "My listings",
      favorites: "Favorites",
      messages: "Messages",
      publish: "Publish",
      notifications: "Notifications",
      account: "My account",
      editProfile: "Edit account",
      username: "Username",
      email: "Email",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      save: "Save",
      logout: "Logout",
      appearance: "Appearance",
      language: "Language",
      light: "Light",
      dark: "Dark",
      navigation: "Navigation",
      infos: "Information",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      updated: "Account updated successfully.",
      fillAll: "Fill in all password fields.",
      mismatch: "New passwords do not match.",
      shortPassword: "Password must contain at least 6 characters.",
      requiredName: "Username is required.",
      impossible: "Unable to update account.",
    },
    ar: {
      home: "الرئيسية",
      dashboard: "لوحة التحكم",
      myAnnonces: "إعلاناتي",
      favorites: "المفضلة",
      messages: "الرسائل",
      publish: "نشر",
      notifications: "الإشعارات",
      account: "حسابي",
      editProfile: "تعديل الحساب",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      save: "حفظ",
      logout: "تسجيل الخروج",
      appearance: "المظهر",
      language: "اللغة",
      light: "فاتح",
      dark: "داكن",
      navigation: "التنقل",
      infos: "معلومات",
      about: "من نحن",
      blog: "المدونة",
      contact: "اتصل بنا",
      updated: "تم تحديث الحساب بنجاح.",
      fillAll: "املأ جميع حقول كلمة المرور.",
      mismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
      shortPassword: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.",
      requiredName: "اسم المستخدم مطلوب.",
      impossible: "تعذر تحديث الحساب.",
    },
  }

  const t = labels[lang]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    setPanelOpen(false)
    setMenuOpen(false)
    window.dispatchEvent(new Event("storage"))
    navigate("/login")
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess("")

    if (!profileName.trim()) {
      setProfileError(t.requiredName)
      return
    }

    const wantsPasswordChange = currentPassword || newPassword || confirmPassword

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setProfileError(t.fillAll)
        return
      }
      if (newPassword !== confirmPassword) {
        setProfileError(t.mismatch)
        return
      }
      if (newPassword.length < 6) {
        setProfileError(t.shortPassword)
        return
      }
    }

    setProfileSaving(true)

    try {
      let updatedName = profileName.trim()

      try {
        const res = await api.patch("/profile/", {
          username: updatedName,
        })

        if (res?.data?.username) {
          updatedName = res.data.username
        }
        if (res?.data?.email) {
          setEmail(res.data.email)
          localStorage.setItem("email", res.data.email)
        }
      } catch {
        // fallback local si l'endpoint n'existe pas encore
      }

      if (wantsPasswordChange) {
        await api.post("/change-password/", {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        })
      }

      setUsername(updatedName)
      setProfileName(updatedName)
      localStorage.setItem("username", updatedName)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setProfileSuccess(t.updated)
      window.dispatchEvent(new Event("storage"))
    } catch (error) {
      const apiMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error

      setProfileError(apiMessage || t.impossible)
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <>
      <style>{`
        html.theme-dark body {
          background: #081633;
          color: #f4f3ee;
        }

        html.theme-light body {
          background: #f5f7f0;
          color: #1a3a2a;
        }

        .nv-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1300;
          padding: 24px 38px 0;
          transition: all 0.3s ease;
          font-family: Georgia, "Times New Roman", serif;
        }

        .nv-navbar.scrolled {
          padding-top: 14px;
        }

        .nv-inner {
          max-width: 1400px;
          margin: 0 auto;
          min-height: 74px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 16px 0 18px;
          background: rgba(8, 22, 54, 0.52);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: ${scrolled
            ? "0 10px 40px rgba(3, 13, 36, 0.35)"
            : "0 8px 28px rgba(3, 13, 36, 0.18)"};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .nv-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
          flex-shrink: 0;
        }

        .nv-logo-mark {
          width: 40px;
          height: 40px;
          object-fit: contain;
          display: block;
        }

        .nv-logo-text {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .nv-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex: 1;
          margin: 0 18px;
        }

        .nv-link {
          text-decoration: none;
          color: rgba(255,255,255,0.92);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 999px;
          transition: all 0.25s ease;
          line-height: 1;
          white-space: nowrap;
        }

        .nv-link:hover {
          color: white;
          background: rgba(255,255,255,0.08);
        }

        .nv-link.active {
          background: rgba(255,255,255,0.12);
          color: white;
        }

        .nv-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .nv-publish {
          text-decoration: none;
          background: linear-gradient(135deg, #d5a640, #c8922b);
          color: #fffdfa;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 999px;
          box-shadow:
            0 10px 24px rgba(201, 146, 43, 0.28),
            0 0 22px rgba(213, 166, 64, 0.16);
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .nv-publish:hover {
          transform: translateY(-1px);
        }

        .nv-circle-btn,
        .nv-user-btn,
        .nv-burger {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          transition: all 0.25s ease;
        }

        .nv-circle-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          position: relative;
        }

        .nv-circle-btn:hover,
        .nv-user-btn:hover,
        .nv-burger:hover {
          background: rgba(255,255,255,0.08);
        }

        .nv-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          background: #d5a640;
          color: #081633;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          box-shadow: 0 4px 12px rgba(213, 166, 64, 0.3);
        }

        .nv-user-btn {
          min-height: 48px;
          border-radius: 999px;
          padding: 6px 10px 6px 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .nv-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d5a640, #c8922b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Segoe UI", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .nv-username {
          color: white;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          max-width: 96px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-burger {
          display: none;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
        }

        .nv-burger span {
          width: 18px;
          height: 2px;
          background: white;
          border-radius: 999px;
          display: block;
        }

        .nv-mobile {
          display: none;
          max-width: 1400px;
          margin: 12px auto 0;
          border-radius: 28px;
          padding: 16px;
          background: rgba(9, 21, 48, 0.94);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 16px 34px rgba(0,0,0,0.28);
          backdrop-filter: blur(14px);
        }

        .nv-mobile.open {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nv-mobile-link,
        .nv-mobile-publish,
        .nv-mobile-logout {
          text-decoration: none;
          color: white;
          border-radius: 18px;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 700;
          background: rgba(255,255,255,0.05);
          font-family: "Segoe UI", system-ui, sans-serif;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .nv-mobile-publish {
          background: linear-gradient(135deg, #d5a640, #c8922b);
          color: #fffdfa;
        }

        .nv-mobile-logout {
          background: rgba(196, 62, 62, 0.18);
          color: #ffd9d9;
        }

        .nv-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.42);
          z-index: 1298;
          opacity: 0;
          pointer-events: none;
          transition: 0.25s ease;
        }

        .nv-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .nv-sidebar {
          position: fixed;
          top: 110px;
          right: 0;
          width: min(430px, 100%);
          height: calc(100vh - 110px);
          background: linear-gradient(180deg, #091530 0%, #0e1f44 100%);
          color: white;
          z-index: 1299;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          box-shadow: -18px 0 45px rgba(0,0,0,0.35);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 20px 22px 26px;
        }

        .nv-sidebar.open {
          transform: translateX(0);
        }

        .nv-side-head {
          padding: 20px 22px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .nv-side-user {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nv-side-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, #d5a640, #c8922b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Segoe UI", system-ui, sans-serif;
          font-weight: 800;
          font-size: 17px;
        }

        .nv-side-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: white;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-side-sub {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-side-close {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: white;
          cursor: pointer;
          font-size: 18px;
        }

        .nv-side-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .nv-section + .nv-section {
          margin-top: 0px;
        }

        .nv-section-title {
          margin: 0 0 10px;
          font-size: 12px;
          font-weight: 800;
          color: #d7b15d;
          letter-spacing: 1.1px;
          text-transform: uppercase;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-nav-list,
        .nv-settings-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nv-side-link,
        .nv-option-btn {
          width: 100%;
          text-decoration: none;
          color: white;
          border-radius: 18px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: all 0.25s ease;
          font-size: 14px;
          font-weight: 700;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-side-link:hover,
        .nv-option-btn:hover {
          background: rgba(255,255,255,0.09);
        }

        .nv-side-link.active {
          background: rgba(213, 166, 64, 0.14);
          border-color: rgba(213, 166, 64, 0.22);
          color: #fff5df;
        }

        .nv-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nv-check {
          color: #e0b45b;
          font-weight: 800;
        }

        .nv-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nv-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nv-field label {
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          font-weight: 600;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-field input {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: white;
          border-radius: 16px;
          padding: 13px 14px;
          outline: none;
          font-size: 14px;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-field input::placeholder {
          color: rgba(255,255,255,0.42);
        }

        .nv-save {
          margin-top: 4px;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #d5a640, #c8922b);
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          font-family: "Segoe UI", system-ui, sans-serif;
          box-shadow: 0 10px 24px rgba(201, 146, 43, 0.24);
        }

        .nv-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .nv-success,
        .nv-error {
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 700;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-success {
          background: rgba(60, 179, 113, 0.16);
          color: #d8ffea;
          border: 1px solid rgba(60, 179, 113, 0.18);
        }

        .nv-error {
          background: rgba(255, 87, 87, 0.12);
          color: #ffd6d6;
          border: 1px solid rgba(255, 87, 87, 0.16);
        }

        .nv-logout {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(195, 70, 70, 0.16);
          color: #ffd7d7;
          border-radius: 18px;
          padding: 14px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        @media (max-width: 1220px) {
          .nv-links {
            display: none;
          }

          .nv-burger {
            display: flex;
          }
        }

        @media (max-width: 840px) {
          .nv-navbar {
            padding: 16px 14px 0;
          }

          .nv-username,
          .nv-publish,
          .nv-circle-btn {
            display: none;
          }

          .nv-mobile {
            margin-top: 10px;
          }

          .nv-logo-text {
            font-size: 24px;
          }
        }

        .nv-side-footer {
          padding: 16px 22px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, rgba(9,21,48,0) 0%, rgba(9,21,48,0.96) 35%);
          flex-shrink: 0;
        }
      `}</style>

      <header className={`nv-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nv-inner">
          <Link to="/" className="nv-logo">
  <span className="nv-logo-mark">
    <img
      src={logoBlue}
      alt="logo"
      style={{ width: "34px", height: "34px", objectFit: "contain" }}
    />
  </span>

  <span className="nv-logo-text">Saheliq</span>
</Link>
          <nav className="nv-links">
            <Link to="/" className={`nv-link ${isActive("/") ? "active" : ""}`}>{t.home}</Link>
            <Link to="/dashboard" className={`nv-link ${isActive("/dashboard") ? "active" : ""}`}>{t.dashboard}</Link>
            <Link to="/mes-annonces" className={`nv-link ${isActive("/mes-annonces") ? "active" : ""}`}>{t.myAnnonces}</Link>
            <Link to="/mes-favoris" className={`nv-link ${isActive("/mes-favoris") ? "active" : ""}`}>{t.favorites}</Link>
            <Link to="/mes-messages" className={`nv-link ${isActive("/mes-messages") ? "active" : ""}`}>{t.messages}</Link>
          </nav>

          <div className="nv-right">
            <Link to="/publier" className="nv-publish">{t.publish}</Link>

            <Link to="/notifications" className="nv-circle-btn" title={t.notifications}>
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="nv-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </Link>

            <button type="button" className="nv-user-btn" onClick={() => setPanelOpen(true)}>
              <span className="nv-avatar">{initials}</span>
              <span className="nv-username">{username}</span>
            </button>

            <button
              type="button"
              className="nv-burger"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`nv-mobile ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nv-mobile-link">{t.home}</Link>
          <Link to="/dashboard" className="nv-mobile-link">{t.dashboard}</Link>
          <Link to="/mes-annonces" className="nv-mobile-link">{t.myAnnonces}</Link>
          <Link to="/mes-favoris" className="nv-mobile-link">{t.favorites}</Link>
          <Link to="/mes-messages" className="nv-mobile-link">{t.messages}</Link>
          <Link to="/about" className="nv-mobile-link">{t.about}</Link>
          <Link to="/blog" className="nv-mobile-link">{t.blog}</Link>
          <Link to="/contact" className="nv-mobile-link">{t.contact}</Link>
          <Link to="/publier" className="nv-mobile-publish">{t.publish}</Link>
          <button type="button" className="nv-mobile-logout" onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      </header>

      <div
        className={`nv-overlay ${panelOpen ? "open" : ""}`}
        onClick={() => setPanelOpen(false)}
      />

      <aside className={`nv-sidebar ${panelOpen ? "open" : ""}`}>
        <div className="nv-side-head">
          <div className="nv-side-user">
            <div className="nv-side-avatar">{initials}</div>
            <div>
              <p className="nv-side-title">{t.account}</p>
              <p className="nv-side-sub">{email || username}</p>
            </div>
          </div>

          <button type="button" className="nv-side-close" onClick={() => setPanelOpen(false)}>
            ✕
          </button>
        </div>

        <div className="nv-side-body">
          <section className="nv-section">
            <p className="nv-section-title">{t.navigation}</p>
            <div className="nv-nav-list">
              <Link to="/dashboard" className={`nv-side-link ${isActive("/dashboard") ? "active" : ""}`}>
                <span className="nv-left"><span>📊</span><span>{t.dashboard}</span></span>
              </Link>

              <Link to="/profile" className={`nv-side-link ${isActive("/profile") ? "active" : ""}`}>
                <span className="nv-left"><span>👤</span><span>{t.profile || "Mon profil"}</span></span>
              </Link>

              <Link to="/" className={`nv-side-link ${isActive("/") ? "active" : ""}`}>
                <span className="nv-left"><span>🏠</span><span>{t.home}</span></span>
              </Link>

              <Link to="/mes-annonces" className={`nv-side-link ${isActive("/mes-annonces") ? "active" : ""}`}>
                <span className="nv-left"><span>📋</span><span>{t.myAnnonces}</span></span>
              </Link>

              <Link to="/mes-favoris" className={`nv-side-link ${isActive("/mes-favoris") ? "active" : ""}`}>
                <span className="nv-left"><span>❤️</span><span>{t.favorites}</span></span>
              </Link>

              <Link to="/mes-messages" className={`nv-side-link ${isActive("/mes-messages") ? "active" : ""}`}>
                <span className="nv-left"><span>💬</span><span>{t.messages}</span></span>
              </Link>

              <Link to="/notifications" className={`nv-side-link ${isActive("/notifications") ? "active" : ""}`}>
                <span className="nv-left"><span>🔔</span><span>{t.notifications}</span></span>
                {unreadCount > 0 && <span className="nv-check">{unreadCount}</span>}
              </Link>

              <Link to="/publier" className={`nv-side-link ${isActive("/publier") ? "active" : ""}`}>
                <span className="nv-left"><span>📢</span><span>{t.publish}</span></span>
              </Link>
            </div>
          </section>

          <section className="nv-section">
            <p className="nv-section-title">{t.infos}</p>
            <div className="nv-nav-list">
              <Link to="/about" className={`nv-side-link ${isActive("/about") ? "active" : ""}`}>
                <span className="nv-left"><span>ℹ️</span><span>{t.about}</span></span>
              </Link>
              <Link to="/blog" className={`nv-side-link ${isActive("/blog") ? "active" : ""}`}>
                <span className="nv-left"><span>📰</span><span>{t.blog}</span></span>
              </Link>
              <Link to="/contact" className={`nv-side-link ${isActive("/contact") ? "active" : ""}`}>
                <span className="nv-left"><span>✉️</span><span>{t.contact}</span></span>
              </Link>
            </div>
          </section>

          <section className="nv-section">
            <p className="nv-section-title">{t.editProfile}</p>

            <form className="nv-form" onSubmit={saveProfile}>
              {profileSuccess && <div className="nv-success">{profileSuccess}</div>}
              {profileError && <div className="nv-error">{profileError}</div>}

              <div className="nv-field">
                <label>{t.username}</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder={t.username}
                />
              </div>

              <div className="nv-field">
                <label>{t.currentPassword}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t.currentPassword}
                />
              </div>

              <div className="nv-field">
                <label>{t.newPassword}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.newPassword}
                />
              </div>

              <div className="nv-field">
                <label>{t.confirmPassword}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPassword}
                />
              </div>

              <button type="submit" className="nv-save" disabled={profileSaving}>
                {profileSaving ? "..." : t.save}
              </button>
            </form>
          </section>

          <section className="nv-section">
            <p className="nv-section-title">{t.language}</p>
            <div className="nv-settings-list">
              {[
                { code: "fr", label: "🇫🇷 Français" },
                { code: "en", label: "🇬🇧 English" },
                { code: "ar", label: "🇩🇿 العربية" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className="nv-option-btn"
                  onClick={() => setLang(item.code)}
                >
                  <span className="nv-left"><span>{item.label}</span></span>
                  {lang === item.code && <span className="nv-check">✓</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="nv-section">
            <p className="nv-section-title">{t.appearance}</p>
            <div className="nv-settings-list">
              <button type="button" className="nv-option-btn" onClick={() => setTheme("light")}>
                <span className="nv-left"><span>☀️</span><span>{t.light}</span></span>
                {theme === "light" && <span className="nv-check">✓</span>}
              </button>

              <button type="button" className="nv-option-btn" onClick={() => setTheme("dark")}>
                <span className="nv-left"><span>🌙</span><span>{t.dark}</span></span>
                {theme === "dark" && <span className="nv-check">✓</span>}
              </button>
            </div>
          </section>
        </div>

        <div className="nv-side-footer">
          <button type="button" className="nv-logout" onClick={handleLogout}>
            🚪 {t.logout}
          </button>
        </div>
      </aside>
    </>
  )
}

export default NavbarPrivate