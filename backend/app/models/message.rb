class Message < ApplicationRecord
  enum :message_type, {
    text: 0,
    image: 1,
    video: 2,
    audio: 3,
    file: 4,
    system: 5
  }, default: :text

  belongs_to :sender, class_name: "User"
  belongs_to :chat

  has_many :message_attachments, dependent: :destroy
  has_one :message_ai_correction, dependent: :destroy
  has_many :message_warnings, dependent: :destroy

  validates :sender_id, :chat_id, :message_type, presence: true
  validates :content, length: { maximum: 10_000 }, allow_blank: true

  validate :sender_must_be_member_of_chat
  validate :content_or_attachment_required

  private

  def sender_must_be_member_of_chat
    return if sender_id.blank? || chat_id.blank?

    unless chat.chat_memberships.exists?(user_id: sender_id)
      errors.add(:sender_id, "muss Mitglied des Chats sein")
    end
  end

  def content_or_attachment_required
    return unless text? || system?

    return if content.present?
    return if message_attachments.loaded? ? message_attachments.any? : message_attachments.exists?

    errors.add(:content, "oder ein Anhang muss vorhanden sein")
  end
end
