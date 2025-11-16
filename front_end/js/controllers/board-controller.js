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
};
