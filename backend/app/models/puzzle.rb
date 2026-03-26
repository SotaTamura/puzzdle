W = 5;
H = 5;

class Puzzle < ApplicationRecord
  validates :date, presence: true, uniqueness: true
  validates :vertical, presence: true
  validates :horizontal, presence: true
  validates :order, presence: true

  def self.for_date!(date)
    find_by(date:) || create!(date:, **generate_attributes_for(date))
  rescue ActiveRecord::RecordNotUnique
    find_by!(date:)
  end

  def self.generate_attributes_for(date)
    rng = Random.new(date.strftime("%Y%m%d").to_i)

    {
      vertical: rng.rand(2 ** ((W - 1) * H) - 1),
      horizontal: rng.rand(2 ** (W * (H - 1)) - 1),
      order: (0..W * H - 1).to_a.shuffle(random: rng)
    }
  end
end
