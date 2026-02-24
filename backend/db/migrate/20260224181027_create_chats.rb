class CreateChats < ActiveRecord::Migration[7.1]
  def change
    create_table :chats do |t|
      t.integer :chat_type, null: false, default: 0
      t.string :title

      t.timestamps
    end

    add_index :chats, :chat_type
  end
end
