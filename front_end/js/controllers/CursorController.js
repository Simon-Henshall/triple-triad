import { CursorManager } from "../managers/CursorManager.js";
import { CursorRenderer } from "../ui/CursorRenderer.js";
import { debug } from "../debug.js";

/**
 * High-level controller that bridges cursor state and visual updates.
 */
export const CursorController = {
  // -------------------------
  // Selection (selection board) cursor
  // -------------------------
  selection: {
    /**
     * Place the selection cursor at its initial position.
     */
    place() {
      CursorManager.selection.initPosition();
      CursorRenderer.selection.place();

      if (debug.active) {
        console.log("CursorController.selection.place()");
      }
    },

    /**
     * Move the selection cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      CursorManager.selection.move(direction);
      CursorRenderer.selection.updatePosition();
      CursorRenderer.selection.ensurePopulated();

      if (debug.active) {
        console.log("CursorController.selection.move() ->", direction);
      }
    },

    /**
     * Remove the selection cursor from the stage and clear state.
     */
    remove() {
      CursorManager.selection.clear();
      CursorRenderer.selection.remove();

      if (debug.active) {
        console.log("CursorController.selection.remove()");
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
      CursorRenderer.confirmation.place();

      if (debug.active) {
        console.log("CursorController.confirmation.place()");
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
        CursorRenderer.confirmation.updatePosition();
      }

      if (debug.active) {
        console.log("CursorController.confirmation.move() ->", direction);
      }
    },

    /**
     * Remove the confirmation cursor from the stage.
     */
    remove() {
      CursorManager.confirmation.clear();
      CursorRenderer.confirmation.remove();

      if (debug.active) {
        console.log("CursorController.confirmation.remove()");
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
      CursorManager.playerHand.init();
      CursorRenderer.playerHand.place();

      if (debug.active) {
        console.log("CursorController.playerHand.place()");
      }
    },

    /**
     * Move the player hand cursor up or down.
     * @param {"up"|"down"} direction
     */
    move(direction) {
      const moved = CursorManager.playerHand.move(direction);

      if (moved) {
        CursorRenderer.playerHand.updatePosition();
        CursorRenderer.playerHand.syncSelection();
      }

      if (debug.active) {
        console.log("CursorController.playerHand.move() ->", direction);
      }
    },

    /**
     * Remove the player hand cursor from the stage.
     */
    remove() {
      CursorManager.playerHand.clear();
      CursorRenderer.playerHand.remove();

      if (debug.active) {
        console.log("CursorController.playerHand.remove()");
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
      CursorRenderer.grid.place();

      if (debug.active) {
        console.log("CursorController.grid.place()");
      }
    },

    /**
     * Move the grid cursor in the given direction.
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      const moved = CursorManager.grid.move(direction);

      if (moved) {
        CursorRenderer.grid.updatePosition();
      }

      if (debug.active) {
        console.log("CursorController.grid.move() ->", direction);
      }
    },

    /**
     * Remove the grid cursor from the stage.
     */
    remove() {
      CursorManager.grid.clear();
      CursorRenderer.grid.remove();

      if (debug.active) {
        console.log("CursorController.grid.remove()");
      }
    },
  },
};
