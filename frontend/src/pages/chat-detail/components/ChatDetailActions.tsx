import { Link } from "react-router-dom";

type Props = {
  contactsPath: string;
  callPath: string;
  classNames: {
    container: string;
    secondaryButton: string;
    primaryButton: string;
  };
};

export default function ChatDetailActions({
  contactsPath,
  callPath,
  classNames,
}: Props) {
  return (
    <div className={classNames.container}>
      <Link to={contactsPath} className={classNames.secondaryButton}>
        Kontakte
      </Link>

      <Link to={callPath} className={classNames.primaryButton}>
        Call
      </Link>
    </div>
  );
}
