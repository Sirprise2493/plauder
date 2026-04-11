import type { ReactNode } from "react";
import UserAvatar from "../../../components/UserAvatar";

type Props = {
  title: string;
  subtitle: string;
  avatarUrl: string | null;
  rightSlot?: ReactNode;
  classNames: {
    header: string;
    avatar: string;
    textWrap: string;
    title: string;
    subtitle: string;
    rightSlot?: string;
  };
};

export default function ChatHeader({
  title,
  subtitle,
  avatarUrl,
  rightSlot,
  classNames,
}: Props) {
  return (
    <header className={classNames.header}>
      <UserAvatar src={avatarUrl} alt={title} className={classNames.avatar} />

      <div className={classNames.textWrap}>
        <h1 className={classNames.title}>{title}</h1>
        <p className={classNames.subtitle}>{subtitle}</p>
      </div>

      {rightSlot && (
        <div className={classNames.rightSlot}>
          {rightSlot}
        </div>
      )}
    </header>
  );
}
