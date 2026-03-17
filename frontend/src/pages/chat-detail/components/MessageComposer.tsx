import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  RefObject,
} from "react";
import type { PendingAttachment } from "../types";
import { formatBytes } from "../utils";

type Props = {
  newMessage: string;
  pendingAttachments: PendingAttachment[];
  sendingMessage: boolean;
  improvingText: boolean;
  isDragActive: boolean;
  isShowingAiCorrection: boolean;
  aiCorrectedText: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onMessageChange: (value: string) => void;
  onMessageKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingAttachment: (attachmentId: string) => void;
  onAiCorrection: () => void | Promise<void>;
  onDrop: (event: DragEvent<HTMLFormElement>) => void;
  onDragOver: (event: DragEvent<HTMLFormElement>) => void;
  onDragLeave: (event: DragEvent<HTMLFormElement>) => void;
  classNames: {
    form: string;
    dragActive: string;
    composerTopRow: string;
    attachButton: string;
    hiddenFileInput: string;
    pendingAttachments: string;
    pendingAttachmentCard: string;
    pendingPreviewImage: string;
    pendingPreviewVideo: string;
    pendingAttachmentInfo: string;
    pendingAttachmentName: string;
    pendingAttachmentMeta: string;
    removeAttachmentButton: string;
    messageInput: string;
    composerActions: string;
    aiCorrectButton: string;
    sendButton: string;
    inputHint: string;
  };
};

export default function MessageComposer({
  newMessage,
  pendingAttachments,
  sendingMessage,
  improvingText,
  isDragActive,
  isShowingAiCorrection,
  aiCorrectedText,
  fileInputRef,
  onSubmit,
  onMessageChange,
  onMessageKeyDown,
  onFileInputChange,
  onRemovePendingAttachment,
  onAiCorrection,
  onDrop,
  onDragOver,
  onDragLeave,
  classNames,
}: Props) {
  return (
    <>
      <form
        className={`${classNames.form} ${isDragActive ? classNames.dragActive : ""}`}
        onSubmit={onSubmit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className={classNames.composerTopRow}>
          <button
            type="button"
            className={classNames.attachButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingMessage || improvingText}
          >
            Datei hinzufügen
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={classNames.hiddenFileInput}
            onChange={onFileInputChange}
          />
        </div>

        {pendingAttachments.length > 0 && (
          <div className={classNames.pendingAttachments}>
            {pendingAttachments.map((attachment) => (
              <div key={attachment.id} className={classNames.pendingAttachmentCard}>
                {attachment.kind === "image" && attachment.previewUrl && (
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.file.name}
                    className={classNames.pendingPreviewImage}
                  />
                )}

                {attachment.kind === "video" && attachment.previewUrl && (
                  <video
                    className={classNames.pendingPreviewVideo}
                    src={attachment.previewUrl}
                    muted
                  />
                )}

                <div className={classNames.pendingAttachmentInfo}>
                  <p className={classNames.pendingAttachmentName}>
                    {attachment.file.name}
                  </p>
                  <p className={classNames.pendingAttachmentMeta}>
                    {attachment.kind} · {formatBytes(attachment.file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  className={classNames.removeAttachmentButton}
                  onClick={() => onRemovePendingAttachment(attachment.id)}
                  disabled={sendingMessage || improvingText}
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={newMessage}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={onMessageKeyDown}
          placeholder="Nachricht eingeben oder Datei hier hineinziehen..."
          className={classNames.messageInput}
          maxLength={10000}
          disabled={sendingMessage || improvingText}
          rows={3}
        />

        <div className={classNames.composerActions}>
          <button
            type="button"
            className={classNames.aiCorrectButton}
            onClick={() => void onAiCorrection()}
            disabled={
              sendingMessage ||
              improvingText ||
              pendingAttachments.length > 0 ||
              newMessage.trim().length === 0
            }
          >
            {improvingText
              ? "AI korrigiert..."
              : isShowingAiCorrection
                ? "Rückgängig"
                : aiCorrectedText
                  ? "AI-Korrektur anzeigen"
                  : "AI korrigieren"}
          </button>

          <button
            type="submit"
            className={classNames.sendButton}
            disabled={
              sendingMessage ||
              improvingText ||
              (!newMessage.trim() && pendingAttachments.length === 0)
            }
          >
            {sendingMessage ? "Sende..." : "Senden"}
          </button>
        </div>
      </form>

      <p className={classNames.inputHint}>
        Enter = senden, Shift + Enter = Zeilenumbruch, Dateien per Drag & Drop
        möglich
      </p>
    </>
  );
}
