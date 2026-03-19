module Api
  class WordleController < ApplicationController
    def today
      word = today_word
      return unless word

      render json: {id: word.id, length: word.word.length, date: word.date.to_s}
    end

    def guess
      word = today_word
      return unless word

      guess_text = params[:guess]
      unless guess_text.is_a?(String) && guess_text.length == word.word.length
        render plain: "guess must be the same length as the word", status: :bad_request
        return
      end

      result = evaluate_guess(word.word, guess_text)
      correct = guess_text == word.word

      render json: {result: result, correct: correct}
    end

    def submit_score
      word = today_word
      return unless word

      score = word.scores.create!(
        player_name: params[:player_name],
        attempts: params[:attempts],
        solved: params[:solved] || false
      )

      render json: score, status: :created
    end

    def scores
      word = today_word
      return unless word

      scores = word.scores.order(:attempts)
      render json: scores
    end

    private

    def today_word
      word = Word.find_by(date: Date.current)
      unless word
        render plain: "no word set for today", status: :not_found
        return nil
      end
      word
    end

    # Port of the Go evaluateGuess function
    # "correct" = right letter, right position
    # "present" = right letter, wrong position
    # "absent"  = letter not in word
    def evaluate_guess(answer, guess)
      answer_chars = answer.chars
      guess_chars = guess.chars
      n = answer_chars.length
      result = Array.new(n)
      used = Array.new(n, false)

      n.times do |i|
        if guess_chars[i] == answer_chars[i]
          result[i] = "correct"
          used[i] = true
        end
      end

      n.times do |i|
        next if result[i] == "correct"

        found = false
        n.times do |j|
          if !used[j] && guess_chars[i] == answer_chars[j]
            result[i] = "present"
            used[j] = true
            found = true
            break
          end
        end
        result[i] = "absent" unless found
      end

      result
    end
  end
end
