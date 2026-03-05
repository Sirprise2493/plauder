require "open-uri"

module Api
  module V1
    class MessageAttachmentsController < BaseController
      before_action :authenticate_user!
      before_action :set_message
      before_action :ensure_chat_member!
      before_action :set_attachment, only: %i[show update destroy download]
      before_action :ensure_message_owner!, only: %i[create update destroy]

      def index
        render json: @message.message_attachments.order(:id).map { |attachment| serialize_attachment(attachment) }
      end

      def show
        render json: serialize_attachment(@attachment)
      end

      def create
        attachment = @message.message_attachments.new(message_attachment_params.except(:file))
        attach_uploaded_file!(attachment)

        attachment.save!
        render json: serialize_attachment(attachment), status: :created
      end

      def update
        @attachment.assign_attributes(message_attachment_params.except(:file))

        if uploaded_file.present?
          @attachment.file.purge if @attachment.file.attached?
          @attachment.file.attach(uploaded_file)
        end

        @attachment.save!
        render json: serialize_attachment(@attachment)
      end

      def destroy
        @attachment.file.purge if @attachment.file.attached?
        @attachment.destroy!
        head :no_content
      end

      def download
        unless @attachment.file.attached?
          return render json: { error: "Keine Datei vorhanden" }, status: :not_found
        end

        file_data = @attachment.file.download

        send_data(
          file_data,
          filename: @attachment.filename,
          type: @attachment.file.blob.content_type || "application/octet-stream",
          disposition: "attachment"
        )
      end

      private

      def set_message
        @message = Message.find(params[:message_id])
      end

      def set_attachment
        @attachment = @message.message_attachments.find(params[:id])
      end

      def ensure_chat_member!
        return if @message.chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def ensure_message_owner!
        return if @message.sender_id == current_user.id

        render json: { error: "Du darfst nur Anhänge deiner eigenen Nachrichten verwalten" }, status: :forbidden
      end

      def message_attachment_params
        params.require(:message_attachment).permit(
          :filename,
          :file_type,
          :durations_ms,
          :byte_size,
          :width,
          :height,
          :file
        )
      end

      def uploaded_file
        params.dig(:message_attachment, :file)
      end

      def attach_uploaded_file!(attachment)
        if uploaded_file.blank?
          attachment.errors.add(:file, "muss angehängt sein")
          raise ActiveRecord::RecordInvalid, attachment
        end

        attachment.file.attach(uploaded_file)
      end

      def serialize_attachment(attachment)
        attachment.as_json(
          only: %i[
            id
            message_id
            filename
            file_type
            durations_ms
            byte_size
            width
            height
            created_at
            updated_at
          ]
        ).merge(
          file_url: attachment.file.attached? ? rails_blob_url(attachment.file) : nil,
          download_url: attachment.file.attached? ? download_api_v1_message_message_attachment_url(attachment.message, attachment) : nil,
          content_type: attachment.file.attached? ? attachment.file.blob.content_type : nil
        )
end
    end
  end
end
