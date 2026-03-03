import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import s from "./ChatDetail.module.css";

type UserStatus = "online" | "offline";

type User = {
  id: number;
  username: string;
  email: string;
  status: UserStatus;
};

type Chat = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  created_at: string;
  updated_at: string;
  users: User[];
};

type Message = {
  id: number;
  content: string | null;
  message_type: "text" | "image" | "video" | "audio" | "file" | "system";
  created_at: string;
  updated_at: string;
  sender: User;
};

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadChat() {
      if (!id) return;

      setLoadingChat(true);
      setError("");

      try {
        const data = await apiRequest<Chat>(`/chats/${id}`, {
          method: "GET",
        });

        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat konnte nicht geladen werden");
      } finally {
        setLoadingChat(false);
      }
    }

    void loadChat();
  }, [id]);

  useEffect(() => {
    async function loadMessages() {
      if (!id) return;

      setLoadingMessages(true);
      setError("");

      try {
        const data = await apiRequest<Message[]>(`/chats/${id}/messages`, {
          method: "GET",
        });

        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nachrichten konnten nicht geladen werden");
      } finally {
        setLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatDisplayTitle = useMemo(() => {
    if (!chat) return "Chat";

    if (chat.chat_type === "group_chat") {
      return chat.title || "Gruppenchat";
    }

    const otherUser = chat.users.find((member) => member.id !== currentUser?.id);
    return otherUser?.username || "Direktchat";
  }, [chat, currentUser?.id]);

  async function handleSendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!id || sendingMessage) return;

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;

    setSendingMessage(true);
    setSendError("");

    try {
      const createdMessage = await apiRequest<Message>(`/chats/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: {
            message_type: "text",
            content: trimmedMessage,
          },
        }),
      });

      setMessages((prev) => [...prev, createdMessage]);
      setNewMessage("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Nachricht konnte nicht gesendet werden"
      );
    } finally {
      setSendingMessage(false);
    }
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    if (!newMessage.trim() || sendingMessage) return;

    void handleSendMessage();
  }

  return (
    <div className={s.wrapper}>
      <div className={s.topBar}>
        <Link to="/contacts" className={s.backLink}>
          ← Zurück zu Kontakte
        </Link>
      </div>

      {(loadingChat || loadingMessages) && <p className={s.message}>Lade Chat...</p>}
      {error && <p className={s.error}>{error}</p>}

      {!loadingChat && !error && chat && (
        <div className={s.chatLayout}>
          <header className={s.chatHeader}>
            <div>
              <h1 className={s.chatTitle}>{chatDisplayTitle}</h1>
              <p className={s.chatSubtitle}>
                {chat.chat_type === "group_chat"
                  ? `${chat.users.length} Mitglieder`
                  : "Direktchat"}
              </p>
            </div>
          </header>

          <section className={s.participantsCard}>
            <h2 className={s.participantsTitle}>Teilnehmer</h2>

            <ul className={s.participantsList}>
              {chat.users.map((member) => {
                const isMe = member.id === currentUser?.id;

                return (
                  <li key={member.id} className={s.participantItem}>
                    <div className={s.participantLeft}>
                      <span className={s.participantName}>
                        {member.username} {isMe ? "(du)" : ""}
                      </span>
                      <span className={s.participantEmail}>{member.email}</span>
                    </div>

                    <span
                      className={`${s.participantStatus} ${
                        member.status === "online" ? s.statusOnline : s.statusOffline
                      }`}
                      title={member.status}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={s.messagesSection}>
            {loadingMessages ? (
              <p className={s.message}>Lade Nachrichten...</p>
            ) : messages.length === 0 ? (
              <p className={s.emptyState}>Noch keine Nachrichten vorhanden.</p>
            ) : (
              <ul className={s.messageList}>
                {messages.map((message) => {
                  const isOwnMessage = message.sender.id === currentUser?.id;

                  return (
                    <li
                      key={message.id}
                      className={`${s.messageRow} ${isOwnMessage ? s.ownRow : s.otherRow}`}
                    >
                      <div
                        className={`${s.messageBubble} ${
                          isOwnMessage ? s.ownBubble : s.otherBubble
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className={s.messageSender}>{message.sender.username}</p>
                        )}

                        <p className={s.messageContent}>{message.content}</p>

                        <p className={s.messageMeta}>
                          {new Date(message.created_at).toLocaleString("de-DE")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div ref={messagesEndRef} />
          </section>

          <form className={s.messageForm} onSubmit={handleSendMessage}>
            <textarea
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder="Nachricht eingeben..."
              className={s.messageInput}
              maxLength={10000}
              disabled={sendingMessage}
              rows={3}
            />

            <button
              type="submit"
              className={s.sendButton}
              disabled={sendingMessage || !newMessage.trim()}
            >
              {sendingMessage ? "Sende..." : "Senden"}
            </button>
          </form>

          <p className={s.inputHint}>Enter = senden, Shift + Enter = Zeilenumbruch</p>

          {sendError && <p className={s.error}>{sendError}</p>}
        </div>
      )}
    </div>
  );
}
