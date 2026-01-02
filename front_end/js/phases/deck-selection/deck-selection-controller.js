import { Game } from "../../shared/game/game";

/**
 * Deck Selection Controller
 * @export
 * @class DeckSelectionController
 * @typedef {DeckSelectionController}
 */
export class DeckSelectionController {
  /**
   * Constructor for the DeckSelectionController
   * @param {Array} deck - Array of Card objects with count and selected properties
   * @param {PlayerModel} playerModel - Reference to the player model
   */
  constructor({ deck = [], playerModel }) {
    this.cards = deck.map((c) => ({
      ...c,
      remaining: (c.count ?? 0) - (c.selected ?? 0),
      initiallyHidden: (c.count ?? 0) === 0,
    }));
    this.playerModel = playerModel;
    this.cardsPerPage = 11;

    this.currentPage = 1;
    this.selectedIndexOnPage = 0;
  }

  /** Cards that should actually appear in the book (for both display and selection) */
  get displayedCards() {
    // Recalculate remaining per archetype
    return this.cards
      .map((archetype) => {
        const inHandCount = this.playerModel?.hand.filter(
          (h) => h.data.id === archetype.data.id,
        ).length;
        return {
          ...archetype,
          remaining: (archetype.count ?? 0) - inHandCount,
        };
      })
      .filter((c) => {
        // Keep if:
        // 1️⃣ It was NOT initially hidden (had stock at the start), OR
        // 2️⃣ It’s dynamically dropped to 0 after being visible
        return !c.initiallyHidden;
      });
  }

  /** Page-based slicing */
  get visibleCards() {
    const CARDS_PER_PAGE = this.cardsPerPage ?? 11;
    const pageStart = (this.currentPage - 1) * CARDS_PER_PAGE;
    const pageEnd = pageStart + CARDS_PER_PAGE;
    return this.displayedCards.slice(pageStart, pageEnd);
  }

  /** Total pages */
  get totalPages() {
    return Math.max(
      1,
      Math.ceil(this.displayedCards.length / this.cardsPerPage),
    );
  }

  /** Current selection */
  get selectedCard() {
    return this.visibleCards[this.selectedIndexOnPage];
  }

  /** Cursor movement */
  moveNext() {
    const cards = this.visibleCards;
    if (cards.length === 0) {
      return;
    }
    this.selectedIndexOnPage = Math.min(
      this.selectedIndexOnPage + 1,
      cards.length - 1,
    );
  }

  /**
   * Returns the currently selected card from the visible cards, or null if no selection is made.
   * @returns {Card|null}
   *
   */
  movePrevious() {
    if (this.visibleCards.length === 0) {
      return;
    }
    this.selectedIndexOnPage = Math.max(this.selectedIndexOnPage - 1, 0);
  }

  /**
   * Handles pagination of the selection board.
   * @param {"up|down|left|right"} direction
   */
  paginate(direction) {
    if (direction === "right" && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (direction === "left" && this.currentPage > 1) {
      this.currentPage--;
    }
    this.selectedIndexOnPage = 0;
  }

  /**
   * Selection phase setup.
   * Called when the selection phase has started.
   */
  activate() {
    Game.setupSelectionBook(this.playerModel);

    // If the view exists later, notify it here:
    // this.view?.show();
  }

  /**
   * Selection phase cleanup.
   * Called when the selection phase has ended.
   */
  deactivate() {
    // For now this can remain empty or contain minimal cleanup.
    // Later maybe:
    // - hide/remove selection book UI
    // - detach input handlers
    // - reset cursor visuals
  }
}
