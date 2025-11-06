import { Game } from "../game/game.js";
import { UIManager } from "../managers/UIManager.js";
import { UIController } from "../controllers/UIController.js";
import { SelectionBoardUI } from "../ui/SelectionBoardUI.js";
import { SelectionBoardRenderer } from "../ui/SelectionBoardRenderer.js";
import { debug } from "../debug.js";

/**
 * Handles all visual rendering of cursors.
 * Works with CreateJS stage and visual containers, separate from logical state.
 */
export const CursorRenderer = (playerManager, playerRenderer) => ({
  /**
   * Visual handling of the selection board cursor.
   */
  selection: {
    /**
     * Place the selection cursor on the stage.
     */
    place() {
      playerManager.playerHandSelectionCursor.visible = true;
      Game.stage.addChild(playerManager.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Selection cursor placed on stage");
      }
    },

    /**
     * Update the selection cursor's Y position based on controller state.
     */
    updatePosition() {
      const controller = SelectionBoardUI.controller;
      if (controller !== undefined && controller !== null) {
        const sb = UIManager.selectionBoard;

        if (
          playerManager.playerHandSelectionCursor !== undefined &&
          sb.shownCards !== undefined &&
          sb.background !== undefined
        ) {
          const relativeIndex = controller.selectedIndex - controller.pageStart;
          const rowStep = 35;

          playerManager.playerHandSelectionCursor.y =
            sb.background.y + 48 + rowStep * relativeIndex;
        }
      }

      Game.stage.update();
    },

    /**
     * Ensure the selection board is visually populated.
     */
    ensurePopulated() {
      const controller = SelectionBoardUI.controller;
      if (controller && typeof controller.clampSelectionToPage === "function") {
        SelectionBoardRenderer.populate(controller);
      } else {
        console.warn("SelectionBoard controller missing or uninitialized.");
      }
    },

    /**
     * Remove the selection cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(playerManager.playerHandSelectionCursor);
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
      UIManager.confirmation.cursor.x =
        UIManager.confirmation.background.x + 50;
      UIManager.confirmation.cursor.y =
        UIManager.confirmation.background.y + 60;

      Game.stage.addChild(UIManager.confirmation.cursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Confirmation cursor placed on stage");
      }
    },

    /**
     * Update the confirmation cursor's Y position according to selected choice.
     */
    updatePosition() {
      UIManager.confirmation.cursor.y =
        UIManager.confirmation.background.y +
        60 +
        UIManager.confirmation.selectedChoice * 30;
      Game.stage.update();
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(UIManager.confirmation.cursor);
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
      playerManager.playerHandCursor.visible = true;
      Game.stage.addChild(playerManager.playerHandCursor);
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
      UIManager.previouslySelectedCard = UIManager.selectedCard;
      UIManager.selectedCard =
        playerManager.cardsInHand[UIManager.selectedCardNumber];

      UIController.updateInfoBox();
      playerRenderer.indentSelectedCard(UIManager.selectedCard);
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(playerManager.playerHandCursor);
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
      UIManager.playerSelectingPlacement = true;

      Game.stage.addChild(UIManager.gridCursor);
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
      UIManager.playerSelectingPlacement = false;
      Game.stage.removeChild(UIManager.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor removed from stage");
      }
    },
  },
});
