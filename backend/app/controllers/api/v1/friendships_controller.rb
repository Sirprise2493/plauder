module Api
  module V1
    class FriendshipsController < BaseController
      before_action :authenticate_user!
      before_action :set_friendship, only: %i[show update destroy]

      def index
        friendships = Friendship
          .includes(:requester, :receiver)
          .where(
            "requester_id = :user_id OR receiver_id = :user_id",
            user_id: current_user.id
          )
          .where(friendship_status: :accepted, active: true)
          .order(created_at: :desc)

        render json: friendships.map { |friendship| serialize_friendship(friendship) }
      end

      def received_requests
        friendships = Friendship
          .includes(:requester, :receiver)
          .where(receiver_id: current_user.id, friendship_status: :pending, active: true)
          .order(created_at: :desc)

        render json: friendships.map { |friendship| serialize_friendship(friendship) }
      end

      def show
        authorize_friendship!

        render json: serialize_friendship(@friendship)
      end

      def create
        receiver_id = friendship_params[:receiver_id]

        existing_friendship = Friendship.find_by(
          requester_id: current_user.id,
          receiver_id: receiver_id
        )

        reverse_friendship = Friendship.find_by(
          requester_id: receiver_id,
          receiver_id: current_user.id
        )

        if existing_friendship&.rejected?
          existing_friendship.update!(
            friendship_status: :pending,
            active: true
          )

          return render json: serialize_friendship(existing_friendship.reload), status: :created
        end

        if reverse_friendship&.rejected?
          reverse_friendship.update!(
            requester_id: current_user.id,
            receiver_id: receiver_id,
            friendship_status: :pending,
            active: true
          )

          return render json: serialize_friendship(reverse_friendship.reload), status: :created
        end

        friendship = Friendship.new(friendship_params.except(:requester_id, :friendship_status, :active))
        friendship.requester = current_user
        friendship.friendship_status = :pending
        friendship.active = true
        friendship.save!

        render json: serialize_friendship(friendship.reload), status: :created
      end

      def update
        authorize_friendship!

        unless @friendship.receiver_id == current_user.id
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        @friendship.update!(update_friendship_params)

        render json: serialize_friendship(@friendship.reload)
      end

      def destroy
        authorize_friendship!
        @friendship.destroy!
        head :no_content
      end

      private

      def set_friendship
        @friendship = Friendship.find(params[:id])
      end

      def authorize_friendship!
        return if @friendship.requester_id == current_user.id || @friendship.receiver_id == current_user.id

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def friendship_params
        params.require(:friendship).permit(
          :requester_id,
          :receiver_id,
          :friendship_status,
          :active
        )
      end

      def update_friendship_params
        params.require(:friendship).permit(:friendship_status)
      end

      def serialize_friendship(friendship)
        {
          id: friendship.id,
          requester_id: friendship.requester_id,
          receiver_id: friendship.receiver_id,
          friendship_status: friendship.friendship_status,
          active: friendship.active,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
          requester: serialize_user(friendship.requester),
          receiver: serialize_user(friendship.receiver)
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
    end
  end
end
