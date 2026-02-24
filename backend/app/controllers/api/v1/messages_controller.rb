module Api
  module V1
    class MessagesController < BaseController
      before_action :set_chat, only: %i[index create]
      before_action :set_message, only: %i[show update destroy]

      def index
        messages = @chat.messages
                        .includes(:sender, :message_attachments, :message_ai_correction, :message_warnings)
                        .order(created_at: :asc)

        render json: messages.as_json(
          include: {
            sender: { only: %i[id username email status] },
            message_attachments: {},
            message_ai_correction: {},
            message_warnings: {}
          }
        )
      end

      def show
        render json: @message.as_json(
          include: {
            sender: { only: %i[id username email status] },
            message_attachments: {},
            message_ai_correction: {},
            message_warnings: {}
          }
        )
      end

      def create
        message = @chat.messages.new(message_params)
        message.save!
        render json: message.as_json(include: { sender: { only: %i[id username email status] } }), status: :created
      end

      def update
        @message.update!(message_params)
        render json: @message
      end

      def destroy
        @message.destroy!
        head :no_content
      end

      private

      def set_chat
        @chat = Chat.find(params[:chat_id])
      end

      def set_message
        @message = Message.find(params[:id])
      end

      def message_params
        params.require(:message).permit(:sender_id, :message_type, :content)
      end
    end
  end
end
