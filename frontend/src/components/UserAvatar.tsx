type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#d9e2ec"/>
      <circle cx="60" cy="45" r="22" fill="#9fb3c8"/>
      <path d="M28 96c6-18 22-28 32-28s26 10 32 28" fill="#9fb3c8"/>
    </svg>
  `);

export default function UserAvatar({ src, alt, className }: Props) {
  return (
    <img
      src={src || FALLBACK_AVATAR}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = FALLBACK_AVATAR;
      }}
    />
  );
}
