module Api
  class PuzzleController < ApplicationController
    def today
      puzzle = Puzzle.for_date!(Date.current)

      render json: {
        date: puzzle.date.to_s,
        puzzle: {
          vertical: puzzle.vertical,
          horizontal: puzzle.horizontal,
          order: puzzle.order
        }
      }
    end
  end
end
