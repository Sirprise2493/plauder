class CreateMessageWarnings < ActiveRecord::Migration[7.1]
  def change
    create_table :message_warnings do |t|
      t.references :message, null: false, foreign_key: true
      t.text :response_of_ai
      t.boolean :dangerous_message, null: false, default: false
      t.integer :ai_type, null: false

      t.timestamps
    end

    add_index :message_warnings, :ai_type
    add_index :message_warnings, :dangerous_message
    add_index :message_warnings, [:message_id, :created_at]
  end
end
