import { useState } from "react";
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

type GroupView = "chat" | "group";

export default function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [groupView, setGroupView] = useState<GroupView>("chat");

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

  const isGroupChat = chat?.chat_type === "group_chat";

  return (
    <div className={s.wrapper}>
      <div className={s.pageShell}>
        {(loadingChat || loadingMessages) && (
          <p className="uiMessage uiMessageSuccess">Lade Chat...</p>
        )}

        {error && <p className="uiMessage uiMessageError">{error}</p>}

        {!loadingChat && !error && chat && (
          <div className={s.chatAppShell}>
            <ChatHeader
              title={chatDisplayTitle}
              subtitle={
                isGroupChat ? `${chat.users.length} Mitglieder` : "Direktchat"
              }
              avatarUrl={chatAvatarUrl}
              rightSlot={
                <Link to="/contacts" className={s.headerBackButton}>
                  Kontakte
                </Link>
              }
              classNames={{
                header: s.chatHeader,
                avatar: s.chatAvatar,
                textWrap: s.chatHeaderText,
                title: s.chatTitle,
                subtitle: s.chatSubtitle,
                rightSlot: s.chatHeaderRight,
              }}
            />

            {isGroupChat && (
              <div className={s.switchBar}>
                <div
                  className={s.viewSwitch}
                  aria-label="Ansicht im Gruppenchat wechseln"
                >
                  <button
                    type="button"
                    className={`${s.viewSwitchButton} ${
                      groupView === "chat" ? s.viewSwitchButtonActive : ""
                    }`}
                    onClick={() => setGroupView("chat")}
                  >
                    Chat
                  </button>

                  <button
                    type="button"
                    className={`${s.viewSwitchButton} ${
                      groupView === "group" ? s.viewSwitchButtonActive : ""
                    }`}
                    onClick={() => setGroupView("group")}
                  >
                    Gruppe
                  </button>
                </div>
              </div>
            )}

            <div className={s.mainBody}>
              {(!isGroupChat || groupView === "chat") && (
                <div className={s.threadArea}>
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

                  <div className={s.composerWrap}>
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
                  </div>

                  {sendError && <p className="uiMessage uiMessageError">{sendError}</p>}
                </div>
              )}

              {isGroupChat && groupView === "group" && (
                <div className={s.groupArea}>
                  <ChatDetailActions
                    isGroupChat={true}
                    availableFriends={availableFriends}
                    memberSearch={memberSearch}
                    loadingFriends={loadingFriends}
                    addingMemberId={addingMemberId}
                    membershipMessage={membershipMessage}
                    membershipError={membershipError}
                    onMemberSearchChange={setMemberSearch}
                    onAddMember={handleAddMember}
                    classNames={{
                      container: s.detailActions,
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
                    showLeaveAction={true}
                    leavingChat={leavingChat}
                    onLeaveCurrentUser={async () => {
                      const success = await handleLeaveChat();
                      if (success) {
                        navigate("/contacts");
                      }
                    }}
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
                      actionWrap: s.participantActionWrap,
                      leaveButton: s.participantLeaveButton,
                    }}
                  />
                </div>
              )}
            </div>
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
    </div>
  );
}
