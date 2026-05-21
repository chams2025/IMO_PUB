import React from "react";
import "../styles/ServiceArticle.css";

export default function ConseilsImmobiliers() {
  return (
    <main className="service-article-page">
      <section className="service-article-hero conseils">
        <span>Accompagnement premium</span>
        <h1>Conseils Immobiliers</h1>
        <p>Des conseils simples pour acheter, vendre ou investir avec plus de confiance.</p>
      </section>

      <section className="service-article-card">
        <h2>Un accompagnement à chaque étape</h2>
        <p>
          Nous vous aidons à mieux comprendre le marché, éviter les erreurs fréquentes
          et prendre des décisions adaptées à votre budget et à vos objectifs.
        </p>

        <div className="service-points">
          <div><b>01</b><span>Choisir le bon quartier</span></div>
          <div><b>02</b><span>Vérifier les documents importants</span></div>
          <div><b>03</b><span>Négocier avec méthode</span></div>
        </div>
      </section>
    </main>
  );
}