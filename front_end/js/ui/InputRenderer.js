import { cursors } from "../render/cursors.js";
import { ui } from "../render/ui.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";

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
    cursors.selection.move(direction);
    if (debug.active) {
      console.log(`Selection cursor moved: ${direction}`);
    }
  }

  /**
   * Move the player hand cursor up/down.
   * @param {"up"|"down"} direction
   */
  movePlayerHandCursor(direction) {
    cursors.playerHand.move(direction);
    if (debug.active) {
      console.log(`Player hand cursor moved: ${direction}`);
    }
  }

  /**
   * Move the confirmation box cursor.
   * @param {"up"|"down"} direction
   */
  moveConfirmationCursor(direction) {
    cursors.confirmation.move(direction);
    if (debug.active) {
      console.log(`Confirmation cursor moved: ${direction}`);
    }
  }

  /**
   * Restore player hand cursor visually (used on cancel).
   */
  restorePlayerHandCursor() {
    cursors.playerHand.place();
    if (debug.active) {
      console.log("Player hand cursor restored");
    }
  }

  /**
   * Show or hide the info box.
   * @param {boolean} visible
   */
  toggleInfoBox(visible) {
    if (ui.infoBox.container) {
      ui.infoBox.container.visible = visible;
      Game.stage.update();
      if (debug.active) {
        console.log(`Info box visibility set to: ${visible}`);
      }
    }
  }
}
