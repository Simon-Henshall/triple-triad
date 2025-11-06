import { Game } from "../game/game.js";

/**
 * Manages the visual and logical state of the selection board.
 * Holds references to the container, background, card displays, pagination info, and selected card.
 *
 * This manager does NOT render individual cards; rendering is handled by
 * SelectionBoardRenderer using the data stored here.
 */
export const SelectionBoardManager = {
  /** @type {createjs.Container|undefined} Container for all selection board elements */
  container: undefined,

  /** @type {createjs.Shape|undefined} Background shape for the selection board */
  background: undefined,

  /** @type {createjs.Text|undefined} Display text for current page */
  pageDisplay: undefined,

  /** @type {createjs.Text|undefined} Display text for total pages */
  totalPagesDisplay: undefined,

  /** @type {createjs.Container|undefined} Container holding the currently shown cards */
  shownCards: undefined,

  /** @type {createjs.Container|undefined} Container for the preview card */
  displayedCard: undefined,

  /** @type {createjs.Bitmap|undefined} Image element for preview card background/colour */
  displayedCardColour: undefined,

  /** @type {createjs.Bitmap|undefined} Image element for preview card artwork */
  displayedCardImage: undefined,

  /** @type {number} Current page number being displayed */
  page: 1,

  /** @type {number} Total number of pages based on cards available */
  totalPages: 1,

  /** @type {number} Number of cards on the current page */
  remainingCards: 0,

  /** @type {Object|undefined} Currently selected card object (for preview) */
  selectedHandCard: undefined,

  /**
   * Initialise the selection board container and background.
   * Adds the container to the global Game.stage.
   * Note: background color and dimensions here are default placeholders;
   * calling code may replace them (e.g., pickPlayerCards).
   */
  init() {
    this.container = new createjs.Container();
    this.container.name = "selectionBoardContainer";

    this.background = new createjs.Shape();
    this.background.graphics.beginFill("#666666").drawRect(100, 100, 500, 500);
    this.background.x = 100;
    this.background.y = 100;
    this.container.addChild(this.background);

    Game.stage.addChild(this.container);
  },

  /**
   * Reset all visual and state properties of the selection board to defaults.
   * Removes any existing displayed cards from the stage and clears containers.
   */
  resetDisplayState() {
    // Reset pagination and selection
    this.page = 1;
    this.totalPages = 1;
    this.remainingCards = 0;
    this.selectedHandCard = undefined;

    // Clear the shownCards container
    if (this.shownCards) {
      this.shownCards.removeAllChildren();
    }

    // Remove preview card from stage if present
    if (this.displayedCard) {
      this.displayedCard.remove();
    }

    // Reset preview card references
    this.displayedCard = undefined;
    this.displayedCardColour = undefined;
    this.displayedCardImage = undefined;
  },
};
