import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api";
import { getApiError } from "../utils/apiError";
import ConfirmModal from "../components/ConfirmModal";
import { useI18n } from "../i18n/I18nContext";
import "../styles/MesMessages.css";

export default function MesMessages() {
  const { t } = useI18n();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const pollRef = useRef(null);
  const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/chat/conversations/");
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const { data } = await api.get(`/chat/conversations/${convId}/`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err));
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    pollRef.current = setInterval(() => loadMessages(activeId), 5000);
    return () => clearInterval(pollRef.current);
  }, [activeId, loadMessages]);

  const activeConv = conversations.find((c) => c.conversation_id === activeId);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv) return;
    try {
      await api.post("/chat/send/", {
        receiver_id: activeConv.with_user_id,
        content: draft.trim(),
      });
      setDraft("");
      await loadMessages(activeId);
      await loadConversations();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDeleteMessage = (msgId) => {
    setConfirm({
      title: t("delete"),
      message: "Êtes-vous sûr de vouloir supprimer ce message ?",
      onConfirm: async () => {
        try {
          await api.delete(`/chat/messages/${msgId}/delete/`);
          await loadMessages(activeId);
        } catch (err) {
          setError(getApiError(err));
        }
        setConfirm(null);
      },
    });
  };

  const handleDeleteChat = () => {
    if (!activeId) return;
    setConfirm({
      title: t("delete"),
      message: "Êtes-vous sûr de vouloir supprimer cette conversation ?",
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/chat/conversations/${activeId}/delete/`);
          setActiveId(null);
          setMessages([]);
          await loadConversations();
        } catch (err) {
          setError(getApiError(err));
        }
        setConfirm(null);
      },
    });
  };

  return (
    <div className="chat-page">
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <h2>{t("messages")}</h2>
          {loading && <p>{t("loading")}</p>}
          {error && <div className="alert alert-error">{error}</div>}
          <ul className="chat-conv-list">
            {conversations.map((c) => (
              <li key={c.conversation_id}>
                <button
                  type="button"
                  className={activeId === c.conversation_id ? "active" : ""}
                  onClick={() => setActiveId(c.conversation_id)}
                >
                  <strong>{c.with_user_username}</strong>
                  <span>{c.last_message?.slice(0, 40) || "—"}</span>
                  {c.unread_count > 0 && (
                    <em className="chat-badge">{c.unread_count}</em>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat-main">
          {!activeConv ? (
            <p className="chat-empty">Sélectionnez une conversation</p>
          ) : (
            <>
              <header className="chat-header">
                <h3>{activeConv.with_user_username}</h3>
                <button type="button" className="outline-btn" onClick={handleDeleteChat}>
                  {t("delete")} chat
                </button>
              </header>
              <div className="chat-messages">
                {messages.map((msg) => {
                  const mine = msg.sender_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble-wrap ${mine ? "mine" : "theirs"}`}
                    >
                      <div className={`chat-bubble ${mine ? "mine" : "theirs"}`}>
                        <p>{msg.content}</p>
                        <small>{new Date(msg.created_at).toLocaleString()}</small>
                      </div>
                      {mine && (
                        <button
                          type="button"
                          className="chat-del-msg"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <form className="chat-compose" onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Votre message…"
                />
                <button type="submit" className="gold-btn">
                  {t("send")}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
