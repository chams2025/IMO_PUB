import React from "react";
import "../styles/MiniArticle.css";

export default function LocationLogement() {
  return (
    <main className="mini-article-page">
      <section className="mini-hero location">
        <span>Guide location</span>
        <h1>Location de Logement</h1>
        <p>Trouvez le logement idéal selon votre budget et vos besoins.</p>
      </section>

      <section className="mini-content">
        <article>
          <h2>Bien choisir une location</h2>
          <p>
            Avant de louer, vérifiez l’état du logement, la localisation, le prix,
            les charges et les conditions du contrat.
          </p>

          <h3>À vérifier</h3>
          <ul>
            <li>Le quartier et les transports.</li>
            <li>L’état général du logement.</li>
            <li>Le montant du loyer et des charges.</li>
            <li>Les conditions du bail.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}