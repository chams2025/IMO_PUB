import { useEffect, useState } from "react";
import api from "../api";
import { getApiError } from "../utils/apiError";
import AdminShell from "../components/AdminShell";
import SuperAdminShell from "../components/SuperAdminShell";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminPages.css";

export default function AdminContactMessages({ superAdmin = false }) {
  const { t } = useI18n();
  const Shell = superAdmin ? SuperAdminShell : AdminShell;
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/admin/contact-messages/");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await api.patch(`/admin/contact-messages/${selected.id}/`, {
        reply,
        is_read: true,
      });
      setSuccess(t("replySaved"));
      setReply("");
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <Shell title={t("adminContactTitle")} subtitle={t("adminContactSubtitle")}>
      <div className="admin-page">
        <h1>{t("adminContactTitle")}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="admin-split">
          <ul className="admin-list">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setSelected(m)}>
                  {m.nom} - {m.sujet || m.type_projet}
                  {!m.is_read && <span className="badge">new</span>}
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <div className="admin-detail">
              <p>
                <b>{selected.nom}</b> ({selected.email})
              </p>
              <p>{selected.message}</p>
              {selected.reply && <p className="reply">Reponse: {selected.reply}</p>}
              <form onSubmit={sendReply}>
                <textarea
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Votre reponse"
                />
                <button type="submit" className="gold-btn">
                  {t("send")}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
