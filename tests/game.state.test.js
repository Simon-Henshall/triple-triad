import { GameState } from '../front_end/js/game.state.js';

describe('GameState', () => {
  const A = (stats = {}) => ({ owner: 'PLAYER', strengthUp: 5, strengthRight: 5, strengthDown: 5, strengthLeft: 5, ...stats });
  const B = (stats = {}) => ({ owner: 'AI', strengthUp: 1, strengthRight: 1, strengthDown: 1, strengthLeft: 1, ...stats });

  test('initialises with correct default values', () => {
    const game = new GameState({ playerHand: [A(), A(), A(), A(), A()], aiHand: [B(), B(), B(), B(), B()] });
    expect(game.board.flat().filter(Boolean).length).toBe(0);
    expect(game.scores.PLAYER).toBe(5);
    expect(game.scores.AI).toBe(5);
    expect(game.turn).toBe('PLAYER');
  });

  test('allows a card to be played and switches turn', () => {
    const game = new GameState({ playerHand: [A()], aiHand: [B()] });
    game.playCardAt(0, 0, 0);
    expect(game.board[0][0].owner).toBe('PLAYER');
    expect(game.turn).toBe('AI');
    expect(game.hands.PLAYER.length).toBe(0);
  });

  test('updates scores after flipping', () => {
    const game = new GameState({ playerHand: [A({ strengthRight: 5 })], aiHand: [B({ strengthLeft: 1 })] });
    // Pre-place AI card to be flipped
    game.board[0][1] = { ...B({ strengthLeft: 1 }), owner: 'AI' };
    game.playCardAt(0, 0, 0);
    expect(game.board[0][1].owner).toBe('PLAYER');
  });

  test('determines game over and winner correctly', () => {
    const game = new GameState({ playerHand: [], aiHand: [] });
    expect(game.isGameOver()).toBe(true);
    expect(game.getWinner()).toBe('DRAW');
  });
});
