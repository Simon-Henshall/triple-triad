import GameLogic from "./game.logic.js";

const logic = new GameLogic();

let _gameStateInstance;

export function getGameStateInstance() {
  if (!_gameStateInstance) {
    _gameStateInstance = new GameState();
  }
  return _gameStateInstance;
}

export class GameState {
  constructor({
    playerHand = [],
    aiHand = [],
    startingPlayer = "PLAYER",
  } = {}) {
    this.board = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ];

    this.hands = {
      PLAYER: [...playerHand],
      AI: [...aiHand],
    };

    // Each starts with 5 cards
    this.scores = {
      PLAYER: 5,
      AI: 5,
    };

    this.turn = startingPlayer;
  }

  get currentPlayer() {
    return this.turn;
  }

  switchTurn() {
    this.turn = this.turn === "PLAYER" ? "AI" : "PLAYER";
  }

  /**
   * TODO: UNCALLED
   */
  playCardAt(x, y, cardIndex) {
    const player = this.currentPlayer;
    const card = this.hands[player][cardIndex];

    if (!card) {
      throw new Error(`No card found at index ${cardIndex} for ${player}`);
    }
    if (this.board[y][x] !== null) {
      throw new Error(`Cell (${x},${y}) is already occupied`);
    }

    // Play the card and update the board
    this.board = logic.playCard(this.board, x, y, card, player);

    // Remove the card from the player's hand
    this.hands[player].splice(cardIndex, 1);

    // Recalculate scores (number of owned cells)
    this.recalculateScores();

    // Switch turn
    this.switchTurn();
  }

  recalculateScores() {
    let playerOwned = 0;
    let aiOwned = 0;

    for (const row of this.board) {
      for (const cell of row) {
        if (cell) {
          if (cell.owner === "PLAYER") {
            playerOwned++;
          }
          if (cell.owner === "AI") {
            aiOwned++;
          }
        }
      }
    }

    this.scores.PLAYER = playerOwned + this.hands.PLAYER.length;
    this.scores.AI = aiOwned + this.hands.AI.length;
  }

  isGameOver() {
    return this.hands.PLAYER.length === 0 && this.hands.AI.length === 0;
  }

  getWinner() {
    if (!this.isGameOver()) {
      return;
    }
    if (this.scores.PLAYER > this.scores.AI) {
      return "PLAYER";
    }
    if (this.scores.AI > this.scores.PLAYER) {
      return "AI";
    }
    return "DRAW";
  }

  getPlayerHand() {
    return this.hands.PLAYER;
  }

  getAiHand() {
    return this.hands.AI;
  }
}

// Simple AI move: picks random card + empty cell
GameState.prototype.playAiTurn = function () {
  if (this.turn !== "AI") {
    throw new Error("It is not the AI's turn");
  }
  if (this.hands.AI.length === 0) {
    throw new Error("AI has no cards left");
  }

  // Collect all empty cells
  const emptyCells = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (this.board[y][x] === null) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    throw new Error("No available cells for AI move");
  }

  // Randomly pick a card and cell
  const cardIndex = Math.floor(Math.random() * this.hands.AI.length);
  const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  // Play using existing logic
  this.playCardAt(x, y, cardIndex);
};
