module Api
  module V1
    class CallsController < BaseController
      before_action :authenticate_user!
      before_action :set_chat, only: %i[index create]
      before_action :set_call, only: %i[show update]
      before_action :authorize_chat_membership!, only: %i[index create]
      before_action :authorize_call_access!, only: %i[show update]

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
        call = nil

        Call.transaction do
          call = @chat.calls.create!(
            initiator: current_user,
            call_type: permitted_call_type,
            status: permitted_status,
            started_at: permitted_started_at,
            ended_at: permitted_ended_at
          )

          @chat.users.each do |user|
            call.call_participants.create!(
              user: user,
              state: user.id == current_user.id ? :joined : :invited,
              camera_enabled: call.video? && user.id == current_user.id,
              mic_enabled: user.id == current_user.id
            )
          end
        end

        render json: call.as_json(
          include: {
            initiator: { only: %i[id username email status] },
            call_participants: {
              include: {
                user: { only: %i[id username email status] }
              }
            }
          }
        ), status: :created
      end

      def update
        @call.update!(call_update_params)
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

      private

      def set_chat
        @chat = Chat.includes(:users).find(params[:chat_id])
      end

      def set_call
        @call = Call.includes(:chat, :initiator, call_participants: :user).find(params[:id])
      end

      def authorize_chat_membership!
        return if @chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def authorize_call_access!
        return if @call.chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def create_call_params
        params.require(:call).permit(:call_type, :status, :started_at, :ended_at)
      end

      def call_update_params
        params.require(:call).permit(:call_type, :status, :started_at, :ended_at)
      end

      def permitted_call_type
        create_call_params[:call_type].presence || "audio"
      end

      def permitted_status
        create_call_params[:status].presence || "ongoing"
      end

      def permitted_started_at
        create_call_params[:started_at].presence || Time.current
      end

      def permitted_ended_at
        create_call_params[:ended_at]
      end
    end
  end
end
