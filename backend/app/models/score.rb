class Score < ApplicationRecord
  belongs_to :word
  validates :player_name, presence: true
  validates :attempts, presence: true
end
