class CreateMessageAttachments < ActiveRecord::Migration[7.1]
  def change
    create_table :message_attachments do |t|
      t.references :message, null: false, foreign_key: true
      t.string :filename, null: false
      t.integer :file_type, null: false
      t.integer :durations_ms
      t.bigint :byte_size
      t.integer :width
      t.integer :height

      t.timestamps
    end

    add_index :message_attachments, :file_type
    add_index :message_attachments, :filename
  end
end
