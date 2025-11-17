import { UIManager } from "../../../shared/ui/ui-manager.js";
import { SelectionBookRenderer } from "./selection-book-renderer.js";
import { SelectionBookController } from "./selection-book-controller.js";
import { Game } from "../../../shared/game/game.js";
import { Card } from "../../../shared/card/card.js";

export const SelectionBookUI = {
  controller: undefined,

  /**
   * Initialise the Selection Book UI with a deck
   * @param {Array} deck
   */
  initialise(deck, playerManager) {
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

    sb.cardListText = this.createText("CARDS", bx + 10, by + 10);
    sb.pageText = this.createText("P.", bx + 110, by + 10);
    sb.numText = this.createText("NUM.", bx + 350, by + 10);

    sb.pageDisplay = this.createText(
      this.controller.currentPage,
      bx + 150,
      by + 10,
    );

    sb.container.addChild(
      sb.cardListText,
      sb.pageText,
      sb.pageDisplay,
      sb.numText,
    );

    sb.headerDrawn = true;
  },

  /**
   * Creates a text object with the given text and position.
   * @param {string} text - the text to display
   * @param {number} x - the x position of the text
   * @param {number} y - the y position of the text
   * @returns {Object} a createjs.Text object with the given text and position
   */
  createText(text, x, y) {
    const t = new createjs.Text(text, "20px Arial", "#ffffff");
    t.x = x;
    t.y = y;
    return t;
  },

  /**
   * Returns the currently selected card object from the selection board.
   * If the selection board is empty or not initialised, returns null.
   * @returns {Object|undefined} The selected card object
   */
  getSelectedCard() {
    const selected =
      this.controller.visibleCards[this.controller.selectedIndexOnPage];

    if (!selected || selected.remaining <= 0) {
      console.warn(
        `[Selection Book UI] Attempted to add ${selected?.data?.name}, but there's no stock for that card.`,
      );
      return;
    }

    // Return a proper Card instance
    const card = new Card(selected.data, selected.owner, 1); // count = 1 for hand
    card.visuals = { ...selected.visuals }; // preserve existing bitmaps
    return card;
  },
};
