import { UIManager } from "../managers/ui-manager.js";
import { BoardManager } from "../managers/board-manager.js";

/**
 * Handles player selection and navigation on the board
 */
export const BoardController = {
  /**
   * Move the selection cursor in a given direction,
   * skipping occupied squares.
   *
   * @param {"up"|"down"|"left"|"right"} direction
   */
  moveSelection(direction) {
    let nextSquare = "none";

    switch (direction) {
      case "up": {
        nextSquare = UIManager.squareUp;
        break;
      }
      case "down": {
        nextSquare = UIManager.squareDown;
        break;
      }
      case "left": {
        nextSquare = UIManager.squareLeft;
        break;
      }
      case "right": {
        nextSquare = UIManager.squareRight;
        break;
      }
      default: {
        console.warn(`[BoardController] Unknown direction: ${direction}`);
        return;
      }
    }

    // If the target is valid and not occupied, move there
    if (nextSquare !== "none") {
      const cellIndex = nextSquare - 1;
      const cellOccupied = BoardManager.boardArray[cellIndex].occupant;
      if (cellOccupied) {
        console.warn(
          `[BoardController] Target square ${nextSquare} is occupied`,
        );
      } else {
        this.updateRowColumnFromSquare(nextSquare);
      }
    }
  },

  /**
   * Update UIManager.selectedRow/Column and adjacency from a squareID
   *
   * @param {number} squareID
   */
  updateRowColumnFromSquare(squareID) {
    console.log(squareID);
    BoardManager.updateUISelection(squareID);
  },

  /**
   * Get the currently selected square's occupant, if any.
   * @returns {object|false} occupant or false if empty
   */
  getSelectedOccupant() {
    return BoardManager.cellOccupied(UIManager.selectedSquare);
  },

  /**
   * Get the currently selected square's element ID.
   * @returns {number}
   */
  getSelectedElement() {
    return BoardManager.boardArray[UIManager.selectedSquare - 1].element;
  },

  /**
   * Attempt to select a square manually by ID
   * Only selects if the square is free
   *
   * @param {number} squareID
   * @returns {boolean} true if selection successful
   */
  selectSquare(squareID) {
    const index = squareID - 1;
    if (!BoardManager.boardArray[index].occupant) {
      this.updateRowColumnFromSquare(squareID);
      return true;
    }
    console.warn(`[BoardController] Cannot select occupied square ${squareID}`);
    return false;
  },
};
