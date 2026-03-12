module Api
  module V1
    class MessageAiCorrectionsController < BaseController
      before_action :authenticate_user!
      before_action :set_message
      before_action :ensure_chat_member!
      before_action :ensure_message_owner!

      def show
        correction = @message.message_ai_correction

        if correction
          render json: correction
        else
          render json: { error: "AI correction not found for this message" }, status: :not_found
        end
      end

      def create
        unless @message.text?
          return render json: { error: "AI-Korrektur ist nur für Textnachrichten erlaubt" }, status: :unprocessable_entity
        end

        if @message.content.blank?
          return render json: { error: "Kein Text zur Korrektur vorhanden" }, status: :unprocessable_entity
        end

        result = OpenAi::TextImproverClient.improve_text!(@message.content)

        correction = @message.message_ai_correction || @message.build_message_ai_correction
        was_new_record = correction.new_record?

        correction.message_corrected_by_ai = result[:corrected_text]
        correction.ai_type = :rewrite
        correction.save!

        render json: correction, status: (was_new_record ? :created : :ok)
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

      def ensure_chat_member!
        return if @message.chat.users.exists?(id: current_user.id)

        render json: { error: "Nicht erlaubt" }, status: :forbidden
      end

      def ensure_message_owner!
        return if @message.sender_id == current_user.id

        render json: { error: "Du darfst nur deine eigenen AI-Korrekturen verwalten" }, status: :forbidden
      end

      def message_ai_correction_params
        params.require(:message_ai_correction).permit(:message_corrected_by_ai, :ai_type)
      end
    end
  end
end
