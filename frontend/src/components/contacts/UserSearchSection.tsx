import type { User } from "../../pages/Contacts";
import s from "./UserSearchSection.module.css";

type Props = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: User[];
  loadingSearch: boolean;
  searchError: string;
  onSendFriendRequest: (receiverId: number) => void;
};

export default function UserSearchSection({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  loadingSearch,
  searchError,
  onSendFriendRequest,
}: Props) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>User suchen</h2>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        placeholder="Nach Username oder E-Mail suchen..."
        className={s.input}
      />

      {loadingSearch && <p className={s.message}>Suche läuft...</p>}
      {searchError && <p className={s.error}>{searchError}</p>}

      {!loadingSearch && searchQuery.trim() && searchResults.length === 0 && !searchError && (
        <p className={s.message}>Keine passenden User gefunden.</p>
      )}

      {searchResults.length > 0 && (
        <ul className={s.list}>
          {searchResults.map((result) => (
            <li key={result.id} className={s.card}>
              <div>
                <h3 className={s.username}>{result.username}</h3>
                <p className={s.meta}>{result.email}</p>
                <p className={s.meta}>Status: {result.status}</p>
              </div>

              <button
                className={s.primaryButton}
                onClick={() => onSendFriendRequest(result.id)}
              >
                Anfrage senden
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
