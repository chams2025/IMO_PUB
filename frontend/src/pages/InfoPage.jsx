import { Link } from "react-router-dom";
import "../styles/ServiceArticle.css";

const PAGES = {
  faq: {
    title: "FAQ",
    subtitle: "Questions fréquentes sur Saheliq",
    sections: [
      {
        heading: "Comment publier une annonce ?",
        body: "Créez un compte, connectez-vous puis utilisez le bouton « Publier » pour déposer votre bien.",
      },
      {
        heading: "L’estimation est-elle gratuite ?",
        body: "Oui, notre service d’estimation gratuite vous aide à fixer un prix cohérent avec le marché.",
      },
      {
        heading: "Comment contacter un vendeur ?",
        body: "Ouvrez une annonce et utilisez la messagerie ou le formulaire de contact associé au bien.",
      },
    ],
  },
  help: {
    title: "Aide & support",
    subtitle: "Nous sommes là pour vous accompagner",
    sections: [
      {
        heading: "Support technique",
        body: "En cas de problème de connexion ou d’affichage, vérifiez que le serveur backend est démarré et réessayez.",
      },
      {
        heading: "Compte utilisateur",
        body: "Pour réinitialiser votre mot de passe ou modifier votre profil, connectez-vous à votre espace personnel.",
      },
      {
        heading: "Nous écrire",
        body: "Rendez-vous sur la page Contact pour envoyer votre demande à notre équipe.",
      },
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    subtitle: "Protection de vos données personnelles",
    sections: [
      {
        heading: "Données collectées",
        body: "Nous collectons uniquement les informations nécessaires à la création de compte, à la publication d’annonces et à la messagerie.",
      },
      {
        heading: "Utilisation",
        body: "Vos données servent à faire fonctionner la plateforme et ne sont pas vendues à des tiers.",
      },
      {
        heading: "Vos droits",
        body: "Vous pouvez demander la suppression de votre compte depuis votre espace utilisateur.",
      },
    ],
  },
  terms: {
    title: "Conditions d’utilisation",
    subtitle: "Règles d’usage de la plateforme Saheliq",
    sections: [
      {
        heading: "Comportement",
        body: "Les annonces doivent être exactes, respectueuses et conformes à la réglementation en vigueur.",
      },
      {
        heading: "Responsabilité",
        body: "Saheliq met en relation acheteurs et vendeurs ; les transactions restent sous la responsabilité des parties.",
      },
      {
        heading: "Modération",
        body: "Les administrateurs peuvent retirer tout contenu non conforme aux présentes conditions.",
      },
    ],
  },
};

export default function InfoPage({ slug }) {
  const page = PAGES[slug];
  if (!page) return null;

  return (
    <main className="service-article-page">
      <section className="service-article-hero">
        <span>Saheliq</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </section>

      <section className="service-article-card">
        {page.sections.map((section) => (
          <article key={section.heading} style={{ marginBottom: "1.5rem" }}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
        <Link to="/contact" className="gold-btn" style={{ display: "inline-block", marginTop: "1rem" }}>
          Nous contacter
        </Link>
      </section>
    </main>
  );
}
