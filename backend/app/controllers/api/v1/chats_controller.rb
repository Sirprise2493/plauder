module Api
  module V1
    class ChatsController < BaseController
      before_action :authenticate_user!
      before_action :set_chat, only: %i[show update destroy]

      def index
        chats = Chat
          .includes(:users)
          .joins(:chat_memberships)
          .where(chat_memberships: { user_id: current_user.id })
          .distinct
          .order(created_at: :desc)

        render json: chats.map { |chat| serialize_chat(chat) }
      end

      def recent
        chats = Chat
          .includes(:users, messages: :sender)
          .joins(:chat_memberships)
          .joins(:messages)
          .where(chat_memberships: { user_id: current_user.id })
          .select("chats.*, MAX(messages.created_at) AS last_message_at")
          .group("chats.id")
          .order("last_message_at DESC")
          .limit(5)

        render json: chats.map { |chat| serialize_recent_chat(chat) }
      end

      def show
        unless @chat.users.exists?(id: current_user.id)
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        render json: serialize_chat(@chat)
      end

      def create
        chat = Chat.new(chat_params)
        chat.save!
        render json: chat, status: :created
      end

      def update
        @chat.update!(chat_params)
        render json: @chat
      end

      def destroy
        @chat.destroy!
        head :no_content
      end

      private

      def set_chat
        @chat = Chat.find(params[:id])
      end

      def chat_params
        params.require(:chat).permit(:chat_type, :title)
      end

      def serialize_chat(chat)
        chat.as_json(
          only: %i[id chat_type title created_at updated_at],
          include: {
            users: { only: %i[id username email status] }
          }
        )
      end

      def serialize_recent_chat(chat)
        last_message = chat.messages.max_by(&:created_at)
        other_user = chat.direct? ? chat.users.find { |user| user.id != current_user.id } : nil

        {
          id: chat.id,
          chat_type: chat.chat_type,
          title: chat.title,
          display_name: chat.direct? ? other_user&.username : chat.title,
          last_message: last_message&.as_json(
            only: %i[id content message_type created_at],
            include: {
              sender: { only: %i[id username email status] }
            }
          ),
          users: chat.users.as_json(only: %i[id username email status])
        }
      end
    end
  end
end
