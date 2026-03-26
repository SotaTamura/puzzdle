class CreatePuzzles < ActiveRecord::Migration[8.1]
  def change
    create_table :puzzles do |t|
      t.date :date, null: false
      t.integer :vertical, default: 0, null: false
      t.integer :horizontal, default: 0, null: false
      t.integer :order, array: true, default: [], null: false
      t.timestamps
    end

    add_index :puzzles, :date, unique: true
  end
end
