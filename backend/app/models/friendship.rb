class Friendship < ApplicationRecord
  enum :friendship_status, {
    pending: 0,
    accepted: 1,
    rejected: 2,
    blocked: 3
  }, default: :pending

  belongs_to :requester, class_name: "User"
  belongs_to :receiver, class_name: "User"

  validates :requester_id, :receiver_id, presence: true
  validates :receiver_id, uniqueness: { scope: :requester_id, message: "Freundschaft existiert bereits" }
  validates :active, inclusion: { in: [true, false] }

  validate :requester_and_receiver_must_differ
  validate :reverse_pair_must_be_unique

  private

  def requester_and_receiver_must_differ
    return if requester_id.blank? || receiver_id.blank?
    errors.add(:receiver_id, "darf nicht identisch mit requester sein") if requester_id == receiver_id
  end

  # Verhindert doppelte Freundschaft in Gegenrichtung (A->B und B->A)
  def reverse_pair_must_be_unique
    return if requester_id.blank? || receiver_id.blank?

    relation = Friendship.where(requester_id: receiver_id, receiver_id: requester_id)
    relation = relation.where.not(id: id) if persisted?

    if relation.exists?
      errors.add(:base, "Freundschaft existiert bereits in umgekehrter Richtung")
    end
  end
end
