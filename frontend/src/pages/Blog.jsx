import React from "react";
import { Link } from "react-router-dom";
import "../styles/Blog.css";

import heroBg from "../assets/8.jpg"; // راهي موجودة عندك
import featuredImg from "../assets/1.jpg";

import articleImg1 from "../assets/2.jpg";
import articleImg2 from "../assets/3.jpg";
import articleImg3 from "../assets/4.jpg";
function Blog() {
  const categories = [
    "Achat",
    "Vente",
    "Investissement",
    "Conseils",
    "Marché immobilier",
  ];

  const featuredPost = {
    title: "Comment réussir son premier achat immobilier en toute sérénité",
    excerpt:
      "Découvrez les étapes essentielles pour acheter votre premier bien immobilier, éviter les erreurs fréquentes et avancer avec confiance dans votre projet.",
    image: featuredImg,
    category: "Achat",
    date: "15 Avril 2026",
    author: "Équipe Immo",
  };

  const posts = [
    {
      id: 1,
      title: "5 conseils pour vendre votre bien plus rapidement",
      excerpt:
        "Mettez toutes les chances de votre côté grâce à une présentation soignée, un bon prix et une stratégie de mise en valeur efficace.",
      image: articleImg1,
      category: "Vente",
      date: "10 Avril 2026",
    },
    {
      id: 2,
      title: "Pourquoi investir dans l’immobilier reste une valeur sûre",
      excerpt:
        "L’immobilier continue d’attirer les investisseurs grâce à sa stabilité, son potentiel de rentabilité et ses opportunités à long terme.",
      image: articleImg2,
      category: "Investissement",
      date: "08 Avril 2026",
    },
    {
      id: 3,
      title: "Comment estimer correctement la valeur de votre maison",
      excerpt:
        "Une estimation réaliste permet de vendre plus vite et dans de meilleures conditions. Voici les critères à prendre en compte.",
      image: articleImg3,
      category: "Conseils",
      date: "04 Avril 2026",
    },
    {
      id: 4,
      title: "Les tendances du marché immobilier à suivre cette année",
      excerpt:
        "Prix, demande, zones attractives et nouveaux comportements d’achat : tour d’horizon des évolutions du marché immobilier.",
      image: articleImg1,
      category: "Marché immobilier",
      date: "01 Avril 2026",
    },
    {
      id: 5,
      title: "Acheter un appartement ou une maison : que choisir ?",
      excerpt:
        "Chaque option a ses avantages. Comparez vos besoins, votre budget et votre mode de vie avant de prendre votre décision.",
      image: articleImg2,
      category: "Achat",
      date: "28 Mars 2026",
    },
    {
      id: 6,
      title: "Les erreurs à éviter avant de mettre un bien en vente",
      excerpt:
        "Photos de mauvaise qualité, prix mal positionné ou annonce incomplète : voici les erreurs qui freinent une vente immobilière.",
      image: articleImg3,
      category: "Vente",
      date: "25 Mars 2026",
    },
  ];

  return (
    <div className="blog-page">
      <section
        className="blog-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 22, 39, 0.74), rgba(10, 22, 39, 0.74)), url(${heroBg})`,
        }}
      >
        <div className="blog-shell">
          <div className="blog-hero-content">
            <span className="blog-kicker">Actualités & conseils immobiliers</span>
            <h1>
              Le blog qui vous guide pour
              <span> acheter, vendre et investir</span>
            </h1>
            <p>
              Retrouvez des conseils pratiques, des analyses du marché immobilier
              et des astuces pour réussir chaque étape de votre projet.
            </p>
          </div>
        </div>
      </section>

      <section className="blog-categories">
        <div className="blog-shell">
          <div className="categories-wrap">
            {categories.map((item) => (
              <button key={item} className="category-chip">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-featured">
        <div className="blog-shell">
          <div className="section-head">
            <span className="section-line" />
            <h2>Article à la une</h2>
            <span className="section-line" />
          </div>

          <article className="featured-card">
            <div className="featured-image-wrap">
              <img src={featuredPost.image} alt={featuredPost.title} />
            </div>

            <div className="featured-content">
              <span className="post-badge">{featuredPost.category}</span>
              <p className="post-meta">
                {featuredPost.date} • {featuredPost.author}
              </p>
              <h3>{featuredPost.title}</h3>
              <p>{featuredPost.excerpt}</p>
      <Link to="/article/1" className="gold-btn">
  Lire l'article
</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="blog-posts">
        <div className="blog-shell">
          <div className="section-head">
            <span className="section-line" />
            <h2>Nos derniers articles</h2>
            <span className="section-line" />
          </div>

          <div className="blog-grid">
            {posts.map((post) => (
              <article className="blog-card" key={post.id}>
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} />
                  <Link to={`/article/${post.id}`} className="text-link">
  Lire plus
</Link>
                </div>

                <div className="blog-card-body">
                  <span className="post-badge">{post.category}</span>
                  <p className="post-meta">{post.date}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-newsletter">
        <div className="blog-shell">
          <div className="newsletter-box">
            <span className="section-tag">Newsletter</span>
            <h2>Recevez nos meilleurs conseils immobiliers</h2>
            <p>
              Abonnez-vous pour rester informé des nouvelles tendances, astuces
              et opportunités du marché immobilier.
            </p>

            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Entrez votre adresse email"
              />
              <button type="submit" className="gold-btn">
                S’abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Blog;