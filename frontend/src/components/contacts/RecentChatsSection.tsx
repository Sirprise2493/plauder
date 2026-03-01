import type { RecentChat } from "../../pages/Contacts";
import s from "./RecentChatsSection.module.css";

type Props = {
  recentChats: RecentChat[];
  loadingChats: boolean;
  chatsError: string;
  onOpenChat: (chatId: number) => void;
};

export default function RecentChatsSection({
  recentChats,
  loadingChats,
  chatsError,
  onOpenChat,
}: Props) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>Letzte Chats</h2>

      {loadingChats && <p className={s.message}>Lade letzte Chats...</p>}
      {chatsError && <p className={s.error}>{chatsError}</p>}

      {!loadingChats && !chatsError && recentChats.length === 0 && (
        <p className={s.message}>Noch keine Chats vorhanden.</p>
      )}

      {!loadingChats && !chatsError && recentChats.length > 0 && (
        <ul className={s.list}>
          {recentChats.map((chat) => (
            <li
              key={chat.id}
              className={s.cardClickable}
              onClick={() => onOpenChat(chat.id)}
            >
              <div>
                <h3 className={s.username}>{chat.display_name ?? "Unbenannter Chat"}</h3>
                {chat.last_message ? (
                  <>
                    <p className={s.meta}>
                      <strong>{chat.last_message.sender.username}:</strong>{" "}
                      {chat.last_message.content ?? "Keine Nachricht"}
                    </p>
                    <p className={s.meta}>
                      {new Date(chat.last_message.created_at).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className={s.meta}>Keine Nachrichten vorhanden.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
