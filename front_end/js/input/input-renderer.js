import { Game } from "../game/game.js";
import { debug } from "../utilities/debug.js";

/**
 * Handles visual updates triggered by player input.
 * This includes cursor movements, card animations, and
 * selection board / confirmation UI updates.
 */
export class InputRenderer {
  /**
   * Move the selection cursor on the selection board.
   * @param {"left"|"up"|"right"|"down"} direction
   */
  moveSelectionCursor(direction) {
    Game.controllers.cursorController.selection.move(direction);
    if (debug.active) {
      //console.log(`Selection cursor moved: ${direction}`);
    }
  }

  /**
   * Move the player hand cursor up/down.
   * @param {"up"|"down"} direction
   */
  movePlayerHandCursor(direction) {
    Game.controllers.cursorController.playerHand.move(direction);
    if (debug.active) {
      //console.log(`Player hand cursor moved: ${direction}`);
    }
  }

  /**
   * Move the confirmation box cursor.
   * @param {"up"|"down"} direction
   */
  moveConfirmationCursor(direction) {
    Game.controllers.cursorController.confirmation.move(direction);
    if (debug.active) {
      //console.log(`Confirmation cursor moved: ${direction}`);
    }
  }
}
