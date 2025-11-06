import { UIManager } from "../managers/ui-manager.js";
import { BoardManager } from "../managers/board-manager.js";

/**
 * Handles player selection on the board:
 * - Mapping row/column to square ID
 * - Moving selection cursor
 * - Retrieving selected cell info
 */
export const BoardController = {
  /**
   * TODO: UNCALLED
   * Move selection in the specified direction.
   * Updates UIManager.selectedRow/Column and selectedSquare.
   *
   * @param {"up"|"down"|"left"|"right"} direction
   */
  moveSelection(direction) {
    switch (direction) {
      case "up": {
        if (UIManager.squareUp !== "none") {
          UIManager.selectedSquare = UIManager.squareUp;
          this.updateRowColumnFromSquare(UIManager.selectedSquare);
        }
        break;
      }

      case "down": {
        if (UIManager.squareDown !== "none") {
          UIManager.selectedSquare = UIManager.squareDown;
          this.updateRowColumnFromSquare(UIManager.selectedSquare);
        }
        break;
      }

      case "left": {
        if (UIManager.squareLeft !== "none") {
          UIManager.selectedSquare = UIManager.squareLeft;
          this.updateRowColumnFromSquare(UIManager.selectedSquare);
        }
        break;
      }

      case "right": {
        if (UIManager.squareRight !== "none") {
          UIManager.selectedSquare = UIManager.squareRight;
          this.updateRowColumnFromSquare(UIManager.selectedSquare);
        }
        break;
      }

      default: {
        console.warn(`Unknown direction: ${direction}`);
      }
    }
  },

  /**
   * Update UIManager.selectedRow and selectedColumn from a squareID
   * Also updates adjacency for movement.
   *
   * @param {number} squareID
   */
  updateRowColumnFromSquare(squareID) {
    BoardManager.checkSelectedRowColumn(squareID);
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
};
