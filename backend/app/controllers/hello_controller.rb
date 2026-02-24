class HelloController < ApplicationController
  def index
    render json: { message: "Hallo von Rails + PostgreSQL API!" }
  end
end
