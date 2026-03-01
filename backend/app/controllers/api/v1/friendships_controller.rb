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

        render json: friendships.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
      end

      def received_requests
        friendships = Friendship
          .includes(:requester, :receiver)
          .where(receiver_id: current_user.id, friendship_status: :pending, active: true)
          .order(created_at: :desc)

        render json: friendships.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
      end

      def show
        authorize_friendship!

        render json: @friendship.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
      end

      def create
        friendship = Friendship.new(friendship_params.except(:requester_id, :friendship_status, :active))
        friendship.requester = current_user
        friendship.friendship_status = :pending
        friendship.active = true
        friendship.save!

        render json: friendship.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        ), status: :created
      end

      def update
        authorize_friendship!

        # Nur der Receiver darf annehmen/ablehnen
        unless @friendship.receiver_id == current_user.id
          return render json: { error: "Nicht erlaubt" }, status: :forbidden
        end

        @friendship.update!(update_friendship_params)

        render json: @friendship.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
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
    end
  end
end
