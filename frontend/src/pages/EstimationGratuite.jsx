import React from "react";
import "../styles/ServiceArticle.css";

export default function EstimationGratuite() {
  return (
    <main className="service-article-page">
      <section className="service-article-hero estimation">
        <span>Service immobilier</span>
        <h1>Estimation Gratuite</h1>
        <p>Estimez la valeur de votre bien avec une méthode claire, rapide et fiable.</p>
      </section>

      <section className="service-article-card">
        <h2>Pourquoi estimer votre bien ?</h2>
        <p>
          Une bonne estimation vous aide à fixer un prix réaliste, attirer des acheteurs sérieux
          et vendre plus rapidement sans sous-évaluer votre propriété.
        </p>

        <div className="service-points">
          <div><b>01</b><span>Analyse du marché local</span></div>
          <div><b>02</b><span>Comparaison avec des biens similaires</span></div>
          <div><b>03</b><span>Prix conseillé selon l’état du bien</span></div>
        </div>
      </section>
    </main>
  );
}