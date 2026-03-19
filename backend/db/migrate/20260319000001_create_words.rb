class CreateWords < ActiveRecord::Migration[8.0]
  def change
    create_table :words do |t|
      t.string :word, null: false
      t.date :date, null: false
    end
    add_index :words, :word, unique: true
    add_index :words, :date, unique: true
  end
end
