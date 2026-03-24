import { Link } from "react-router-dom";

type Props = {
  contactsPath: string;
  classNames: {
    container: string;
    secondaryButton: string;
    primaryButton: string;
  };
};

export default function ChatDetailActions({
  contactsPath,
  classNames,
}: Props) {
  return (
    <div className={classNames.container}>
      <Link to={contactsPath} className={classNames.secondaryButton}>
        Kontakte
      </Link>
    </div>
  );
}
