class MessageAttachment < ApplicationRecord
  enum :file_type, {
    image: 0,
    video: 1,
    audio: 2,
    document: 3,
    other: 4
  }

  belongs_to :message

  validates :filename, presence: true, length: { maximum: 255 }
  validates :file_type, presence: true
  validates :byte_size, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :durations_ms, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :width, :height, numericality: { greater_than: 0 }, allow_nil: true

  validate :duration_only_for_audio_or_video
  validate :dimensions_only_for_image_or_video
  validate :paired_dimensions

  private

  def duration_only_for_audio_or_video
    return if durations_ms.nil?

    unless audio? || video?
      errors.add(:durations_ms, "ist nur für Audio/Video erlaubt")
    end
  end

  def dimensions_only_for_image_or_video
    return if width.nil? && height.nil?

    unless image? || video?
      errors.add(:base, "Breite/Höhe sind nur für Bild/Video erlaubt")
    end
  end

  def paired_dimensions
    if width.present? ^ height.present?
      errors.add(:base, "width und height müssen zusammen gesetzt werden")
    end
  end
end
