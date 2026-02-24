class Call < ApplicationRecord
  enum :call_type, {
    audio: 0,
    video: 1
  }

  enum :status, {
    initiated: 0,
    ringing: 1,
    ongoing: 2,
    ended: 3,
    missed: 4,
    cancelled: 5,
    declined: 6
  }, default: :initiated

  belongs_to :chat
  belongs_to :initiator, class_name: "User"

  has_many :call_participants, dependent: :destroy
  has_many :participants, through: :call_participants, source: :user

  validates :chat_id, :initiator_id, :call_type, :status, presence: true

  validate :initiator_must_be_chat_member
  validate :ended_at_after_started_at
  validate :started_at_required_for_ongoing_or_ended
  validate :ended_at_required_for_terminal_statuses

  private

  def initiator_must_be_chat_member
    return if chat.blank? || initiator_id.blank?

    unless chat.chat_memberships.exists?(user_id: initiator_id)
      errors.add(:initiator_id, "muss Mitglied des Chats sein")
    end
  end

  def ended_at_after_started_at
    return if started_at.blank? || ended_at.blank?

    if ended_at < started_at
      errors.add(:ended_at, "muss nach started_at liegen")
    end
  end

  def started_at_required_for_ongoing_or_ended
    if (ongoing? || ended?) && started_at.blank?
      errors.add(:started_at, "muss bei laufenden/beendeten Calls gesetzt sein")
    end
  end

  def ended_at_required_for_terminal_statuses
    terminal = ended? || missed? || cancelled? || declined?
    if terminal && ended_at.blank?
      errors.add(:ended_at, "muss bei beendet/verpasst/abgebrochen/abgelehnt gesetzt sein")
    end
  end
end
