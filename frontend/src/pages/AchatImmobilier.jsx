import React from "react";
import "../styles/MiniArticle.css";

export default function AchatImmobilier() {
  return (
    <main className="mini-article-page">
      <section className="mini-hero achat">
        <span>Guide immobilier</span>
        <h1>Achat Immobilier</h1>
        <p>Découvrez les étapes essentielles pour acheter un bien en toute confiance.</p>
      </section>

      <section className="mini-content">
        <article>
          <h2>Bien préparer son achat</h2>
          <p>
            Acheter une maison ou un appartement demande une bonne préparation :
            budget, localisation, type de bien, documents et comparaison des offres.
          </p>

          <h3>Les étapes importantes</h3>
          <ul>
            <li>Définir votre budget réel.</li>
            <li>Choisir la ville ou le quartier.</li>
            <li>Comparer plusieurs annonces.</li>
            <li>Visiter le bien avant toute décision.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}