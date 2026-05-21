import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import logoGold from "../assets/logo-gold.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="brand">
            <div className="brand-row">
              <img
                src={logoGold}
                alt="Saheliq Logo"
                className="footer-logo"
              />
            </div>

            <p className="trouvez">
              Trouvez, vendez et louez en toute confiance avec une expérience
              immobilière moderne et élégante.
            </p>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/about">À propos</Link></li>
              <li><Link to="/#annonces">Biens</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/help">Help & Support</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Follow Us</h3>

            <div className="socials">
              <a href="https://facebook.com/" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
                <FaLinkedinIn />
              </a>
            </div>

            <div className="contact-list">
              <div className="contact-item">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div>contact@saheliq.com</div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <FaPhoneAlt />
                </div>
                <div>+213 XXX XX XX XX</div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2025 Saheliq Algeria — All rights reserved</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
