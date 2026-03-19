class CreateScores < ActiveRecord::Migration[8.0]
  def change
    create_table :scores do |t|
      t.string :player_name, null: false
      t.references :word, null: false, foreign_key: true
      t.integer :attempts, null: false
      t.boolean :solved, null: false, default: false
      t.timestamps
    end
  end
end
