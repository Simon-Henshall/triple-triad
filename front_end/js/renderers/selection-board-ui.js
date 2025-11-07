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

    // Ensure container exists and is attached to stage
    const sb = UIManager.selectionBoard;
    if (!sb.container) {
      sb.container = new createjs.Container();
    }
    if (!Game.stage.contains(sb.container)) {
      Game.stage.addChild(sb.container);
    }

    // Draw background & text if not already present
    if (!sb.background) {
      this._drawSelectionBoardBackground();
    }
    this._drawSelectionBoardText();

    // Populate visuals
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

  /**
   * Draw selection board background.
   * Private method, called automatically from initialise().
   */
  _drawSelectionBoardBackground() {
    const sb = UIManager.selectionBoard;
    sb.background = new createjs.Shape();
    sb.background.graphics.beginFill("#666666").drawRect(0, 0, 420, 450);
    sb.background.x = 170;
    sb.background.y = 100;
    sb.container.addChild(sb.background);
  },

  /**
   * Draw selection board static text (labels, page, NUM).
   * Private method, called automatically from initialise().
   */
  _drawSelectionBoardText() {
    const sb = UIManager.selectionBoard;

    const createText = (text, x, y) => {
      const t = new createjs.Text(text, "20px Arial", "#ffffff");
      t.x = x;
      t.y = y;
      t.textBaseline = "alphabetic";
      return t;
    };

    const baseX = sb.background.x;
    const baseY = sb.background.y;

    // Only create the labels once
    if (!sb.cardListText) {
      sb.cardListText = createText("CARDS", baseX + 10, baseY + 20);
      sb.pageText = createText("P.", baseX + 110, baseY + 20);
      sb.numberText = createText("NUM.", baseX + 350, baseY + 20);

      sb.container.addChild(sb.cardListText, sb.pageText, sb.numberText);
    }

    // Page display: create only if missing, otherwise update existing
    if (!sb.pageDisplay) {
      sb.pageDisplay = createText("1", baseX + 150, baseY + 20);
      sb.container.addChild(sb.pageDisplay);
    }
  },
};
