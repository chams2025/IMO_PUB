import { useEffect, useState } from "react";
import "../styles/Auth.css";

import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

import {
  Mail,
  Lock,
  Eye,
  User,
  ShieldCheck,
  Home,
  Headphones,
} from "lucide-react";

import img1 from "../assets/dar.png";
import img2 from "../assets/1.jpg";
import img3 from "../assets/2.jpg";

const images = [img1, img2, img3];

export default function AuthPage() {
  const navigate = useNavigate();
  useEffect(() => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
   if (user.is_staff || user.is_superuser) {
    localStorage.clear();
    setLoginError("Ce login est réservé aux utilisateurs seulement.");
    return;
  }

  navigate("/dashboard", { replace: true });
  }
}, []);

  const [isRegister, setIsRegister] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    console.log("LOGIN CLICKED", username, password);

    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await api.post("/login/", {
        username,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      localStorage.setItem("username", username);

      const profileRes = await api.get("/profile/");
      const user = profileRes.data;

      localStorage.setItem("user", JSON.stringify(user));

      if (user.is_superuser) {
        navigate("/super-admin-dashboard", { replace: true });
      } else if (user.is_staff) {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      setLoginError("Nom d’utilisateur ou mot de passe incorrect.");
    } finally {
      setLoginLoading(false);
    }
  };
      const handleRegister = async () => {
  setRegError("");

  if (!regUsername || !regEmail || !regPassword || !regPassword2) {
    setRegError("Veuillez remplir tous les champs.");
    return;
  }

  if (regPassword !== regPassword2) {
    setRegError("Les mots de passe ne correspondent pas.");
    return;
  }

  setRegLoading(true);

  try {
    await api.post("/register/", {
      username: regUsername,
      email: regEmail,
      password: regPassword,
      password2: regPassword2,
    });

    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegPassword2("");

    alert("Compte créé avec succès. Connectez-vous maintenant.");
    setIsRegister(false);

  } catch (error) {
    setRegError("Erreur lors de la création du compte.");

  } finally {
    setRegLoading(false);
  }
};
  

  return (
    <div className="auth-page">
      <div className={`auth-container ${isRegister ? "active" : ""}`}>
        <div
          className="image-side"
          style={{ backgroundImage: `url(${images[currentImage]})` }}
        >
          <div className="dark-layer"></div>

          <div className="image-text">
            <h2>
              Trouvez, achetez <br />
              et vendez en toute <br />
              <span>confiance</span>
            </h2>

            <p>
              Une plateforme immobilière moderne et élégante pour concrétiser
              vos projets en toute sérénité.
            </p>

            <div className="features">
              <div>
                <ShieldCheck />
                <span>Transactions sécurisées</span>
              </div>
              <div>
                <Home />
                <span>Annonces vérifiées</span>
              </div>
              <div>
                <Headphones />
                <span>Support dédié</span>
              </div>
            </div>
          </div>

          <div className="image-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={currentImage === index ? "dot active" : "dot"}
              ></span>
            ))}
          </div>
        </div>

        <div className="form-side">
          <div className="forms-wrapper">
            <form className="form login">
              <h2>
                Conn<span>exion</span>
              </h2>
              <div className="small-line"></div>
              <p>Connectez-vous avec votre nom d’utilisateur</p>

              <label>Nom d’utilisateur</label>
              <div className="input-box">
                <User size={19} />
                <input
                  type="text"
                  placeholder="Votre username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <label>Mot de passe</label>
              <div className="input-box">
                <Lock size={19} />
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Eye size={19} />
              </div>

              {loginError && <p className="auth-error">{loginError}</p>}

              <div className="options">
                <label className="check">
                  <input type="checkbox" /> Se souvenir de moi
                </label>
                <a href="#">Mot de passe oublié ?</a>
              </div>

              <button
                type="button"
                className="main-btn"
                disabled={loginLoading}
                onClick={handleLogin}
              >
                {loginLoading ? "Connexion..." : "Se connecter"}
              </button>

              <p className="change-text">
                Pas encore de compte ?
                <button type="button" onClick={() => setIsRegister(true)}>
                  S’inscrire
                </button>
              </p>
            </form>

            <form className="form register">
              <h2>
                Créer <span>compte</span>
              </h2>
              <div className="small-line"></div>
              <p>Rejoignez-nous et trouvez votre bien idéal</p>

              <label>Nom complet</label>
              <div className="input-box">
                <User size={19} />
                  <input type="text"
                    placeholder="Nom d'utilisateur"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                 />
              </div>

              <label>Email</label>
              <div className="input-box">
                <Mail size={19} />
                  <input type="email"
                  placeholder="votre@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  />
              </div>

              <label>Mot de passe</label>
              <div className="input-box">
                <Lock size={19} />
                <input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <Eye size={19} />
              </div>

              <label>Confirmer le mot de passe</label>
              <div className="input-box">
                <Lock size={19} />
                <input type="password"
                  placeholder="Confirmez votre mot de passe"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                />
                <Eye size={19} />
              </div>

              <label className="check terms">
                <input type="checkbox" />
                J’accepte les <a href="#"> conditions d’utilisation</a>
              </label>
              {regError && <p className="auth-error">  {regError}   </p>}    
                    <button type="button"
                      className="main-btn"
                      disabled={regLoading}
                      onClick={handleRegister}>
                    {regLoading ? "Création..." : "S’inscrire"}
                    </button>

              <p className="change-text">
                Déjà un compte ?
                <button type="button" onClick={() => setIsRegister(false)}>
                  Se connecter
                </button>
              </p>
            </form>
          </div>

          <div className="bottom-tabs">
            <button
              type="button"
              className={!isRegister ? "tab-active" : ""}
              onClick={() => setIsRegister(false)}
            >
              Connexion
            </button>

            <button
              type="button"
              className={isRegister ? "tab-active" : ""}
              onClick={() => setIsRegister(true)}
            >
              S’inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}