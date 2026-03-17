import type { RefObject } from "react";
import type { Message, MessageAttachment } from "../types";
import {
  formatBytes,
  isAudioAttachment,
  isImageAttachment,
  isVideoAttachment,
} from "../utils";

type Props = {
  messages: Message[];
  currentUserId?: number;
  loading: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  onOpenImage: (imageUrl: string, imageName: string) => void;
  onDownloadAttachment: (attachment: MessageAttachment) => void | Promise<void>;
  classNames: {
    section: string;
    messageText: string;
    emptyState: string;
    list: string;
    row: string;
    ownRow: string;
    otherRow: string;
    bubble: string;
    ownBubble: string;
    otherBubble: string;
    sender: string;
    content: string;
    meta: string;
    attachmentList: string;
    attachmentItem: string;
    imageButton: string;
    attachmentImage: string;
    attachmentVideo: string;
    attachmentAudio: string;
    fileAttachment: string;
    fileName: string;
    fileMeta: string;
    downloadButton: string;
  };
};

export default function MessageList({
  messages,
  currentUserId,
  loading,
  endRef,
  onOpenImage,
  onDownloadAttachment,
  classNames,
}: Props) {
  return (
    <section className={classNames.section}>
      {loading ? (
        <p className={classNames.messageText}>Lade Nachrichten...</p>
      ) : messages.length === 0 ? (
        <p className={classNames.emptyState}>Noch keine Nachrichten vorhanden.</p>
      ) : (
        <ul className={classNames.list}>
          {messages.map((message) => {
            const isOwnMessage = message.sender.id === currentUserId;

            return (
              <li
                key={message.id}
                className={`${classNames.row} ${
                  isOwnMessage ? classNames.ownRow : classNames.otherRow
                }`}
              >
                <div
                  className={`${classNames.bubble} ${
                    isOwnMessage ? classNames.ownBubble : classNames.otherBubble
                  }`}
                >
                  {!isOwnMessage && (
                    <p className={classNames.sender}>{message.sender.username}</p>
                  )}

                  {message.content && (
                    <p className={classNames.content}>{message.content}</p>
                  )}

                  {message.message_attachments.length > 0 && (
                    <div className={classNames.attachmentList}>
                      {message.message_attachments.map((attachment) => {
                        if (!attachment.file_url) return null;

                        if (isImageAttachment(attachment)) {
                          return (
                            <div key={attachment.id} className={classNames.attachmentItem}>
                              <button
                                type="button"
                                className={classNames.imageButton}
                                onClick={() =>
                                  onOpenImage(attachment.file_url!, attachment.filename)
                                }
                              >
                                <img
                                  src={attachment.file_url}
                                  alt={attachment.filename}
                                  className={classNames.attachmentImage}
                                />
                              </button>

                              <button
                                type="button"
                                className={classNames.downloadButton}
                                onClick={() => void onDownloadAttachment(attachment)}
                              >
                                Bild herunterladen
                              </button>
                            </div>
                          );
                        }

                        if (isVideoAttachment(attachment)) {
                          return (
                            <div key={attachment.id} className={classNames.attachmentItem}>
                              <video
                                controls
                                preload="metadata"
                                className={classNames.attachmentVideo}
                              >
                                <source
                                  src={attachment.file_url}
                                  type={attachment.content_type || "video/mp4"}
                                />
                                Dein Browser unterstützt Video nicht.
                              </video>

                              <button
                                type="button"
                                className={classNames.downloadButton}
                                onClick={() => void onDownloadAttachment(attachment)}
                              >
                                Video herunterladen
                              </button>
                            </div>
                          );
                        }

                        if (isAudioAttachment(attachment)) {
                          return (
                            <div key={attachment.id} className={classNames.attachmentItem}>
                              <audio
                                controls
                                preload="metadata"
                                className={classNames.attachmentAudio}
                              >
                                <source
                                  src={attachment.file_url}
                                  type={attachment.content_type || "audio/mpeg"}
                                />
                                Dein Browser unterstützt Audio nicht.
                              </audio>

                              <button
                                type="button"
                                className={classNames.downloadButton}
                                onClick={() => void onDownloadAttachment(attachment)}
                              >
                                Audio herunterladen
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div key={attachment.id} className={classNames.fileAttachment}>
                            <div>
                              <p className={classNames.fileName}>{attachment.filename}</p>
                              <p className={classNames.fileMeta}>
                                {formatBytes(attachment.byte_size)}
                              </p>
                            </div>

                            <button
                              type="button"
                              className={classNames.downloadButton}
                              onClick={() => void onDownloadAttachment(attachment)}
                            >
                              Datei herunterladen
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className={classNames.meta}>
                    {new Date(message.created_at).toLocaleString("de-DE")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div ref={endRef} />
    </section>
  );
}
