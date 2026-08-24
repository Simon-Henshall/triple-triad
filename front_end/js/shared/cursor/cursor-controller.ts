import { CursorModel } from "./cursor-model.js";
import { debug } from "../../utilities/debug.js";
import { Game } from "../game/game.js";
import { offsets } from "../../constants/offsets.js";
import { InfoBox } from "../ui/info-box.js";
import { PhaseChecker } from "../../game/phases.js";

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
    },

    /**
     * Remove the selection cursor from the stage and clear state.
     */
    remove() {
      cursorView.selection.remove();
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
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      cursorView.confirmation.remove();
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
      const selectedIndex = playerModel.selectedCardNumber ?? 0;

      // Ensure cursor is visible and added to stage
      cursorView.playerHand.place();

      // Compute how far down the cursor should be, accounting for cards already played
      const visualCardIndex = selectedIndex + playerModel.playedCardsCount;
      playerModel.playerHandCursor.y =
        offsets.playerCursorOffset + visualCardIndex * offsets.handCardOffset;
      // NB: Use the same spacing as the visual hand stack (`offsets.handCardOffset`).

      // Update info box for selected card
      const newlySelectedCard = playerModel.hand[selectedIndex];
      if (newlySelectedCard) {
        playerModel.selectedCard = newlySelectedCard;
        InfoBox.updateInfoBox(Game, newlySelectedCard);
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
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      CursorModel.playerHand.clear();
      cursorView.playerHand.remove();
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
      PhaseChecker.playerSelectingPlacement = false;
      PhaseChecker.playerChoosingCard = true;
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
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      CursorModel.grid.clear();
      cursorView.grid.remove();
    },
  },
});
