import { Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import s from "./ChatDetail.module.css";
import ImageModal from "./chat-detail/components/ImageModal";
import ChatHeader from "./chat-detail/components/ChatHeader";
import ChatDetailActions from "./chat-detail/components/ChatDetailActions.tsx";
import ParticipantsCard from "./chat-detail/components/ParticipantsCard";
import MessageList from "./chat-detail/components/MessageList";
import MessageComposer from "./chat-detail/components/MessageComposer";
import { useChatDetail } from "./chat-detail/hooks/useChatDetail";

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const {
    chat,
    messages,
    newMessage,
    pendingAttachments,
    isDragActive,
    activeImageUrl,
    activeImageName,
    aiCorrectedText,
    isShowingAiCorrection,
    improvingText,
    loadingChat,
    loadingMessages,
    sendingMessage,
    error,
    sendError,
    messagesEndRef,
    fileInputRef,
    chatDisplayTitle,
    setActiveImageUrl,
    setActiveImageName,
    handleFileInputChange,
    handleRemovePendingAttachment,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleMessageChange,
    handleAiCorrection,
    handleSendMessage,
    handleMessageKeyDown,
    handleDownloadAttachment,
  } = useChatDetail({
    chatId: id,
    currentUserId: currentUser?.id,
  });

  return (
    <div className={s.wrapper}>
      <div className={s.topBar}>
        <Link to="/contacts" className={s.backLink}>
          ← Zurück zu Kontakte
        </Link>
      </div>

      {(loadingChat || loadingMessages) && <p className={s.message}>Lade Chat...</p>}
      {error && <p className={s.error}>{error}</p>}

      {!loadingChat && !error && chat && (
        <div className={s.chatLayout}>
          <ChatHeader
            title={chatDisplayTitle}
            subtitle={
              chat.chat_type === "group_chat"
                ? `${chat.users.length} Mitglieder`
                : "Direktchat"
            }
            classNames={{
              header: s.chatHeader,
              title: s.chatTitle,
              subtitle: s.chatSubtitle,
            }}
          />

          <ChatDetailActions
            contactsPath="/contacts"
            callPath={`/chats/${chat.id}/call`}
            classNames={{
              container: s.detailActions,
              secondaryButton: s.detailSecondaryButton,
              primaryButton: s.detailPrimaryButton,
            }}
          />

          <ParticipantsCard
            users={chat.users}
            currentUserId={currentUser?.id}
            classNames={{
              card: s.participantsCard,
              title: s.participantsTitle,
              list: s.participantsList,
              item: s.participantItem,
              left: s.participantLeft,
              name: s.participantName,
              email: s.participantEmail,
              status: s.participantStatus,
              statusOnline: s.statusOnline,
              statusOffline: s.statusOffline,
            }}
          />

          <MessageList
            messages={messages}
            currentUserId={currentUser?.id}
            loading={loadingMessages}
            endRef={messagesEndRef}
            onOpenImage={(imageUrl, imageName) => {
              setActiveImageUrl(imageUrl);
              setActiveImageName(imageName);
            }}
            onDownloadAttachment={handleDownloadAttachment}
            classNames={{
              section: s.messagesSection,
              messageText: s.message,
              emptyState: s.emptyState,
              list: s.messageList,
              row: s.messageRow,
              ownRow: s.ownRow,
              otherRow: s.otherRow,
              bubble: s.messageBubble,
              ownBubble: s.ownBubble,
              otherBubble: s.otherBubble,
              sender: s.messageSender,
              content: s.messageContent,
              meta: s.messageMeta,
              attachmentList: s.attachmentList,
              attachmentItem: s.attachmentItem,
              imageButton: s.imageButton,
              attachmentImage: s.attachmentImage,
              attachmentVideo: s.attachmentVideo,
              attachmentAudio: s.attachmentAudio,
              fileAttachment: s.fileAttachment,
              fileName: s.fileName,
              fileMeta: s.fileMeta,
              downloadButton: s.downloadButton,
            }}
          />

          <MessageComposer
            newMessage={newMessage}
            pendingAttachments={pendingAttachments}
            sendingMessage={sendingMessage}
            improvingText={improvingText}
            isDragActive={isDragActive}
            isShowingAiCorrection={isShowingAiCorrection}
            aiCorrectedText={aiCorrectedText}
            fileInputRef={fileInputRef}
            onSubmit={handleSendMessage}
            onMessageChange={handleMessageChange}
            onMessageKeyDown={handleMessageKeyDown}
            onFileInputChange={handleFileInputChange}
            onRemovePendingAttachment={handleRemovePendingAttachment}
            onAiCorrection={handleAiCorrection}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            classNames={{
              form: s.messageForm,
              dragActive: s.dragActive,
              composerTopRow: s.composerTopRow,
              attachButton: s.attachButton,
              hiddenFileInput: s.hiddenFileInput,
              pendingAttachments: s.pendingAttachments,
              pendingAttachmentCard: s.pendingAttachmentCard,
              pendingPreviewImage: s.pendingPreviewImage,
              pendingPreviewVideo: s.pendingPreviewVideo,
              pendingAttachmentInfo: s.pendingAttachmentInfo,
              pendingAttachmentName: s.pendingAttachmentName,
              pendingAttachmentMeta: s.pendingAttachmentMeta,
              removeAttachmentButton: s.removeAttachmentButton,
              messageInput: s.messageInput,
              composerActions: s.composerActions,
              aiCorrectButton: s.aiCorrectButton,
              sendButton: s.sendButton,
              inputHint: s.inputHint,
            }}
          />

          {sendError && <p className={s.error}>{sendError}</p>}
        </div>
      )}

      <ImageModal
        imageUrl={activeImageUrl}
        imageName={activeImageName}
        onClose={() => {
          setActiveImageUrl(null);
          setActiveImageName("");
        }}
        classNames={{
          overlay: s.imageModalOverlay,
          content: s.imageModalContent,
          closeButton: s.closeModalButton,
          image: s.modalImage,
          imageName: s.modalImageName,
        }}
      />
    </div>
  );
}
