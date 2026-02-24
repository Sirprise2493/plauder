module Api
  module V1
    class ChatsController < BaseController
      before_action :set_chat, only: %i[show update destroy]

      def index
        chats = Chat.includes(:users).order(created_at: :desc)

        render json: chats.as_json(
          include: {
            users: { only: %i[id username email status] }
          }
        )
      end

      def show
        render json: @chat.as_json(
          include: {
            users: { only: %i[id username email status] }
          }
        )
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
    end
  end
end
