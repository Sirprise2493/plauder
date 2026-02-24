class CreateCalls < ActiveRecord::Migration[7.1]
  def change
    create_table :calls do |t|
      t.references :chat, null: false, foreign_key: true
      t.references :initiator, null: false, foreign_key: { to_table: :users }
      t.integer :call_type, null: false
      t.integer :status, null: false, default: 0
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end

    add_index :calls, :call_type
    add_index :calls, :status
    add_index :calls, [:chat_id, :created_at]
    add_index :calls, [:initiator_id, :created_at]
  end
end
