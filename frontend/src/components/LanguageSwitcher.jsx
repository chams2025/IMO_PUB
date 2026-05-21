import { useI18n } from "../i18n/I18nContext";
import "../styles/LanguageSwitcher.css";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={`lang-switcher ${className}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={lang === code ? "active" : ""}
          onClick={() => setLang(code)}
          aria-label={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
