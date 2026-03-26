Puzzle.upsert(
  {
    date: Date.current,
    **Puzzle.generate_attributes_for(Date.current),
    created_at: Time.current,
    updated_at: Time.current
  },
  unique_by: :index_puzzles_on_date
)
