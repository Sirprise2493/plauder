class MessageAttachment < ApplicationRecord
  enum :file_type, {
    image: 0,
    video: 1,
    audio: 2,
    document: 3,
    other: 4
  }

  belongs_to :message

  has_one_attached :file

  validates :filename, presence: true, length: { maximum: 255 }
  validates :file_type, presence: true
  validates :byte_size, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :durations_ms, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :width, :height, numericality: { greater_than: 0 }, allow_nil: true

  validate :file_must_be_attached
  validate :byte_size_matches_attached_file, if: -> { file.attached? && byte_size.present? }
  validate :duration_only_for_audio_or_video
  validate :dimensions_only_for_image_or_video
  validate :paired_dimensions

  before_validation :populate_file_metadata_from_attachment, if: -> { file.attached? }
  after_commit :normalize_parent_message_type!, on: :create

  private

  def file_must_be_attached
    errors.add(:file, "muss angehängt sein") unless file.attached?
  end

  def populate_file_metadata_from_attachment
    self.filename = file.filename.to_s if filename.blank?
    self.byte_size = file.blob.byte_size if byte_size.blank?
  end

  def byte_size_matches_attached_file
    return unless file.blob.byte_size != byte_size

    errors.add(:byte_size, "muss der tatsächlichen Dateigröße entsprechen")
  end

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

  def normalize_parent_message_type!
    message.normalize_type_from_attachments!
  end
end
