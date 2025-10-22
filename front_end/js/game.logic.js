function canFlip(attackerCard, defenderCard, direction) {
  if (!attackerCard || !defenderCard) return false;

  const strengthMap = {
    up: ['strengthUp', 'strengthDown'],
    down: ['strengthDown', 'strengthUp'],
    left: ['strengthLeft', 'strengthRight'],
    right: ['strengthRight', 'strengthLeft'],
  };

  const map = strengthMap[direction];
  if (!map) {
    throw new Error('Invalid direction: ' + direction);
  }

  const [attackerStat, defenderStat] = map;
  return attackerCard[attackerStat] > defenderCard[defenderStat];
}

module.exports = {
  canFlip,
};