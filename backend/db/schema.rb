# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_19_000002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "scores", force: :cascade do |t|
    t.integer "attempts", null: false
    t.datetime "created_at", null: false
    t.string "player_name", null: false
    t.boolean "solved", default: false, null: false
    t.datetime "updated_at", null: false
    t.bigint "word_id", null: false
    t.index ["word_id"], name: "index_scores_on_word_id"
  end

  create_table "words", force: :cascade do |t|
    t.date "date", null: false
    t.string "word", null: false
    t.index ["date"], name: "index_words_on_date", unique: true
    t.index ["word"], name: "index_words_on_word", unique: true
  end

  add_foreign_key "scores", "words"
end
