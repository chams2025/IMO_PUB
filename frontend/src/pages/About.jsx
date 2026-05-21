import React from "react";
import { Link } from "react-router-dom";
import "../styles/About.css";

import heroBg from "../assets/12.jpg";
import introImg from "../assets/11.jpg";
import villaImg from "../assets/dar.png";
import galleryImg1 from "../assets/1.jpg";
import galleryImg2 from "../assets/2.jpg";
import galleryImg3 from "../assets/3.jpg";
import galleryImg4 from "../assets/4.jpg";

function About() {
  const stats = [
    { value: "500+", label: "Biens accompagnés" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "10+", label: "Années d’expertise" },
    { value: "24/7", label: "Accompagnement" },
  ];

  const process = [
    {
      number: "01",
      title: "Analyse du besoin",
      text: "Nous définissons vos objectifs, votre budget et le type de bien recherché.",
    },
    {
      number: "02",
      title: "Sélection & présentation",
      text: "Nous mettons en avant les meilleures opportunités dans un cadre visuel premium.",
    },
    {
      number: "03",
      title: "Accompagnement final",
      text: "Nous restons à vos côtés jusqu’à la concrétisation complète du projet.",
    },
  ];

  return (
    <div className="about-page">
      <section
        className="about-hero"
        style={{
        backgroundImage: `linear-gradient(rgba(9, 20, 34, 0.76), rgba(9, 20, 34, 0.72)), url(${heroBg})`,
        }}
      >
        <div className="about-shell">
          <div className="about-hero-grid">
            <div className="about-hero-content">
              <span className="about-kicker">À propos</span>
              <h1>
                Une vision plus élégante
                <span> de l’immobilier moderne</span>
              </h1>
              <p>
                Une plateforme immobilière pensée pour offrir une expérience plus
                fluide, plus rassurante et plus premium.
              </p>

              <div className="about-hero-actions">
                <Link to="/#annonces" className="gold-btn">
                  Explorer les annonces
                </Link>
                <Link to="/contact" className="outline-light-btn">
                  Nous contacter
                </Link>
              </div>
            </div>

            <div className="about-hero-panel">
              <span className="panel-badge">Signature de marque</span>
              <h3>Un positionnement premium et professionnel</h3>
              <div className="about-mini-stats">
                <div className="mini-stat">
                  <strong>500+</strong>
                  <span>Biens accompagnés</span>
                </div>
                <div className="mini-stat">
                  <strong>98%</strong>
                  <span>Clients satisfaits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-dark-intro">
        <div className="about-shell">
          <div className="about-intro-grid">
            <div className="about-intro-copy">
              <span className="section-tag light-tag">Notre identité</span>
              <h2>Plus qu’une simple vitrine immobilière</h2>
              <span className="intro-divider"></span>

              <p>
                Nous avons imaginé une plateforme capable de valoriser les biens,
                de simplifier la recherche et de renforcer la confiance entre
                vendeurs, acheteurs et investisseurs.
              </p>

              <p>
                Notre objectif est de proposer une expérience plus élégante,
                plus claire et plus professionnelle pour mettre en avant chaque
                propriété avec une vraie image premium.
              </p>

              <div className="intro-mini-grid">
                <div className="intro-mini-card">
                  <strong>Design premium</strong>
                  <span>Une présentation moderne et raffinée pour chaque bien.</span>
                </div>

                <div className="intro-mini-card">
                  <strong>Confiance client</strong>
                  <span>Une expérience plus fluide, lisible et rassurante.</span>
                </div>
              </div>

              <div className="intro-trust-row">
                <div className="trust-item">
                  <strong>500+</strong>
                  <span>Biens valorisés</span>
                </div>
                <div className="trust-item">
                  <strong>98%</strong>
                  <span>Satisfaction</span>
                </div>
                <div className="trust-item">
                  <strong>Premium</strong>
                  <span>Image de marque</span>
                </div>
              </div>
            </div>

            <div className="about-ambition-card">
              <img src={villaImg} alt="Villa premium" />
              <div className="about-ambition-overlay">
                <h3>Notre ambition</h3>
                <p>Créer une plateforme premium, moderne et professionnelle.</p>
              </div>
            </div>
          </div>

          <div className="about-stats-grid">
            {stats.map((item) => (
              <div className="about-stat-card" key={item.label}>
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-showcase">
        <div className="about-shell">
          <div className="about-showcase-grid">
            <div className="about-gallery">
              <img src={galleryImg1} alt="Salon moderne 1" />
              <img src={galleryImg2} alt="Salon moderne 2" />
              <img src={galleryImg3} alt="Salon moderne 3" />
              <img src={galleryImg4} alt="Salon moderne 4" />
            </div>

            <div className="about-showcase-content">
              <span className="section-tag">Pourquoi nous choisir</span>
              <h2>Une expérience pensée pour inspirer confiance</h2>
              <p>
                Nous offrons une interface plus raffinée, une navigation plus
                claire et une mise en valeur premium de chaque bien immobilier.
              </p>
              <p>
                Notre objectif est de créer une vraie image de sérieux avec un
                design mature, professionnel et élégant.
              </p>

              <div className="about-highlight-box">
                <strong>Approche premium</strong>
                <p>Un design plus mature, plus structuré et plus professionnel.</p>
              </div>
            </div>
          </div>

          <div className="about-feature-banner">
            <img src={introImg} alt="Intérieur élégant" />
          </div>
        </div>
      </section>

      <section className="about-process">
        <div className="about-shell">
          <div className="section-head">
            <span className="section-line" />
            <h2>Notre méthode</h2>
            <span className="section-line" />
          </div>

          <div className="about-process-grid">
            {process.map((item) => (
              <article className="process-card" key={item.number}>
                <span className="process-step">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-shell">
          <div className="about-cta-box">
            <h2>Prêt à avancer avec une expérience premium ?</h2>
            <p>
              Découvrez nos annonces et profitez d’une plateforme pensée pour
              inspirer confiance dès le premier regard.
            </p>

            <div className="about-hero-actions center-actions">
              <Link to="/#annonces" className="gold-btn">
                Voir les biens
              </Link>
              <Link to="/contact" className="outline-light-btn">
                Demander un accompagnement
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;