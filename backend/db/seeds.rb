today = Date.current
words = [
  {word: "hello", date: today},
  {word: "world", date: today + 1},
  {word: "react", date: today + 2},
  {word: "rails", date: today + 3},
  {word: "query", date: today + 4}
]
words.each do |attrs|
  Word.find_or_create_by!(word: attrs[:word]) do |w|
    w.date = attrs[:date]
  end
end
