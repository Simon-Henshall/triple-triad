import { UIManager } from "../managers/ui-manager.js";
import { SelectionBookRenderer } from "./selection-book-renderer.js";
import { SelectionBookController } from "./selection-book-controller.js";
import { Game } from "../game/game.js";

export const SelectionBookUI = {
  controller: undefined,

  /**
   * Initialise the Selection Book UI with a deck
   * @param {Array} deck
   */
  initialise(deck, playerManager) {
    console.log(deck);
    // Create controller
    this.controller = new SelectionBookController(deck, playerManager);

    const sb = UIManager.selectionBook;
    if (!sb.container) {
      sb.container = new createjs.Container();
    }
    if (!Game.stage.contains(sb.container)) {
      Game.stage.addChild(sb.container);
    }

    // Draw static background and header
    this._drawBackground();
    this._drawHeaderText();

    // Initial population
    this.populate();
  },

  /**
   * Populate the UI with current page and cursor state
   */
  populate() {
    if (!this.controller) {
      return;
    }
    SelectionBookRenderer.populate(this.controller);
  },

  /**
   * Move the selection cursor up or down
   * @param {boolean} next - true for down, false for up
   */
  moveSelection(next = true) {
    if (!this.controller) {
      return;
    }

    if (next) {
      this.controller.moveNext();
    } else {
      this.controller.movePrevious();
    }

    this.populate();
  },

  /**
   * Paginate left or right manually
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    if (!this.controller) {
      return;
    }
    this.controller.paginate(direction);
    this.populate();
  },

  /** Draw static background */
  _drawBackground() {
    const sb = UIManager.selectionBook;
    if (!sb.background) {
      sb.background = new createjs.Shape();
      sb.background.graphics.beginFill("#666").drawRect(0, 0, 420, 450);
      sb.background.x = 170;
      sb.background.y = 100;
      sb.container.addChild(sb.background);
    }
  },

  /** Draw static header text */
  _drawHeaderText() {
    const sb = UIManager.selectionBook;
    if (sb.headerDrawn) {
      return;
    }

    const bx = sb.background.x;
    const by = sb.background.y;
    /**
     * Create text
     * @param {string} text
     * @param {number} x
     * @param {number} y
     */
    const createText = (text, x, y) => {
      const t = new createjs.Text(text, "20px Arial", "#ffffff");
      t.x = x;
      t.y = y;
      return t;
    };

    sb.cardListText = createText("CARDS", bx + 10, by + 10);
    sb.pageText = createText("P.", bx + 110, by + 10);
    sb.numText = createText("NUM.", bx + 350, by + 10);

    sb.pageDisplay = createText(this.controller.currentPage, bx + 150, by + 10);

    sb.container.addChild(
      sb.cardListText,
      sb.pageText,
      sb.pageDisplay,
      sb.numText,
    );

    sb.headerDrawn = true;
  },

  /**
   * Returns the currently selected card object from the selection board.
   * If the selection board is empty or not initialized, returns null.
   * @returns {Object|undefined} The selected card object
   */
  getSelectedCard() {
    const c = this.controller;
    if (!c) {
      return;
    }

    const selected = c.visibleCards[c.selectedIndexOnPage];

    // Return undefined if stock is zero
    if (!selected || selected.remaining <= 0) {
      return;
    }

    return selected;
  },
};
