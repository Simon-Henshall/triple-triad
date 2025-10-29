import { Game } from "../game/game.js";
import { ui } from "../render/ui.js";
import { player } from "../render/player.js";
import { selectionBoard } from "../render/selectionBoard.js";
import { debug } from "../debug.js";

/**
 * Handles all visual rendering of cursors.
 * Works with CreateJS stage and visual containers, separate from logical state.
 */
export const CursorRenderer = {
  /**
   * Visual handling of the selection board cursor.
   */
  selection: {
    /**
     * Place the selection cursor on the stage.
     */
    place() {
      Game.stage.addChild(player.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Selection cursor placed on stage");
      }
    },

    /**
     * Update the selection cursor's Y position based on controller state.
     */
    updatePosition() {
      const controller = selectionBoard.controller;
      if (controller !== undefined && controller !== null) {
        const sb = ui.selectionBoard;

        if (player.playerHandSelectionCursor !== undefined &&
            sb.shownCards !== undefined &&
            sb.background !== undefined) {
          const relativeIndex = controller.selectedIndex - controller.pageStart;
          const rowStep = 35;

          player.playerHandSelectionCursor.y = sb.background.y + 48 + rowStep * relativeIndex;
        }
      }

      Game.stage.update();
    },

    /**
     * Ensure the selection board is visually populated.
     */
    ensurePopulated() {
      selectionBoard.populate();
    },

    /**
     * Remove the selection cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(player.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Selection cursor removed from stage");
      }
    },
  },

  /**
   * Visual handling of the confirmation (Yes/No) cursor.
   */
  confirmation: {
    /**
     * Place the confirmation cursor at its initial visual position.
     */
    place() {
      ui.confirmation.cursor.x = ui.confirmation.background.x + 50;
      ui.confirmation.cursor.y = ui.confirmation.background.y + 60;

      Game.stage.addChild(ui.confirmation.cursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Confirmation cursor placed on stage");
      }
    },

    /**
     * Update the confirmation cursor's Y position according to selected choice.
     */
    updatePosition() {
      ui.confirmation.cursor.y = ui.confirmation.background.y + 60 + ui.confirmation.selectedChoice * 30;
      Game.stage.update();
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(ui.confirmation.cursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Confirmation cursor removed from stage");
      }
    },
  },

  /**
   * Visual handling of the player hand cursor.
   */
  playerHand: {
    /**
     * Place the player hand cursor on the stage.
     */
    place() {
      Game.stage.addChild(player.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Player hand cursor placed on stage");
      }
    },

    /**
     * Update the player hand cursor's position visually.
     * Note: Y position is managed by CursorManager; this just refreshes stage.
     */
    updatePosition() {
      Game.stage.update();
    },

    /**
     * Sync visual selection with logical selected card.
     */
    syncSelection() {
      ui.previouslySelectedCard = ui.selectedCard;
      ui.selectedCard = player.cardsInPlayerHand[ui.selectedCardNumber];

      ui.updateInfoBox();
      player.indentSelectedCard();
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(player.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Player hand cursor removed from stage");
      }
    },
  },

  /**
   * Visual handling of the main grid cursor.
   */
  grid: {
    /**
     * Place the grid cursor on the stage.
     */
    place() {
      ui.playerSelectingPlacement = true;

      Game.stage.addChild(ui.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor placed on stage");
      }
    },

    /**
     * Update the grid cursor's position visually.
     * Note: exact X/Y is managed by CursorManager.move().
     */
    updatePosition() {
      Game.stage.update();
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      ui.playerSelectingPlacement = false;
      Game.stage.removeChild(ui.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor removed from stage");
      }
    },
  },
};
