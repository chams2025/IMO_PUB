import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logoBlue from "../assets/logo-blue.png";

function NavbarPublic() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(
      theme === "dark" ? "theme-dark" : "theme-light"
    );
    localStorage.setItem("theme", theme);
  }, [theme]);

  const labels = {
    fr: {
      home: "Home",
      about: "About",
      contact: "Contact",
      blogs: "Blogs",
      login: "Log in",
      register: "Register",
      settings: "Paramètres",
      language: "Langue",
      appearance: "Apparence",
      light: "Clair",
      dark: "Sombre",
    },
    en: {
      home: "Home",
      about: "About",
      contact: "Contact",
      blogs: "Blogs",
      login: "Log in",
      register: "Register",
      settings: "Settings",
      language: "Language",
      appearance: "Appearance",
      light: "Light",
      dark: "Dark",
    },
    ar: {
      home: "الرئيسية",
      about: "من نحن",
      contact: "اتصل بنا",
      blogs: "المدونة",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      settings: "الإعدادات",
      language: "اللغة",
      appearance: "المظهر",
      light: "فاتح",
      dark: "داكن",
    },
  };

  const t = labels[lang];

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
          font-family: Georgia, "Times New Roman", serif;
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
          box-shadow: 0 8px 28px rgba(3, 13, 36, 0.18);
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
          position: relative;
        }

        .nv-login {
          text-decoration: none;
          color: rgba(255,255,255,0.92);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 999px;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .nv-login:hover {
          color: white;
          background: rgba(255,255,255,0.08);
        }

        .nv-register {
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

        .nv-register:hover {
          transform: translateY(-1px);
        }

        .nv-settings-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .nv-settings-btn:hover {
          background: rgba(255,255,255,0.08);
          transform: rotate(20deg);
        }

        .nv-settings-menu {
          position: absolute;
          top: 62px;
          right: 0;
          width: 260px;
          background: rgba(9, 21, 48, 0.97);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 14px;
          box-shadow: 0 18px 34px rgba(0,0,0,0.28);
          backdrop-filter: blur(14px);
          z-index: 1500;
        }

        .nv-settings-title {
          font-size: 13px;
          font-weight: 800;
          color: #d7b15d;
          margin: 4px 0 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: "Segoe UI", system-ui, sans-serif;
        }

        .nv-settings-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
        }

        .nv-option-btn {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: white;
          border-radius: 16px;
          padding: 12px 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s ease;
        }

        .nv-option-btn:hover {
          background: rgba(255,255,255,0.09);
        }

        .nv-check {
          color: #d7b15d;
          font-weight: 900;
        }

        @media (max-width: 1000px) {
          .nv-links {
            display: none;
          }

          .nv-navbar {
            padding: 16px 14px 0;
          }

          .nv-logo-text {
            font-size: 22px;
          }
        }
      `}</style>

      <header className="nv-navbar">
        <div className="nv-inner">
          <Link to="/" className="nv-logo">
            <span>
              <img
                src={logoBlue}
                alt="logo"
                style={{ width: "34px", height: "34px", objectFit: "contain" }}
              />
            </span>
            <span className="nv-logo-text">Saheliq</span>
          </Link>

          <nav className="nv-links">
            <Link to="/" className={`nv-link ${isActive("/") ? "active" : ""}`}>
              {t.home}
            </Link>
            <Link to="/about" className={`nv-link ${isActive("/about") ? "active" : ""}`}>
              {t.about}
            </Link>
            <Link to="/contact" className={`nv-link ${isActive("/contact") ? "active" : ""}`}>
              {t.contact}
            </Link>
            <Link to="/blog" className={`nv-link ${isActive("/blog") ? "active" : ""}`}>
              {t.blogs}
            </Link>
          </nav>

          <div className="nv-right">
            <button
              type="button"
              className="nv-settings-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title={t.settings}
            >
              ⚙️
            </button>

            {settingsOpen && (
              <div className="nv-settings-menu">
                <div className="nv-settings-title">{t.language}</div>
                <div className="nv-settings-group">
                  <button className="nv-option-btn" onClick={() => setLang("fr")}>
                    <span>🇫🇷 Français</span>
                    {lang === "fr" && <span className="nv-check">✓</span>}
                  </button>
                  <button className="nv-option-btn" onClick={() => setLang("en")}>
                    <span>🇬🇧 English</span>
                    {lang === "en" && <span className="nv-check">✓</span>}
                  </button>
                  <button className="nv-option-btn" onClick={() => setLang("ar")}>
                    <span>🇩🇿 العربية</span>
                    {lang === "ar" && <span className="nv-check">✓</span>}
                  </button>
                </div>

                <div className="nv-settings-title">{t.appearance}</div>
                <div className="nv-settings-group">
                  <button className="nv-option-btn" onClick={() => setTheme("light")}>
                    <span>☀️ {t.light}</span>
                    {theme === "light" && <span className="nv-check">✓</span>}
                  </button>
                  <button className="nv-option-btn" onClick={() => setTheme("dark")}>
                    <span>🌙 {t.dark}</span>
                    {theme === "dark" && <span className="nv-check">✓</span>}
                  </button>
                </div>
              </div>
            )}

            <Link to="/login" className="nv-login">
              {t.login}
            </Link>
            <Link to="/register" className="nv-register">
              {t.register}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default NavbarPublic;