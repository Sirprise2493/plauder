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

  after_commit :enqueue_moderation_check, on: %i[create update]

  def placeholder_attachment_message?
    content.blank? || content == "Anhang"
  end

  def normalize_type_from_attachments!
    return unless message_attachments.exists?

    attachment_types = message_attachments.pluck(:file_type).uniq

    inferred_type =
      if attachment_types.size == 1
        case attachment_types.first.to_s
        when "image" then :image
        when "video" then :video
        when "audio" then :audio
        else :file
        end
      else
        :file
      end

    next_content = placeholder_attachment_message? ? nil : content

    if self.class.message_types[message_type] != self.class.message_types[inferred_type] || next_content != content
      update_columns(
        message_type: self.class.message_types.fetch(inferred_type),
        content: next_content,
        updated_at: Time.current
      )
    end
  end

  private

  def enqueue_moderation_check
    return unless text?
    return if draft?
    return if content.blank?
    return if content == "Anhang"

    changed_relevant =
      previous_changes.key?("content") ||
      previous_changes.key?("draft") ||
      previous_changes.key?("message_type")

    return unless changed_relevant

    ModerateMessageJob.perform_later(id)
  end

  def sender_must_be_member_of_chat
    return if sender_id.blank? || chat_id.blank?

    unless chat.chat_memberships.exists?(user_id: sender_id)
      errors.add(:sender_id, "muss Mitglied des Chats sein")
    end
  end

  def content_or_attachment_required
    return if draft?
    return unless text? || system?

    return if content.present?
    return if message_attachments.loaded? ? message_attachments.any? : message_attachments.exists?

    errors.add(:content, "oder ein Anhang muss vorhanden sein")
  end
end
