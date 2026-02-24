module Api
  module V1
    class MessageAttachmentsController < BaseController
      before_action :set_message
      before_action :set_attachment, only: %i[show update destroy]

      def index
        render json: @message.message_attachments.order(:id)
      end

      def show
        render json: @attachment
      end

      def create
        attachment = @message.message_attachments.new(message_attachment_params)
        attachment.save!
        render json: attachment, status: :created
      end

      def update
        @attachment.update!(message_attachment_params)
        render json: @attachment
      end

      def destroy
        @attachment.destroy!
        head :no_content
      end

      private

      def set_message
        @message = Message.find(params[:message_id])
      end

      def set_attachment
        @attachment = @message.message_attachments.find(params[:id])
      end

      def message_attachment_params
        params.require(:message_attachment).permit(
          :filename,
          :file_type,
          :durations_ms,
          :byte_size,
          :width,
          :height
        )
      end
    end
  end
end
