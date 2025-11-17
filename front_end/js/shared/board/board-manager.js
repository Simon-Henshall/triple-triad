import { config } from "../../constants/config.js";
import { shuffle } from "../../utilities/shuffle.js";
import { UIManager } from "../ui/ui-manager.js";

/**
 * BoardManager handles the logical state of the 3x3 board,
 * including square occupancy, selection, and elements.
 */
export const BoardManager = {
  // Each cell has an element and an occupant (card)
  boardArray: Array.from({ length: 9 }).map(() => ({
    element: 0,
    occupant: undefined,
  })),

  // Tracks free square indices (1-based)
  freeCells: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  // Lookup table for square positions and adjacency
  squareMap: [
    { row: 1, col: 1, left: "none", up: "none", right: 2, down: 4 },
    { row: 1, col: 2, left: 1, up: "none", right: 3, down: 5 },
    { row: 1, col: 3, left: 2, up: "none", right: "none", down: 6 },
    { row: 2, col: 1, left: "none", up: 1, right: 5, down: 7 },
    { row: 2, col: 2, left: 4, up: 2, right: 6, down: 8 },
    { row: 2, col: 3, left: 5, up: 3, right: "none", down: 9 },
    { row: 3, col: 1, left: "none", up: 4, right: 8, down: "none" },
    { row: 3, col: 2, left: 7, up: 5, right: 9, down: "none" },
    { row: 3, col: 3, left: 8, up: 6, right: "none", down: "none" },
  ],

  /**
   * Returns true if a cell is occupied.
   * @param {number} index 0-based
   * @returns {boolean}
   */
  cellOccupied(index) {
    const cell = this.boardArray[index];
    return !!cell?.occupant;
  },

  /**
   * Get the occupant of a square
   * @param {number} index 0-based
   * @returns {object|undefined}
   */
  getOccupant(index) {
    return this.boardArray[index]?.occupant;
  },

  /**
   * Reset the board to empty state
   */
  resetBoard() {
    for (const cell of this.boardArray) {
      cell.element = 0;
      cell.occupant = undefined;
    }

    this.freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  },

  /**
   * Generate random elements for the board
   * @returns {number[]}
   */
  generateElements() {
    const possibleElements = Object.keys(config.elements);
    const elements = [];
    const numberOfElements = Math.floor(Math.random() * 3) + 1;

    for (let index = 0; index < numberOfElements; index++) {
      const randomIndex = Math.floor(Math.random() * possibleElements.length);
      elements.push(Number(possibleElements[randomIndex]));
    }
    for (let index = numberOfElements; index < 9; index++) {
      elements.push(0);
    }

    return shuffle(elements);
  },

  /**
   * Returns true if the board is completely filled
   * @returns {boolean}
   */
  isGameOver() {
    return this.boardArray.every((cell) => !!cell.occupant);
  },

  /**
   * Given a square index (1-based), update UIManager row/col & adjacency
   */
  updateUISelection(square1Based) {
    const s = this.squareMap[square1Based - 1];

    UIManager.selectedSquare = square1Based;
    UIManager.selectedRow = s.row;
    UIManager.selectedColumn = s.col;

    // Adjacency values are now direct numbers (or "none")
    UIManager.squareLeft = s.left;
    UIManager.squareUp = s.up;
    UIManager.squareRight = s.right;
    UIManager.squareDown = s.down;
  },
};
