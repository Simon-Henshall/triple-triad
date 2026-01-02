import { CursorModel } from "./cursor-model.js";
import { debug } from "../../utilities/debug.js";
import { Game } from "../game/game.js";
import { UIModel } from "../ui/ui-model.js";
import { offsets } from "../../constants/offsets.js";
import { InfoBox } from "../ui/info-box.js";

/**
 * High-level controller that bridges cursor state and visual updates.
 */
export const CursorController = (cursorView) => ({
  // -------------------------
  // Selection (selection board) cursor
  // -------------------------
  selection: {
    /**
     * Place the selection cursor at its initial position.
     */
    place() {
      CursorModel.selection.initPosition();
      cursorView.selection.place();

      if (debug.active) {
        //console.log("CursorController.selection.place()");
      }
    },

    /**
     * Move the selection cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      CursorModel.selection.move(direction);
      cursorView.selection.updatePosition();
      cursorView.selection.ensurePopulated();

      if (debug.active) {
        //console.log("CursorController.selection.move() ->", direction);
      }
    },

    /**
     * Remove the selection cursor from the stage and clear state.
     */
    remove() {
      cursorView.selection.remove();

      if (debug.active) {
        //console.log("CursorController.selection.remove()");
      }
    },
  },

  // -------------------------
  // Confirmation cursor
  // -------------------------
  confirmation: {
    /**
     * Place the confirmation cursor at its default choice.
     */
    place() {
      CursorModel.confirmation.resetChoice();
      cursorView.confirmation.place();

      if (debug.active) {
        //console.log("CursorController.confirmation.place()");
      }
    },

    /**
     * Move the confirmation cursor up or down.
     * Updates visual position only if logical choice changed.
     * @param {"up"|"down"} direction
     */
    move(direction) {
      const changed = CursorModel.confirmation.move(direction);

      if (changed) {
        cursorView.confirmation.updatePosition();
      }

      if (debug.active) {
        //console.log("CursorController.confirmation.move() ->", direction);
      }
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      cursorView.confirmation.remove();

      if (debug.active) {
        //console.log("CursorController.confirmation.remove()");
      }
    },
  },

  // -------------------------
  // Player hand cursor
  // -------------------------
  playerHand: {
    /**
     * Place the player hand cursor at its initial position.
     */
    place() {
      const playerModel = Game.models.playerModel;
      const selectedIndex = UIModel.selectedCardNumber ?? 0;

      // Ensure cursor is visible and added to stage
      cursorView.playerHand.place();

      // Compute how far down the cursor should be, accounting for cards already played
      const visualCardIndex = selectedIndex + playerModel.playedCardsCount;
      playerModel.playerHandCursor.y =
        offsets.playerCursorOffset +
        visualCardIndex * (offsets.scaledCardHeight / 2); // TODO: Work out where there is slight drift upwards here
      // NB: This should be the same as (visualCardIndex * (offsets.cellHeight - offsets.cardOffsetY * 2)) / 2

      // Update info box for selected card
      const newlySelectedCard = playerModel.hand[selectedIndex];
      if (newlySelectedCard) {
        UIModel.selectedCard = newlySelectedCard;
        InfoBox.updateInfoBox(Game, newlySelectedCard);
      }

      if (debug.active) {
        console.log(
          "CursorController.playerHand.place() -> cursor positioned",
          selectedIndex,
          playerModel.playerHandCursor.y,
        );
      }
    },

    /**
     * Move the player hand cursor up or down.
     * @param {"up"|"down"} direction
     */
    move(direction) {
      const moved = CursorModel.playerHand.move(direction);

      if (moved) {
        cursorView.playerHand.updatePosition();
        cursorView.playerHand.syncSelection();
      }

      if (debug.active) {
        //console.log("CursorController.playerHand.move() ->", direction);
      }
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      CursorModel.playerHand.clear();
      cursorView.playerHand.remove();

      if (debug.active) {
        //console.log("CursorController.playerHand.remove()");
      }
    },

    /**
     * Restore player hand cursor visually (used on cancel).
     */
    restorePlayerHandCursor() {
      Game.controllers.cursorController.playerHand.place();
      if (debug.active) {
        console.log("Player hand cursor restored");
      }
      // Restore cursors
      UIModel.playerSelectingPlacement = false;
      UIModel.playerChoosingCard = true;
    },
  },

  // -------------------------
  // Grid cursor
  // -------------------------
  grid: {
    /**
     * Place the grid cursor at its initial position.
     */
    place() {
      CursorModel.grid.init();
      cursorView.grid.place();

      if (debug.active) {
        //console.log("CursorController.grid.place()");
      }
    },

    /**
     * Move the grid cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      const moved = CursorModel.grid.move(direction);

      if (moved) {
        cursorView.grid.updatePosition();
      }

      if (debug.active) {
        //console.log("CursorController.grid.move() ->", direction);
      }
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      CursorModel.grid.clear();
      cursorView.grid.remove();

      if (debug.active) {
        //console.log("CursorController.grid.remove()");
      }
    },
  },
});
