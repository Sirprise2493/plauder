module Api
  module V1
    class ChatMembershipsController < BaseController
      before_action :set_chat

      def index
        memberships = @chat.chat_memberships.includes(:user).order(:id)

        render json: memberships.as_json(
          include: {
            user: { only: %i[id username email status] }
          }
        )
      end

      def create
        membership = @chat.chat_memberships.new(chat_membership_params)
        membership.save!
        render json: membership, status: :created
      end

      def destroy
        membership = @chat.chat_memberships.find(params[:id])
        membership.destroy!
        head :no_content
      end

      private

      def set_chat
        @chat = Chat.find(params[:chat_id])
      end

      def chat_membership_params
        params.require(:chat_membership).permit(:user_id)
      end
    end
  end
end
