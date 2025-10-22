const { canFlip } = require('../front_end/js/game.logic.js');

describe('canFlip', () => {
  test('returns true when attacker has higher opposing stat', () => {
    const attacker = { strengthRight: 5 };
    const defender = { strengthLeft: 3 };
    expect(canFlip(attacker, defender, 'right')).toBe(true);
  });

  test('returns false when equal strengths', () => {
    const attacker = { strengthRight: 3 };
    const defender = { strengthLeft: 3 };
    expect(canFlip(attacker, defender, 'right')).toBe(false);
  });

  test('returns false when defender missing', () => {
    expect(canFlip({ strengthRight: 5 }, null, 'right')).toBe(false);
  });

  test('throws on invalid direction', () => {
    expect(() => canFlip({ strengthUp: 1 }, { strengthDown: 1 }, 'diagonal')).toThrow();
  });
});
