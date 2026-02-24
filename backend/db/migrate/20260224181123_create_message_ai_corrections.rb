class CreateMessageAiCorrections < ActiveRecord::Migration[7.1]
  def change
    create_table :message_ai_corrections do |t|
      t.references :message, null: false, foreign_key: true, index: false
      t.text :message_corrected_by_ai, null: false
      t.integer :ai_type, null: false

      t.timestamps
    end

    add_index :message_ai_corrections, :message_id, unique: true
    add_index :message_ai_corrections, :ai_type
  end
end
