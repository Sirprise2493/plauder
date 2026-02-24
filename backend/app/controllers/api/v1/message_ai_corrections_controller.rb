module Api
  module V1
    class MessageAiCorrectionsController < BaseController
      before_action :set_message

      def show
        correction = @message.message_ai_correction

        if correction
          render json: correction
        else
          render json: { error: "AI correction not found for this message" }, status: :not_found
        end
      end

      def create
        if @message.message_ai_correction.present?
          return render json: { error: "AI correction already exists for this message" }, status: :unprocessable_entity
        end

        correction = @message.build_message_ai_correction(message_ai_correction_params)
        correction.save!
        render json: correction, status: :created
      end

      def update
        correction = @message.message_ai_correction
        raise ActiveRecord::RecordNotFound, "AI correction not found for this message" unless correction

        correction.update!(message_ai_correction_params)
        render json: correction
      end

      def destroy
        correction = @message.message_ai_correction
        raise ActiveRecord::RecordNotFound, "AI correction not found for this message" unless correction

        correction.destroy!
        head :no_content
      end

      private

      def set_message
        @message = Message.find(params[:message_id])
      end

      def message_ai_correction_params
        params.require(:message_ai_correction).permit(:message_corrected_by_ai, :ai_type)
      end
    end
  end
end
