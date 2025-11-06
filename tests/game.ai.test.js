import { GameState } from '../front_end/js/game/game.state.js';

describe('GameState AI logic', () => {
  const A = (stats = {}) => ({ owner: 'PLAYER', strengthUp: 5, strengthRight: 5, strengthDown: 5, strengthLeft: 5, ...stats });
  const B = (stats = {}) => ({ owner: 'AI', strengthUp: 5, strengthRight: 5, strengthDown: 5, strengthLeft: 5, ...stats });

  test('AI plays a valid card into an empty space', () => {
    const game = new GameState({
      playerHand: [A()],
      aiHand: [B()],
      startingPlayer: 'AI',
    });

    game.playAiTurn();

    const placedCells = game.board.flat().filter(Boolean);
    expect(placedCells.length).toBe(1);
    expect(placedCells[0].owner).toBe('AI');
    expect(game.turn).toBe('PLAYER');
  });

  test('AI cannot play if it has no cards', () => {
    const game = new GameState({
      playerHand: [A()],
      aiHand: [],
      startingPlayer: 'AI',
    });
    expect(() => game.playAiTurn()).toThrow('AI has no cards left');
  });

  test('AI cannot play if no cells are available', () => {
    const game = new GameState({
      playerHand: [A()],
      aiHand: [B()],
      startingPlayer: 'AI',
    });

    // Fill the board completely
    game.board = [
      [A(), A(), A()],
      [A(), A(), A()],
      [A(), A(), A()],
    ];

    expect(() => game.playAiTurn()).toThrow('No available cells for AI move');
  });

  test('AI must only play on its own turn', () => {
    const game = new GameState({
      playerHand: [A()],
      aiHand: [B()],
      startingPlayer: 'PLAYER',
    });
    expect(() => game.playAiTurn()).toThrow('It is not the AI\'s turn');
  });
});
