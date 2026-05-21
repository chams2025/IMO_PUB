import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { getApiError } from "../utils/apiError";
import "../styles/Contact.css";
import contactHero from "../assets/9.jpg";
import contactImage from "../assets/2.jpg";

function Contact() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    type_projet: "Achat immobilier",
    sujet: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/contact/", form);
      setSuccess("Message envoye. Nous vous repondrons rapidement.");
      setForm({
        nom: "",
        email: "",
        telephone: "",
        type_projet: "Achat immobilier",
        sujet: "",
        message: "",
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section
        className="contact-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 22, 39, 0.74), rgba(10, 22, 39, 0.74)), url(${contactHero})`,
        }}
      >
        <div className="contact-shell">
          <div className="contact-hero-content">
            <span className="contact-kicker">Contactez-nous</span>
            <h1>
              Parlons de votre
              <span> projet immobilier</span>
            </h1>
            <p>
              Que vous souhaitiez acheter, vendre ou obtenir un accompagnement,
              notre équipe est à votre écoute pour vous aider à concrétiser
              votre projet dans les meilleures conditions.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-shell">
          <div className="contact-grid">
            <div className="contact-info-card">
              <span className="section-tag">Nos coordonnées</span>
              <h2>Restons en contact</h2>
              <p>
                Nous vous accompagnons dans toutes les étapes de votre projet
                immobilier avec une approche humaine, moderne et efficace.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h4>Adresse</h4>
                    <p>Alger, Algérie</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h4>Téléphone</h4>
                    <p>+213 555 00 00 00</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <h4>Email</h4>
                    <p>contact@immoagency.com</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">🕒</div>
                  <div>
                    <h4>Horaires</h4>
                    <p>Lun - Sam : 09h00 - 18h00</p>
                  </div>
                </div>
              </div>

              <div className="contact-image-wrap">
                <img src={contactImage} alt="Contact immobilier" />
              </div>
            </div>

            <div className="contact-form-card">
              <span className="section-tag">Envoyer un message</span>
              <h2>Nous écrire</h2>
              <p>
                Remplissez le formulaire ci-dessous et nous vous répondrons dans
                les plus brefs délais.
              </p>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input name="nom" type="text" value={form.nom} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Téléphone</label>
                    <input name="telephone" type="text" value={form.telephone} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Type de projet</label>
                    <select name="type_projet" value={form.type_projet} onChange={handleChange}>
                      <option>Achat immobilier</option>
                      <option>Vente de bien</option>
                      <option>Investissement</option>
                      <option>Conseil immobilier</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sujet</label>
                  <input name="sujet" type="text" value={form.sujet} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" rows="6" value={form.message} onChange={handleChange} required />
                </div>

                <button type="submit" className="gold-btn" disabled={loading}>
                  {loading ? "Envoi..." : "Envoyer le message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="contact-shell">
          <div className="contact-cta-box">
            <h2>Vous cherchez un bien ou souhaitez vendre rapidement ?</h2>
            <p>
              Découvrez nos annonces et bénéficiez d’un accompagnement adapté à
              vos objectifs.
            </p>
            <div className="contact-cta-actions">
              <Link to="/#annonces" className="gold-btn">
                Voir les annonces
              </Link>
              <Link to="/about" className="outline-light-btn">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;