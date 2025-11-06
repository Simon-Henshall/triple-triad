import { config } from "../config.js";
import { UIManager } from "./UIManager.js";

/**
 * BoardManager handles the logical state of the 3x3 board,
 * including square occupancy, selected square, and elements.
 */
export const BoardManager = {
  boardArray: Array(9)
    .fill(null)
    .map(() => ({ element: 0, occupant: null })),
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
   * Given UIManager.selectedRow and selectedColumn,
   * sets the current selected square and adjacent squares.
   */
  checkSelectedSquare() {
    for (let i = 0; i < this.squareMap.length; i++) {
      const s = this.squareMap[i];
      if (
        s.row === UIManager.selectedRow &&
        s.col === UIManager.selectedColumn
      ) {
        UIManager.selectedSquare = i + 1;
        UIManager.squareLeft = s.left;
        UIManager.squareUp = s.up;
        UIManager.squareRight = s.right;
        UIManager.squareDown = s.down;
        break;
      }
    }
  },

  /**
   * Given UIManager.selectedAISquare, sets row/column and adjacency.
   */
  checkSelectedRowColumn() {
    const s = this.squareMap[UIManager.selectedAISquare - 1];
    UIManager.selectedRow = s.row;
    UIManager.selectedColumn = s.col;
    UIManager.squareLeft = s.left;
    UIManager.squareUp = s.up;
    UIManager.squareRight = s.right;
    UIManager.squareDown = s.down;
  },

  /**
   * Checks whether the currently selected square is occupied.
   * @returns {object|false} Occupant object or false if empty.
   */
  cellOccupied() {
    const cell = this.boardArray[UIManager.selectedSquare - 1];
    return cell.occupant ? cell.occupant : false;
  },

  /**
   * Assign elements to the board in a random way.
   * Returns an array of element IDs for each cell.
   * Does not render anything.
   */
  generateElements() {
    const possibleElements = Object.keys(config.elements);
    const elements = [];
    const numElements = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numElements; i++) {
      const randomIndex = Math.floor(Math.random() * possibleElements.length);
      elements.push(Number(possibleElements[randomIndex]));
    }
    for (let i = numElements; i < 9; i++) {
      elements.push(0);
    }

    return this.shuffle(elements);
  },

  /**
   * Simple Fisher-Yates shuffle
   * @param {Array} array
   * @returns {Array}
   */
  shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Reset the board to initial empty state.
   */
  resetBoard() {
    this.boardArray.forEach((cell) => {
      cell.element = 0;
      cell.occupant = null;
    });
    this.freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  },
};
