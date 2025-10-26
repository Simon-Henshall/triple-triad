import GameLogic from "../front_end/js/game/game.logic.js";
const logic = new GameLogic();

describe("canFlip", () => {
  test("returns true when attacker has higher opposing stat", () => {
    const attacker = { strengthRight: 5 };
    const defender = { strengthLeft: 3 };
    expect(logic.canFlip(attacker, defender, "right")).toBe(true);
  });

  test("returns false when equal strengths", () => {
    const attacker = { strengthRight: 3 };
    const defender = { strengthLeft: 3 };
    expect(logic.canFlip(attacker, defender, "right")).toBe(false);
  });

  test("returns false when defender missing", () => {
    expect(logic.canFlip({ strengthRight: 5 }, null, "right")).toBe(false);
  });

  test("throws on invalid direction", () => {
    expect(() =>
      logic.canFlip({ strengthUp: 1 }, { strengthDown: 1 }, "diagonal")
    ).toThrow();
  });
});

describe("getFlippableNeighbours", () => {
  const A = (stats = {}) => ({ owner: "A", ...stats });
  const B = (stats = {}) => ({ owner: "B", ...stats });

  test("flips a weaker enemy on the right", () => {
    const board = [[A({ strengthRight: 5 }), B({ strengthLeft: 3 })]];
    const flips = logic.getFlippableNeighbours(board, 0, 0);
    expect(flips).toEqual([{ x: 1, y: 0 }]);
  });

  test("does not flip same-owner cards", () => {
    const board = [[A({ strengthRight: 5 }), A({ strengthLeft: 3 })]];
    expect(logic.getFlippableNeighbours(board, 0, 0)).toEqual([]);
  });

  test("ignores empty spaces and boundaries", () => {
    const board = [[A({ strengthRight: 5 }), null]];
    expect(logic.getFlippableNeighbours(board, 0, 0)).toEqual([]);
  });

  test("handles multiple directions (up, down, left, right)", () => {
    const board = [
      [null, B({ owner: "B", strengthDown: 2 }), null],
      [
        B({ owner: "B", strengthRight: 2 }),
        A({
          strengthUp: 5,
          strengthDown: 5,
          strengthLeft: 5,
          strengthRight: 5,
        }),
        B({ owner: "B", strengthLeft: 2 }),
      ],
      [null, B({ owner: "B", strengthUp: 2 }), null],
    ];
    const flips = logic.getFlippableNeighbours(board, 1, 1);
    expect(flips).toHaveLength(4);
    expect(flips).toEqual(
      expect.arrayContaining([
        { x: 1, y: 0 },
        { x: 1, y: 2 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
      ])
    );
  });
});

describe('applyFlips', () => {
  const A = (stats = {}) => ({ owner: 'A', ...stats });
  const B = (stats = {}) => ({ owner: 'B', ...stats });

  test('changes ownership of specified coordinates', () => {
    const board = [
      [A(), B()],
    ];
    const flips = [{ x: 1, y: 0 }];
    const result = logic.applyFlips(board, flips, 'A');
    expect(result[0][1].owner).toBe('A');
  });

  test('does not mutate the original board', () => {
    const board = [
      [A(), B()],
    ];
    const flips = [{ x: 1, y: 0 }];
    const result = logic.applyFlips(board, flips, 'A');
    expect(board[0][1].owner).toBe('B');
    expect(result).not.toBe(board);
  });

  test('ignores null cells safely', () => {
    const board = [
      [A(), null],
    ];
    const flips = [{ x: 1, y: 0 }];
    const result = logic.applyFlips(board, flips, 'A');
    expect(result[0][0].owner).toBe('A');
    expect(result[0][1]).toBeNull();
  });
});

describe('playCard', () => {
  const A = (stats = {}) => ({ owner: 'A', strengthUp: 5, strengthRight: 5, strengthDown: 5, strengthLeft: 5, ...stats });
  const B = (stats = {}) => ({ owner: 'B', strengthUp: 1, strengthRight: 1, strengthDown: 1, strengthLeft: 1, ...stats });

  test('places a new card on an empty cell', () => {
    const board = [
      [null, null],
      [null, null],
    ];
    const result = logic.playCard(board, 0, 0, A(), 'A');
    expect(result[0][0].owner).toBe('A');
  });

  test('throws an error if the cell is already occupied', () => {
    const board = [
      [A(), null],
      [null, null],
    ];
    expect(() => logic.playCard(board, 0, 0, A(), 'A')).toThrow('Cell already occupied');
  });

  test('flips neighbouring opponent cards if stronger', () => {
    const board = [
      [null, B({ strengthLeft: 1 })],
      [null, null],
    ];
    const card = A({ strengthRight: 5 });
    const result = logic.playCard(board, 0, 0, card, 'A');
    expect(result[0][1].owner).toBe('A');
  });

  test('does not flip if not stronger', () => {
    const board = [
      [null, B({ strengthLeft: 9 })],
      [null, null],
    ];
    const card = A({ strengthRight: 5 });
    const result = logic.playCard(board, 0, 0, card, 'A');
    expect(result[0][1].owner).toBe('B');
  });
});
