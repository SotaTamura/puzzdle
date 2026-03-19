class Word < ApplicationRecord
  has_many :scores
  validates :word, presence: true, uniqueness: true
  validates :date, presence: true, uniqueness: true
end
