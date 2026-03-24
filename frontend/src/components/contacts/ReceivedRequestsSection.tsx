import type { Friendship } from "../../pages/Contacts";
import UserAvatar from "../UserAvatar";
import s from "./ReceivedRequestsSection.module.css";

type Props = {
  receivedRequests: Friendship[];
  loadingRequests: boolean;
  requestsError: string;
  onRespond: (friendshipId: number, friendshipStatus: "accepted" | "rejected") => void;
};

export default function ReceivedRequestsSection({
  receivedRequests,
  loadingRequests,
  requestsError,
  onRespond,
}: Props) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>Erhaltene Friendship Requests</h2>

      {loadingRequests && <p className={s.message}>Lade Requests...</p>}
      {requestsError && <p className={s.error}>{requestsError}</p>}

      {!loadingRequests && !requestsError && receivedRequests.length === 0 && (
        <p className={s.message}>Keine offenen Requests vorhanden.</p>
      )}

      {!loadingRequests && !requestsError && receivedRequests.length > 0 && (
        <ul className={s.list}>
          {receivedRequests.map((request) => (
            <li key={request.id} className={s.card}>
              <div className={s.cardContent}>
                <UserAvatar
                  src={request.requester.avatar_url}
                  alt={request.requester.username}
                  className={s.avatar}
                />

                <div>
                  <h3 className={s.username}>{request.requester.username}</h3>
                  <p className={s.meta}>{request.requester.email}</p>
                  <p className={s.meta}>Status: {request.requester.status}</p>
                </div>
              </div>

              <div className={s.buttonRow}>
                <button
                  className={s.primaryButton}
                  onClick={() => onRespond(request.id, "accepted")}
                >
                  Annehmen
                </button>
                <button
                  className={s.secondaryButton}
                  onClick={() => onRespond(request.id, "rejected")}
                >
                  Ablehnen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
