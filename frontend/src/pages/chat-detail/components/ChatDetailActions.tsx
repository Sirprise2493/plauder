import { Link } from "react-router-dom";
import UserAvatar from "../../../components/UserAvatar";
import type { User } from "../types";

type Props = {
  contactsPath: string;
  isGroupChat: boolean;
  availableFriends: User[];
  memberSearch: string;
  loadingFriends: boolean;
  addingMemberId: number | null;
  leavingChat: boolean;
  membershipMessage: string;
  membershipError: string;
  onMemberSearchChange: (value: string) => void;
  onAddMember: (userId: number) => void | Promise<void>;
  onLeaveChat: () => void | Promise<void>;
  classNames: {
    container: string;
    secondaryButton: string;
    dangerButton: string;
    addMembersCard: string;
    searchInput: string;
    friendsList: string;
    friendItem: string;
    friendLeft: string;
    friendAvatar: string;
    friendName: string;
    inlineInfo: string;
    inlineError: string;
  };
};

export default function ChatDetailActions({
  contactsPath,
  isGroupChat,
  availableFriends,
  memberSearch,
  loadingFriends,
  addingMemberId,
  leavingChat,
  membershipMessage,
  membershipError,
  onMemberSearchChange,
  onAddMember,
  onLeaveChat,
  classNames,
}: Props) {
  return (
    <>
      <div className={classNames.container}>
        <Link to={contactsPath} className={classNames.secondaryButton}>
          Kontakte
        </Link>

        {isGroupChat && (
          <button
            type="button"
            className={classNames.dangerButton}
            onClick={() => void onLeaveChat()}
            disabled={leavingChat}
          >
            {leavingChat ? "Verlasse..." : "Gruppenchat verlassen"}
          </button>
        )}
      </div>

      {isGroupChat && (
        <section className={classNames.addMembersCard}>
          <h2>Freunde hinzufügen</h2>

          <input
            type="text"
            value={memberSearch}
            onChange={(event) => onMemberSearchChange(event.target.value)}
            placeholder="Freund suchen..."
            className={classNames.searchInput}
          />

          {membershipMessage && (
            <p className={classNames.inlineInfo}>{membershipMessage}</p>
          )}

          {membershipError && (
            <p className={classNames.inlineError}>{membershipError}</p>
          )}

          {loadingFriends ? (
            <p className={classNames.inlineInfo}>Freunde werden geladen...</p>
          ) : availableFriends.length === 0 ? (
            <p className={classNames.inlineInfo}>Keine Freunde zum Hinzufügen gefunden.</p>
          ) : (
            <div className={classNames.friendsList}>
              {availableFriends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  className={classNames.friendItem}
                  onClick={() => void onAddMember(friend.id)}
                  disabled={addingMemberId === friend.id}
                >
                  <span className={classNames.friendLeft}>
                    <UserAvatar
                      src={friend.avatar_url}
                      alt={friend.username}
                      className={classNames.friendAvatar}
                    />
                    <span className={classNames.friendName}>{friend.username}</span>
                  </span>

                  <span>
                    {addingMemberId === friend.id ? "Füge hinzu..." : "Hinzufügen"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
