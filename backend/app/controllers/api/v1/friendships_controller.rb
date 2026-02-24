module Api
  module V1
    class FriendshipsController < BaseController
      before_action :set_friendship, only: %i[show update destroy]

      def index
        friendships = Friendship.includes(:requester, :receiver).order(created_at: :desc)

        render json: friendships.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
      end

      def show
        render json: @friendship.as_json(
          include: {
            requester: { only: %i[id username email status] },
            receiver:  { only: %i[id username email status] }
          }
        )
      end

      def create
        friendship = Friendship.new(friendship_params)
        friendship.save!
        render json: friendship, status: :created
      end

      def update
        @friendship.update!(friendship_params)
        render json: @friendship
      end

      def destroy
        @friendship.destroy!
        head :no_content
      end

      private

      def set_friendship
        @friendship = Friendship.find(params[:id])
      end

      def friendship_params
        params.require(:friendship).permit(
          :requester_id,
          :receiver_id,
          :friendship_status,
          :active
        )
      end
    end
  end
end
