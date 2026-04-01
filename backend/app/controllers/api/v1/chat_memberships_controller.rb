module Api
  module V1
    class ChatMembershipsController < BaseController
      before_action :authenticate_user!
      before_action :set_chat
      before_action :ensure_chat_member!

      def index
        memberships = @chat.chat_memberships.includes(:user).order(:id)

        render json: memberships.map { |membership| serialize_membership(membership) }
      end

      def create
        if @chat.direct?
          return render json: { error: "Mitglieder können nur zu Gruppenchats hinzugefügt werden" }, status: :unprocessable_entity
        end

        user_to_add = User.find(chat_membership_params[:user_id])

        if @chat.users.exists?(id: user_to_add.id)
          return render json: { error: "User ist bereits Mitglied im Gruppenchat" }, status: :unprocessable_entity
        end

        unless accepted_friend_of_current_user?(user_to_add.id)
          return render json: { error: "Du kannst nur deine Freunde hinzufügen" }, status: :forbidden
        end

        membership = @chat.chat_memberships.new(user: user_to_add)
        membership.save!

        render json: serialize_membership(membership), status: :created
      end

      def destroy
        membership = @chat.chat_memberships.find(params[:id])

        if @chat.direct?
          return render json: { error: "Direktchats können nicht verlassen werden" }, status: :unprocessable_entity
        end

        unless membership.user_id == current_user.id
          return render json: { error: "Du kannst nur dich selbst aus dem Gruppenchat entfernen" }, status: :forbidden
        end

        membership.destroy!

        @chat.destroy! if @chat.chat_memberships.reload.empty?

        head :no_content
      end

      private

      def set_chat
        @chat = Chat.find(params[:chat_id])
      end

      def ensure_chat_member!
        return if @chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def chat_membership_params
        params.require(:chat_membership).permit(:user_id)
      end

      def accepted_friend_of_current_user?(other_user_id)
        Friendship
          .where(friendship_status: :accepted, active: true)
          .where(
            "(requester_id = :current_user_id AND receiver_id = :other_user_id) OR (requester_id = :other_user_id AND receiver_id = :current_user_id)",
            current_user_id: current_user.id,
            other_user_id: other_user_id
          )
          .exists?
      end

      def serialize_membership(membership)
        {
          id: membership.id,
          chat_id: membership.chat_id,
          user_id: membership.user_id,
          created_at: membership.created_at,
          updated_at: membership.updated_at,
          user: {
            id: membership.user.id,
            username: membership.user.username,
            email: membership.user.email,
            status: membership.user.status,
            avatar_url: avatar_url_for(membership.user)
          }
        }
      end
    end
  end
end
