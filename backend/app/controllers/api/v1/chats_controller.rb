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
          .left_joins(:messages)
          .where(chat_memberships: { user_id: current_user.id })
          .select("chats.*, MAX(messages.created_at) AS last_message_at")
          .group("chats.id")
          .order(Arel.sql("COALESCE(MAX(messages.created_at), chats.created_at) DESC"))
          .limit(5)

        render json: chats.map { |chat| serialize_recent_chat(chat) }
      end

      def direct_with
        other_user = User.find(params[:user_id])

        friendship_exists = Friendship.where(
          friendship_status: :accepted,
          active: true
        ).where(
          "(requester_id = :current_user_id AND receiver_id = :other_user_id) OR (requester_id = :other_user_id AND receiver_id = :current_user_id)",
          current_user_id: current_user.id,
          other_user_id: other_user.id
        ).exists?

        unless friendship_exists
          return render json: { error: "Keine akzeptierte Freundschaft gefunden" }, status: :forbidden
        end

        chat = find_direct_chat_between(current_user, other_user)
        chat ||= create_direct_chat_between!(current_user, other_user)

        render json: serialize_chat(chat)
      end

      def show
        unless @chat.users.exists?(id: current_user.id)
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        render json: serialize_chat(@chat)
      end

      def create
        if chat_params[:chat_type] == "group_chat"
          return create_group_chat!
        end

        render json: { error: "Direktchats bitte über /chats/direct_with/:user_id erstellen" }, status: :unprocessable_entity
      end

      def update
        unless @chat.users.exists?(id: current_user.id)
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        @chat.update!(chat_params.except(:user_ids))
        render json: serialize_chat(@chat)
      end

      def destroy
        unless @chat.users.exists?(id: current_user.id)
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        @chat.destroy!
        head :no_content
      end

      private

      def set_chat
        @chat = Chat.find(params[:id])
      end

      def chat_params
        params.require(:chat).permit(:chat_type, :title, user_ids: [])
      end

      def create_group_chat!
        selected_user_ids = Array(chat_params[:user_ids]).map(&:to_i).uniq - [current_user.id]

        if selected_user_ids.empty?
          return render json: { error: "Mindestens ein Freund muss ausgewählt werden" }, status: :unprocessable_entity
        end

        friend_ids = Friendship
          .where(friendship_status: :accepted, active: true)
          .where(
            "(requester_id = :current_user_id AND receiver_id IN (:selected_ids)) OR (receiver_id = :current_user_id AND requester_id IN (:selected_ids))",
            current_user_id: current_user.id,
            selected_ids: selected_user_ids
          )
          .pluck(:requester_id, :receiver_id)
          .flatten
          .uniq - [current_user.id]

        invalid_ids = selected_user_ids - friend_ids
        if invalid_ids.any?
          return render json: { error: "Es können nur Freunde hinzugefügt werden" }, status: :forbidden
        end

        chat = nil

        Chat.transaction do
          chat = Chat.create!(
            chat_type: :group_chat,
            title: chat_params[:title]
          )

          ChatMembership.create!(chat: chat, user: current_user)

          selected_user_ids.each do |user_id|
            ChatMembership.create!(chat: chat, user_id: user_id)
          end
        end

        render json: serialize_chat(chat.reload), status: :created
      end

      def serialize_chat(chat)
        {
          id: chat.id,
          chat_type: chat.chat_type,
          title: chat.title,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          users: chat.users.map { |user| serialize_user(user) }
        }
      end

      def serialize_recent_chat(chat)
        last_message = chat.messages.max_by(&:created_at)
        other_user = chat.direct? ? chat.users.find { |user| user.id != current_user.id } : nil

        {
          id: chat.id,
          chat_type: chat.chat_type,
          title: chat.title,
          display_name: chat.direct? ? other_user&.username : chat.title,
          last_message: serialize_last_message(last_message),
          users: chat.users.map { |user| serialize_user(user) }
        }
      end

      def serialize_last_message(message)
        return nil unless message

        {
          id: message.id,
          content: message.content,
          message_type: message.message_type,
          created_at: message.created_at,
          sender: serialize_user(message.sender)
        }
      end

      def serialize_user(user)
        {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
          avatar_url: avatar_url_for(user)
        }
      end

      def find_direct_chat_between(user_a, user_b)
        Chat
          .includes(:users)
          .joins(:chat_memberships)
          .where(chat_type: :direct)
          .where(chat_memberships: { user_id: [user_a.id, user_b.id] })
          .group("chats.id")
          .having("COUNT(DISTINCT chat_memberships.user_id) = 2")
          .first
      end

      def create_direct_chat_between!(user_a, user_b)
        Chat.transaction do
          chat = Chat.create!(chat_type: :direct)
          ChatMembership.create!(chat: chat, user: user_a)
          ChatMembership.create!(chat: chat, user: user_b)
          chat
        end
      end
    end
  end
end
