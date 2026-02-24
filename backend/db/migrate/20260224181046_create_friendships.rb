class CreateFriendships < ActiveRecord::Migration[7.1]
  def change
    create_table :friendships do |t|
      t.references :requester, null: false, foreign_key: { to_table: :users }
      t.references :receiver, null: false, foreign_key: { to_table: :users }
      t.integer :friendship_status, null: false, default: 0
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :friendships, [:requester_id, :receiver_id], unique: true
    add_index :friendships, :friendship_status
    add_check_constraint :friendships, "requester_id <> receiver_id", name: "friendships_requester_receiver_different"
  end
end
