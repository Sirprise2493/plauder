class CreateCallParticipants < ActiveRecord::Migration[7.1]
  def change
    create_table :call_participants do |t|
      t.references :call, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :state, null: false, default: 0
      t.boolean :camera_enabled, null: false, default: false
      t.boolean :mic_enabled, null: false, default: true

      t.timestamps
    end

    add_index :call_participants, [:call_id, :user_id], unique: true
    add_index :call_participants, :state
  end
end
