type Props = {
  title: string;
  subtitle: string;
  classNames: {
    header: string;
    title: string;
    subtitle: string;
  };
};

export default function ChatHeader({ title, subtitle, classNames }: Props) {
  return (
    <header className={classNames.header}>
      <div>
        <h1 className={classNames.title}>{title}</h1>
        <p className={classNames.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}
