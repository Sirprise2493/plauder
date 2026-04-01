class Chat < ApplicationRecord
  enum :chat_type, {
    direct: 0,
    group_chat: 1
  }, default: :direct

  has_one_attached :avatar

  has_many :chat_memberships, dependent: :destroy
  has_many :users, through: :chat_memberships

  has_many :messages, dependent: :destroy
  has_many :calls, dependent: :destroy

  validates :chat_type, presence: true
  validates :title, length: { maximum: 100 }, allow_blank: true

  validate :title_required_for_group_chat
  validate :avatar_must_be_image

  private

  def title_required_for_group_chat
    return unless group_chat?
    errors.add(:title, "muss bei Gruppenchats gesetzt sein") if title.blank?
  end

  def avatar_must_be_image
    return unless avatar.attached?

    unless avatar.blob.content_type&.start_with?("image/")
      errors.add(:avatar, "muss ein Bild sein")
    end
  end
end
