import React from "react";
import "../styles/ArticlePage.css";
import articleImg from "../assets/1.jpg";

export default function ArticlePage() {
  return (
    <main className="article-page">
      
      {/* HERO */}
      <section className="article-hero">
        <div className="article-hero-content">
          <span>15 Avril 2026 • Équipe Immo</span>
          <h1>
            Comment réussir son premier achat immobilier en toute sérénité
          </h1>
          <p>
            Découvrez les étapes essentielles pour acheter votre premier bien immobilier,
            éviter les erreurs fréquentes et avancer avec confiance.
          </p>
        </div>
      </section>

      {/* IMAGE */}
      <div className="article-image-wrap">
        <img src={articleImg} alt="article" />
      </div>

      {/* CONTENT */}
      <section className="article-content">
        <h2>1. Définir votre budget</h2>
        <p>
          Avant toute chose, il est essentiel de connaître votre capacité financière.
          Prenez en compte vos revenus, vos charges et votre apport personnel.
        </p>

        <h2>2. Choisir le bon emplacement</h2>
        <p>
          L’emplacement est un facteur clé dans la valeur d’un bien immobilier.
          Privilégiez les zones bien desservies et proches des commodités.
        </p>

        <h2>3. Comparer plusieurs biens</h2>
        <p>
          Ne vous précipitez pas. Comparez plusieurs annonces afin de faire
          un choix éclairé et adapté à vos besoins.
        </p>

        <h2>4. Vérifier les documents</h2>
        <p>
          Assurez-vous que tous les documents administratifs sont en règle :
          titre de propriété, permis, conformité, etc.
        </p>

        <blockquote>
          Un bon achat immobilier est un équilibre entre budget, emplacement et vision à long terme.
        </blockquote>

        <h2>Conclusion</h2>
        <p>
          Acheter un bien immobilier est une étape importante. Avec une bonne préparation
          et les bons conseils, vous pouvez réussir votre projet en toute sérénité.
        </p>
      </section>
    </main>
  );
}