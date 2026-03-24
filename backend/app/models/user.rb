class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum :status, {
    offline: 0,
    online: 1,
  }, default: :offline

  has_one_attached :avatar

  has_many :chat_memberships, dependent: :destroy
  has_many :chats, through: :chat_memberships

  has_many :requested_friendships, class_name: "Friendship", foreign_key: :requester_id, dependent: :destroy
  has_many :received_friendships, class_name: "Friendship", foreign_key: :receiver_id, dependent: :destroy

  has_many :sent_messages, class_name: "Message", foreign_key: :sender_id, dependent: :destroy
  has_many :initiated_calls, class_name: "Call", foreign_key: :initiator_id, dependent: :destroy
  has_many :call_participants, dependent: :destroy
  has_many :participated_calls, through: :call_participants, source: :call

  validates :username, presence: true, length: { minimum: 3, maximum: 30 }, uniqueness: { case_sensitive: false }
  validates :status, presence: true

  validate :acceptable_avatar

  before_validation :normalize_username

  private

  def normalize_username
    self.username = username.to_s.strip
  end

  def acceptable_avatar
    return unless avatar.attached?

    unless avatar.blob.content_type.in?(%w[image/jpeg image/png image/webp image/jpg])
      errors.add(:avatar, "muss ein JPG, PNG oder WEBP sein")
    end

    if avatar.blob.byte_size > 5.megabytes
      errors.add(:avatar, "ist zu groß (max. 5MB)")
    end
  end
end
