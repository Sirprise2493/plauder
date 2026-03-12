# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_03_12_182754) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "call_participants", force: :cascade do |t|
    t.bigint "call_id", null: false
    t.bigint "user_id", null: false
    t.integer "state", default: 0, null: false
    t.boolean "camera_enabled", default: false, null: false
    t.boolean "mic_enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_id", "user_id"], name: "index_call_participants_on_call_id_and_user_id", unique: true
    t.index ["call_id"], name: "index_call_participants_on_call_id"
    t.index ["state"], name: "index_call_participants_on_state"
    t.index ["user_id"], name: "index_call_participants_on_user_id"
  end

  create_table "calls", force: :cascade do |t|
    t.bigint "chat_id", null: false
    t.bigint "initiator_id", null: false
    t.integer "call_type", null: false
    t.integer "status", default: 0, null: false
    t.datetime "started_at"
    t.datetime "ended_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["call_type"], name: "index_calls_on_call_type"
    t.index ["chat_id", "created_at"], name: "index_calls_on_chat_id_and_created_at"
    t.index ["chat_id"], name: "index_calls_on_chat_id"
    t.index ["initiator_id", "created_at"], name: "index_calls_on_initiator_id_and_created_at"
    t.index ["initiator_id"], name: "index_calls_on_initiator_id"
    t.index ["status"], name: "index_calls_on_status"
  end

  create_table "chat_memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "chat_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id", "user_id"], name: "index_chat_memberships_on_chat_id_and_user_id", unique: true
    t.index ["chat_id"], name: "index_chat_memberships_on_chat_id"
    t.index ["user_id"], name: "index_chat_memberships_on_user_id"
  end

  create_table "chats", force: :cascade do |t|
    t.integer "chat_type", default: 0, null: false
    t.string "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_type"], name: "index_chats_on_chat_type"
  end

  create_table "friendships", force: :cascade do |t|
    t.bigint "requester_id", null: false
    t.bigint "receiver_id", null: false
    t.integer "friendship_status", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["friendship_status"], name: "index_friendships_on_friendship_status"
    t.index ["receiver_id"], name: "index_friendships_on_receiver_id"
    t.index ["requester_id", "receiver_id"], name: "index_friendships_on_requester_id_and_receiver_id", unique: true
    t.index ["requester_id"], name: "index_friendships_on_requester_id"
    t.check_constraint "requester_id <> receiver_id", name: "friendships_requester_receiver_different"
  end

  create_table "message_ai_corrections", force: :cascade do |t|
    t.bigint "message_id", null: false
    t.text "message_corrected_by_ai", null: false
    t.integer "ai_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_type"], name: "index_message_ai_corrections_on_ai_type"
    t.index ["message_id"], name: "index_message_ai_corrections_on_message_id", unique: true
  end

  create_table "message_attachments", force: :cascade do |t|
    t.bigint "message_id", null: false
    t.string "filename", null: false
    t.integer "file_type", null: false
    t.integer "durations_ms"
    t.bigint "byte_size"
    t.integer "width"
    t.integer "height"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["file_type"], name: "index_message_attachments_on_file_type"
    t.index ["filename"], name: "index_message_attachments_on_filename"
    t.index ["message_id"], name: "index_message_attachments_on_message_id"
  end

  create_table "message_warnings", force: :cascade do |t|
    t.bigint "message_id", null: false
    t.text "response_of_ai"
    t.boolean "dangerous_message", default: false, null: false
    t.integer "ai_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_type"], name: "index_message_warnings_on_ai_type"
    t.index ["dangerous_message"], name: "index_message_warnings_on_dangerous_message"
    t.index ["message_id", "created_at"], name: "index_message_warnings_on_message_id_and_created_at"
    t.index ["message_id"], name: "index_message_warnings_on_message_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "chat_id", null: false
    t.integer "message_type", default: 0, null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "draft", default: false, null: false
    t.index ["chat_id", "created_at"], name: "index_messages_on_chat_id_and_created_at"
    t.index ["chat_id", "draft", "created_at"], name: "index_messages_on_chat_id_and_draft_and_created_at"
    t.index ["chat_id"], name: "index_messages_on_chat_id"
    t.index ["message_type"], name: "index_messages_on_message_type"
    t.index ["sender_id", "created_at"], name: "index_messages_on_sender_id_and_created_at"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.integer "status", default: 0, null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "call_participants", "calls"
  add_foreign_key "call_participants", "users"
  add_foreign_key "calls", "chats"
  add_foreign_key "calls", "users", column: "initiator_id"
  add_foreign_key "chat_memberships", "chats"
  add_foreign_key "chat_memberships", "users"
  add_foreign_key "friendships", "users", column: "receiver_id"
  add_foreign_key "friendships", "users", column: "requester_id"
  add_foreign_key "message_ai_corrections", "messages"
  add_foreign_key "message_attachments", "messages"
  add_foreign_key "message_warnings", "messages"
  add_foreign_key "messages", "chats"
  add_foreign_key "messages", "users", column: "sender_id"
end
