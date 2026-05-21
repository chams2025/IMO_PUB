import React from "react";
import "../styles/MiniArticle.css";

export default function VenteProprietes() {
  return (
    <main className="mini-article-page">
      <section className="mini-hero vente">
        <span>Conseils vendeur</span>
        <h1>Vente de Propriétés</h1>
        <p>Apprenez comment valoriser votre bien et vendre plus rapidement.</p>
      </section>

      <section className="mini-content">
        <article>
          <h2>Vendre efficacement</h2>
          <p>
            Une annonce claire, des photos propres et un prix réaliste augmentent
            fortement vos chances de trouver un acheteur sérieux.
          </p>

          <h3>Nos conseils</h3>
          <ul>
            <li>Publier des photos lumineuses.</li>
            <li>Écrire une description complète.</li>
            <li>Mettre un prix cohérent avec le marché.</li>
            <li>Répondre vite aux messages.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}