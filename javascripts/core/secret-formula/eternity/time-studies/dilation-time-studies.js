GameDatabase.eternity.timeStudies.dilation = [
  {
    id: 1,
    description: "Unlock time dilation",
    cost: 5000,
    requirement: () => {
      if (!Perk.bypassECDilation.isBought) {
        if (!EternityChallenge(11).isFullyCompleted ||
          !EternityChallenge(12).isFullyCompleted ||
          player.timestudy.theorem.plus(calculateTimeStudiesCost()).lt(13000)) return false;
      }
      return [231, 232, 233, 234].some(id => TimeStudy(id).isBought);
    },
    formatCost: value => value.toString()
  },
  {
    id: 2,
    description: "Unlock the 5th Time Dimension",
    cost: 1000000,
    requirement: () => TimeStudy.dilation.isBought,
    formatCost: shortenSmallInteger
  },
  {
    id: 3,
    description: "Unlock the 6th Time Dimension",
    cost: 10000000,
    requirement: () => TimeStudy.timeDimension(5).isBought,
    formatCost: shortenSmallInteger
  },
  {
    id: 4,
    description: "Unlock the 7th Time Dimension",
    cost: 100000000,
    requirement: () => TimeStudy.timeDimension(6).isBought,
    formatCost: shortenSmallInteger
  },
  {
    id: 5,
    description: "Unlock the 8th Time Dimension",
    cost: 1000000000,
    requirement: () => TimeStudy.timeDimension(7).isBought,
    formatCost: shortenSmallInteger
  },
  {
    id: 6,
    description: "Unlock reality",
    cost: () => (player.realities > 0 ? 0 : 5000000000),
    requirement: () => TimeStudy.timeDimension(8).isBought &&
      player.eternityPoints.gte(Decimal.fromMantissaExponent_noNormalize(1, 4000)),
    formatCost: shortenSmallInteger
  }
];