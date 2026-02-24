module Api
  module V1
    class CallParticipantsController < BaseController
      before_action :set_call
      before_action :set_call_participant, only: %i[show update destroy]

      def index
        participants = @call.call_participants.includes(:user).order(:id)

        render json: participants.as_json(
          include: {
            user: { only: %i[id username email status] }
          }
        )
      end

      def show
        render json: @call_participant.as_json(
          include: {
            user: { only: %i[id username email status] }
          }
        )
      end

      def create
        participant = @call.call_participants.new(call_participant_params)
        participant.save!
        render json: participant, status: :created
      end

      def update
        @call_participant.update!(call_participant_params)
        render json: @call_participant
      end

      def destroy
        @call_participant.destroy!
        head :no_content
      end

      private

      def set_call
        @call = Call.find(params[:call_id])
      end

      def set_call_participant
        @call_participant = @call.call_participants.find(params[:id])
      end

      def call_participant_params
        params.require(:call_participant).permit(
          :user_id,
          :state,
          :camera_enabled,
          :mic_enabled
        )
      end
    end
  end
end
