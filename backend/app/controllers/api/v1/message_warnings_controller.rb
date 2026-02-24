module Api
  module V1
    class MessageWarningsController < BaseController
      before_action :set_message
      before_action :set_warning, only: %i[show update destroy]

      def index
        render json: @message.message_warnings.order(created_at: :desc)
      end

      def show
        render json: @warning
      end

      def create
        warning = @message.message_warnings.new(message_warning_params)
        warning.save!
        render json: warning, status: :created
      end

      def update
        @warning.update!(message_warning_params)
        render json: @warning
      end

      def destroy
        @warning.destroy!
        head :no_content
      end

      private

      def set_message
        @message = Message.find(params[:message_id])
      end

      def set_warning
        @warning = @message.message_warnings.find(params[:id])
      end

      def message_warning_params
        params.require(:message_warning).permit(:response_of_ai, :dangerous_message, :ai_type)
      end
    end
  end
end
