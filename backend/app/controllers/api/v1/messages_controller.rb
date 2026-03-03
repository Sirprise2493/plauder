module Api
  module V1
    class MessagesController < BaseController
      before_action :authenticate_user!
      before_action :set_chat, only: %i[index create]
      before_action :set_message, only: %i[show update destroy]

      before_action :ensure_chat_member!, only: %i[index create]
      before_action :ensure_message_chat_member!, only: %i[show]
      before_action :ensure_message_owner!, only: %i[update destroy]
      before_action :ensure_user_can_create_message!, only: %i[create]

      def index
        messages = @chat.messages
                        .includes(:sender, :message_attachments, :message_ai_correction, :message_warnings)
                        .order(created_at: :asc)

        render json: serialize_messages(messages)
      end

      def show
        render json: serialize_message(@message)
      end

      def create
        message = @chat.messages.new(message_params)
        message.sender = current_user
        message.save!

        render json: serialize_message(message), status: :created
      end

      def update
        @message.update!(update_message_params)
        render json: serialize_message(@message)
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

        render_forbidden("Nicht erlaubt")
      end

      def ensure_message_chat_member!
        return if @message.chat.users.exists?(id: current_user.id)

        render_forbidden("Nicht erlaubt")
      end

      def ensure_message_owner!
        unless @message.chat.users.exists?(id: current_user.id)
          return render_forbidden("Nicht erlaubt")
        end

        return if @message.sender_id == current_user.id

        render_forbidden("Du darfst nur deine eigenen Nachrichten bearbeiten oder löschen")
      end

      def ensure_user_can_create_message!
        return unless params.dig(:message, :message_type) == "system"

        render_unprocessable("Systemnachrichten dürfen nicht manuell erstellt werden")
      end

      def message_params
        params.require(:message).permit(:message_type, :content)
      end

      def update_message_params
        permitted = params.require(:message).permit(:content)

        if params.dig(:message, :message_type).present?
          render_unprocessable("Der Nachrichtentyp kann nicht geändert werden")
          return
        end

        permitted
      end

      def serialize_messages(messages)
        messages.as_json(
          include: {
            sender: { only: %i[id username email status] },
            message_attachments: {},
            message_ai_correction: {},
            message_warnings: {}
          }
        )
      end

      def serialize_message(message)
        message.as_json(
          include: {
            sender: { only: %i[id username email status] },
            message_attachments: {},
            message_ai_correction: {},
            message_warnings: {}
          }
        )
      end

      def render_forbidden(message)
        render json: { error: message }, status: :forbidden
      end

      def render_unprocessable(message)
        render json: { error: message }, status: :unprocessable_entity
      end
    end
  end
end
