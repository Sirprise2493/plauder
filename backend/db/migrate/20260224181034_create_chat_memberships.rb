class CreateChatMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :chat_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :chat, null: false, foreign_key: true

      t.timestamps
    end

    add_index :chat_memberships, [:chat_id, :user_id], unique: true
  end
end
