module Api
  module V1
    class CallsController < BaseController
      before_action :set_chat, only: %i[index create]
      before_action :set_call, only: %i[show update]

      def index
        calls = @chat.calls
                     .includes(:initiator, call_participants: :user)
                     .order(created_at: :desc)

        render json: calls.as_json(
          include: {
            initiator: { only: %i[id username email status] },
            call_participants: {
              include: {
                user: { only: %i[id username email status] }
              }
            }
          }
        )
      end

      def show
        render json: @call.as_json(
          include: {
            initiator: { only: %i[id username email status] },
            call_participants: {
              include: {
                user: { only: %i[id username email status] }
              }
            }
          }
        )
      end

      def create
        call = @chat.calls.new(call_params)
        call.save!
        render json: call, status: :created
      end

      def update
        @call.update!(call_params)
        render json: @call
      end

      private

      def set_chat
        @chat = Chat.find(params[:chat_id])
      end

      def set_call
        @call = Call.find(params[:id])
      end

      def call_params
        params.require(:call).permit(
          :initiator_id,
          :call_type,
          :status,
          :started_at,
          :ended_at
        )
      end
    end
  end
end
