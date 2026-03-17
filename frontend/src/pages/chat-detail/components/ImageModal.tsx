type Props = {
  imageUrl: string | null;
  imageName: string;
  onClose: () => void;
  classNames: {
    overlay: string;
    content: string;
    closeButton: string;
    image: string;
    imageName: string;
  };
};

export default function ImageModal({
  imageUrl,
  imageName,
  onClose,
  classNames,
}: Props) {
  if (!imageUrl) return null;

  return (
    <div className={classNames.overlay} onClick={onClose}>
      <div
        className={classNames.content}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={classNames.closeButton}
          onClick={onClose}
        >
          ✕
        </button>

        <img
          src={imageUrl}
          alt={imageName}
          className={classNames.image}
        />

        <p className={classNames.imageName}>{imageName}</p>
      </div>
    </div>
  );
}
