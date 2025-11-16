import { CursorManager } from "../managers/cursor-manager.js";
import { debug } from "../debug.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { UIController } from "./ui-controller.js";
import { offsets } from "../constants/offsets.js";

/**
 * High-level controller that bridges cursor state and visual updates.
 */
export const CursorController = (cursorRenderer) => ({
  // -------------------------
  // Selection (selection board) cursor
  // -------------------------
  selection: {
    /**
     * Place the selection cursor at its initial position.
     */
    place() {
      CursorManager.selection.initPosition();
      cursorRenderer.selection.place();

      if (debug.active) {
        //console.log("CursorController.selection.place()");
      }
    },

    /**
     * Move the selection cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      CursorManager.selection.move(direction);
      cursorRenderer.selection.updatePosition();
      cursorRenderer.selection.ensurePopulated();

      if (debug.active) {
        //console.log("CursorController.selection.move() ->", direction);
      }
    },

    /**
     * Remove the selection cursor from the stage and clear state.
     */
    remove() {
      CursorManager.selection.clear();
      cursorRenderer.selection.remove();

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
      CursorManager.confirmation.resetChoice();
      cursorRenderer.confirmation.place();

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
      const changed = CursorManager.confirmation.move(direction);

      if (changed) {
        cursorRenderer.confirmation.updatePosition();
      }

      if (debug.active) {
        //console.log("CursorController.confirmation.move() ->", direction);
      }
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      CursorManager.confirmation.clear();
      cursorRenderer.confirmation.remove();

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
      const playerManager = Game.managers.playerManager;
      const selectedIndex = UIManager.selectedCardNumber ?? 0;

      // Ensure cursor is visible and added to stage
      cursorRenderer.playerHand.place();

      // Compute how far down the cursor should be, accounting for cards already played
      const visualCardIndex =
        selectedIndex + playerManager.playedCardsCount + 1; // +1 for 1-based offset
      playerManager.playerHandCursor.y =
        offsets.handOffsetY + visualCardIndex * (offsets.cardHeight / 2);

      // Update info box for selected card
      const newlySelectedCard = playerManager.hand[selectedIndex];
      if (newlySelectedCard) {
        UIManager.selectedCard = newlySelectedCard;
        UIController.updateInfoBox(newlySelectedCard);
      }

      // Increment for next placement
      playerManager.playedCardsCount++;

      if (debug.active) {
        console.log(
          "CursorController.playerHand.place() -> cursor positioned",
          selectedIndex,
          playerManager.playerHandCursor.y,
        );
      }
    },

    /**
     * Move the player hand cursor up or down.
     * @param {"up"|"down"} direction
     */
    move(direction) {
      const moved = CursorManager.playerHand.move(direction);

      if (moved) {
        cursorRenderer.playerHand.updatePosition();
        cursorRenderer.playerHand.syncSelection();
      }

      if (debug.active) {
        //console.log("CursorController.playerHand.move() ->", direction);
      }
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      CursorManager.playerHand.clear();
      cursorRenderer.playerHand.remove();

      if (debug.active) {
        //console.log("CursorController.playerHand.remove()");
      }
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
      CursorManager.grid.init();
      cursorRenderer.grid.place();

      if (debug.active) {
        //console.log("CursorController.grid.place()");
      }
    },

    /**
     * Move the grid cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      const moved = CursorManager.grid.move(direction);

      if (moved) {
        cursorRenderer.grid.updatePosition();
      }

      if (debug.active) {
        //console.log("CursorController.grid.move() ->", direction);
      }
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      CursorManager.grid.clear();
      cursorRenderer.grid.remove();

      if (debug.active) {
        //console.log("CursorController.grid.remove()");
      }
    },
  },
});
