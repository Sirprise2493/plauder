import UserAvatar from "../../../components/UserAvatar";
import type { User } from "../types";

type Props = {
  users: User[];
  currentUserId?: number;
  showLeaveAction?: boolean;
  leavingChat?: boolean;
  onLeaveCurrentUser?: () => void | Promise<void>;
  classNames: {
    card: string;
    title: string;
    list: string;
    item: string;
    left: string;
    avatar: string;
    identity: string;
    name: string;
    email: string;
    status: string;
    statusOnline: string;
    statusOffline: string;
    actionWrap: string;
    leaveButton: string;
  };
};

export default function ParticipantsCard({
  users,
  currentUserId,
  showLeaveAction = false,
  leavingChat = false,
  onLeaveCurrentUser,
  classNames,
}: Props) {
  return (
    <section className={classNames.card}>
      <h2 className={classNames.title}>Teilnehmer</h2>

      <ul className={classNames.list}>
        {users.map((member) => {
          const isMe = member.id === currentUserId;

          return (
            <li key={member.id} className={classNames.item}>
              <div className={classNames.left}>
                <UserAvatar
                  src={member.avatar_url}
                  alt={member.username}
                  className={classNames.avatar}
                />

                <div className={classNames.identity}>
                  <span className={classNames.name}>
                    {member.username} {isMe ? "(du)" : ""}
                  </span>
                  <span className={classNames.email}>{member.email}</span>
                </div>
              </div>

              <div className={classNames.actionWrap}>
                <span
                  className={`${classNames.status} ${
                    member.status === "online"
                      ? classNames.statusOnline
                      : classNames.statusOffline
                  }`}
                  title={member.status}
                />

                {isMe && showLeaveAction && onLeaveCurrentUser && (
                  <button
                    type="button"
                    className={classNames.leaveButton}
                    onClick={() => void onLeaveCurrentUser()}
                    disabled={leavingChat}
                  >
                    {leavingChat ? "Verlasse..." : "Verlassen"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
