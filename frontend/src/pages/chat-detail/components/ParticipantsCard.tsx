import type { User } from "../types";

type Props = {
  users: User[];
  currentUserId?: number;
  classNames: {
    card: string;
    title: string;
    list: string;
    item: string;
    left: string;
    name: string;
    email: string;
    status: string;
    statusOnline: string;
    statusOffline: string;
  };
};

export default function ParticipantsCard({
  users,
  currentUserId,
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
                <span className={classNames.name}>
                  {member.username} {isMe ? "(du)" : ""}
                </span>
                <span className={classNames.email}>{member.email}</span>
              </div>

              <span
                className={`${classNames.status} ${
                  member.status === "online"
                    ? classNames.statusOnline
                    : classNames.statusOffline
                }`}
                title={member.status}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
