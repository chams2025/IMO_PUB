import React from "react";
import "../styles/ServiceArticle.css";

export default function GestionLocative() {
  return (
    <main className="service-article-page">
      <section className="service-article-hero gestion">
        <span>Gestion & location</span>
        <h1>Gestion Locative</h1>
        <p>Confiez la gestion de vos biens pour gagner du temps et louer sereinement.</p>
      </section>

      <section className="service-article-card">
        <h2>Une gestion plus simple</h2>
        <p>
          La gestion locative permet de suivre les loyers, les locataires, les visites
          et les démarches administratives avec plus d’organisation.
        </p>

        <div className="service-points">
          <div><b>01</b><span>Recherche de locataires sérieux</span></div>
          <div><b>02</b><span>Suivi des loyers et contrats</span></div>
          <div><b>03</b><span>Gestion des demandes et visites</span></div>
        </div>
      </section>
    </main>
  );
}