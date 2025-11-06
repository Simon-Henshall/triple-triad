import { UIManager } from "../managers/ui-manager.js";
import { SelectionBoardRenderer } from "./selection-board-renderer.js";
import { SelectionBoardController } from "../controllers/selection-board-controller.js";
import { Game } from "../game/game.js";

/**
 * High-level entrypoint for selection board usage.
 * Keeps controller reference and exposes populate/paginate/moveSelection.
 */
export const SelectionBoardUI = {
  controller: undefined,

  /**
   * Initialise the selection board with a card array.
   * This will re-use UIManager.selectionBoard.background if present,
   * and will ensure UIManager.selectionBoard.container exists.
   *
   * @param {Array} cards
   */
  initialise(cards) {
    this.controller = new SelectionBoardController(cards);

    // Ensure the UIManager.selectionBoard.container exists and is attached to stage.
    const sb = UIManager.selectionBoard;
    if (!sb.container) {
      sb.container = new createjs.Container();
    }

    if (!Game.stage.contains(sb.container)) {
      Game.stage.addChild(sb.container);
      // optional logging:
      console.log("SelectionBoard container attached early from initialise()");
    }

    // If the caller already created a background (pickPlayerCards does this),
    // respect it; otherwise SelectionBoardRenderer.populate will create a fallback.
    SelectionBoardRenderer.populate(this.controller);
  },

  /**
   * Repopulate visuals from controller state.
   */
  populate() {
    if (!this.controller) {
      return;
    }
    SelectionBoardRenderer.populate(this.controller);
  },

  /**
   * Change page direction and repopulate.
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    if (!this.controller) {
      return;
    }
    this.controller.paginate(direction);
    this.populate();
  },

  /**
   * Move the selection up/down (next = true => next)
   * @param {boolean} [next=true]
   */
  moveSelection(next = true) {
    if (!this.controller) {
      return;
    }
    if (next === true) {
      this.controller.selectNext();
    } else {
      this.controller.selectPrevious();
    }
    this.populate();
  },
};
