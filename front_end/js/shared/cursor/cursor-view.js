import { Game } from "../game/game.js";
import { UIModel } from "../ui/ui-model.js";
import { debug } from "../../utilities/debug.js";
import { InfoBox } from "../ui/info-box.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";
import DeckSelectionModel from "../../phases/deck-selection/deck-selection-model.js";

/**
 * Handles all visual rendering of cursors.
 * Works with CreateJS stage and visual containers, separate from logical state.
 */
export const CursorView = (playerModel, playerView) => ({
  /**
   * Visual handling of the selection board cursor.
   */
  selection: {
    /**
     * Place the selection cursor on the stage.
     */
    place() {
      playerModel.playerHandSelectionCursor.visible = true;
      Game.stage.addChild(playerModel.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Selection cursor placed on stage");
      }
    },

    /**
     * Update the selection cursor's Y position based on controller state.
     */
    updatePosition() {
      const controller = SelectionBookUI.controller;
      if (controller !== undefined && controller !== null) {
        const sb = DeckSelectionModel;

        if (
          playerModel.playerHandSelectionCursor !== undefined &&
          sb.shownCards !== undefined &&
          sb.background !== undefined
        ) {
          const relativeIndex = controller.selectedIndex - controller.pageStart;
          const rowStep = 35;

          playerModel.playerHandSelectionCursor.y =
            sb.background.y + 48 + rowStep * relativeIndex;
        }
      }

      Game.stage.update();
    },

    /**
     * Ensure the selection board is visually populated.
     */
    ensurePopulated() {
      const controller = SelectionBookUI.controller;
      if (controller && typeof controller.clampSelectionToPage === "function") {
        SelectionBookView.populate(controller);
      } else {
        console.warn("SelectionBook controller missing or uninitialised.");
      }
    },

    /**
     * Remove the selection cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(playerModel.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Selection cursor removed from stage");
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
      ConfirmationView.cursor.x = ConfirmationView.background.x + 50;
      ConfirmationView.cursor.y = ConfirmationView.background.y + 60;

      Game.stage.addChild(ConfirmationView.cursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Confirmation cursor placed on stage");
      }
    },

    /**
     * Update the confirmation cursor's Y position according to selected choice.
     */
    updatePosition() {
      ConfirmationView.cursor.y =
        ConfirmationView.background.y +
        60 +
        ConfirmationView.selectedChoice * 30;
      Game.stage.update();
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(ConfirmationView.cursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Confirmation cursor removed from stage");
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
      playerModel.playerHandCursor.visible = true;
      Game.stage.addChild(playerModel.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Player hand cursor placed on stage");
      }
    },

    /**
     * Update the player hand cursor's position visually.
     * Note: Y position is managed by CursorModel; this just refreshes stage.
     */
    updatePosition() {
      Game.stage.update();
    },

    /**
     * Sync visual selection with logical selected card.
     */
    syncSelection() {
      UIModel.previouslySelectedCard = UIModel.selectedCard;
      UIModel.selectedCard = playerModel.hand[UIModel.selectedCardNumber];

      InfoBox.updateInfoBox(Game, UIModel.selectedCard);
      playerView.indentSelectedCard(UIModel.selectedCard);
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      Game.stage.removeChild(playerModel.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Player hand cursor removed from stage");
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
      UIModel.playerSelectingPlacement = true;

      Game.stage.addChild(UIModel.gridCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Grid cursor placed on stage");
      }
    },

    /**
     * Update the grid cursor's position visually.
     * Note: exact X/Y is managed by CursorModel.move().
     */
    updatePosition() {
      Game.stage.update();
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      UIModel.playerSelectingPlacement = false;

      Game.stage.removeChild(UIModel.gridCursor);
      Game.stage.update();

      if (debug.active) {
        //console.log("Grid cursor removed from stage");
      }
    },
  },
});
