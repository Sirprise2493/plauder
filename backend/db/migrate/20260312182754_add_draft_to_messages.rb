class AddDraftToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :draft, :boolean, null: false, default: false
    add_index :messages, [:chat_id, :draft, :created_at]
  end
end
