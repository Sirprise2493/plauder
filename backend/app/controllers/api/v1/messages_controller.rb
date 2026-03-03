module Api
  module V1
    class MessagesController < BaseController
      before_action :authenticate_user!
      before_action :set_chat, only: %i[index create]
      before_action :set_message, only: %i[show update destroy]
      before_action :ensure_chat_member!, only: %i[index create]
      before_action :ensure_message_access!, only: %i[show update destroy]

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
        message.sender = current_user
        message.save!

        render json: message.as_json(
          include: {
            sender: { only: %i[id username email status] },
            message_attachments: {},
            message_ai_correction: {},
            message_warnings: {}
          }
        ), status: :created
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

      def ensure_chat_member!
        return if @chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def ensure_message_access!
        return if @message.chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def message_params
        params.require(:message).permit(:message_type, :content)
      end
    end
  end
end
