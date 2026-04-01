import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import s from "./ChatDetail.module.css";
import ImageModal from "./chat-detail/components/ImageModal";
import ChatHeader from "./chat-detail/components/ChatHeader";
import ChatDetailActions from "./chat-detail/components/ChatDetailActions";
import ParticipantsCard from "./chat-detail/components/ParticipantsCard";
import MessageList from "./chat-detail/components/MessageList";
import MessageComposer from "./chat-detail/components/MessageComposer";
import { useChatDetail } from "./chat-detail/hooks/useChatDetail";

export default function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const {
    chat,
    messages,
    availableFriends,
    memberSearch,
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
    loadingFriends,
    sendingMessage,
    addingMemberId,
    leavingChat,
    error,
    sendError,
    membershipMessage,
    membershipError,
    messagesEndRef,
    fileInputRef,
    chatDisplayTitle,
    chatAvatarUrl,
    setActiveImageUrl,
    setActiveImageName,
    setMemberSearch,
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
    handleAddMember,
    handleLeaveChat,
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
            avatarUrl={chatAvatarUrl}
            classNames={{
              header: s.chatHeader,
              avatar: s.chatAvatar,
              textWrap: s.chatHeaderText,
              title: s.chatTitle,
              subtitle: s.chatSubtitle,
            }}
          />

          <ChatDetailActions
            contactsPath="/contacts"
            isGroupChat={chat.chat_type === "group_chat"}
            availableFriends={availableFriends}
            memberSearch={memberSearch}
            loadingFriends={loadingFriends}
            addingMemberId={addingMemberId}
            leavingChat={leavingChat}
            membershipMessage={membershipMessage}
            membershipError={membershipError}
            onMemberSearchChange={setMemberSearch}
            onAddMember={handleAddMember}
            onLeaveChat={async () => {
              const success = await handleLeaveChat();
              if (success) {
                navigate("/contacts");
              }
            }}
            classNames={{
              container: s.detailActions,
              secondaryButton: s.detailSecondaryButton,
              dangerButton: s.detailDangerButton,
              addMembersCard: s.addMembersCard,
              searchInput: s.membersSearchInput,
              friendsList: s.addableFriendsList,
              friendItem: s.addableFriendItem,
              friendLeft: s.addableFriendLeft,
              friendAvatar: s.addableFriendAvatar,
              friendName: s.addableFriendName,
              inlineInfo: s.inlineInfo,
              inlineError: s.inlineError,
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
              avatar: s.participantAvatar,
              identity: s.participantIdentity,
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
