/**
 * Handles the logical state of the selection board.
 * Tracks available cards, pagination, and selected index.
 * Provides helper methods for safe navigation and page management.
 */
export class SelectionBoardController {
  /**
   * @param {Array} cards - Array of card objects
   * @param {number} cardsPerPage - How many cards to show per page
   */
  constructor(cards = [], cardsPerPage = 11) {
    /** @type {Array} All cards on the selection board */
    this.cards = cards;

    /** @type {number} Number of cards per page */
    this.cardsPerPage = cardsPerPage;

    /** @type {number} Current page, 1-based */
    this.currentPage = 1;

    /** @type {number} Absolute selected index within cards array */
    this.selectedIndex = 0;
  }

  /** @returns {number} Total pages based on current cards and cardsPerPage */
  get totalPages() {
    return Math.max(1, Math.ceil(this.cards.length / this.cardsPerPage));
  }

  /** @returns {number} Index of the first card on the current page */
  get pageStart() {
    return (this.currentPage - 1) * this.cardsPerPage;
  }

  /** @returns {Array} Slice of cards currently displayed on this page */
  get displayedCards() {
    return this.cards.slice(this.pageStart, this.pageStart + this.cardsPerPage);
  }

  /** @returns {Object|undefined} Currently selected card */
  get selectedCard() {
    return this.cards[this.selectedIndex];
  }

  /** @returns {number} Index relative to the current page */
  get selectedIndexOnPage() {
    return this.selectedIndex - this.pageStart;
  }

  /**
   * Clamp a provided index to valid range
   * @param {number} index
   * @returns {number}
   */
  _clampIndex(index) {
    return Math.max(0, Math.min(index, this.cards.length - 1));
  }

  /**
   * Set current page safely and reset selection to first card on page
   * @param {number} newPage
   */
  _setPage(newPage) {
    this.currentPage = Math.max(1, Math.min(newPage, this.totalPages));
    this.selectedIndex = this.pageStart;
  }

  /**
   * Select a specific card by absolute index
   * @param {number} index
   */
  selectIndex(index) {
    this.selectedIndex = this._clampIndex(index);
  }

  /**
   * Move selection to next card (absolute)
   * Clamped to array bounds
   */
  selectNext() {
    this.selectIndex(this.selectedIndex + 1);
  }

  /**
   * Move selection to previous card (absolute)
   * Clamped to array bounds
   */
  selectPrevious() {
    this.selectIndex(this.selectedIndex - 1);
  }

  /**
   * Move to next page (if available) and reset selection to first card
   */
  paginateRight() {
    this._setPage(this.currentPage + 1);
  }

  /**
   * Move to previous page (if available) and reset selection to first card
   */
  paginateLeft() {
    this._setPage(this.currentPage - 1);
  }

  /**
   * Paginate left or right and reset selectedIndex to top of new page
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    if (direction === "left") {
      this.paginateLeft();
    } else if (direction === "right") {
      this.paginateRight();
    }
  }

  /**
   * Clamp selection to current page bounds
   * Useful if selectNext()/selectPrevious() may exceed page
   */
  clampSelectionToPage() {
    const start = this.pageStart;
    const end = start + this.displayedCards.length - 1;
    if (this.selectedIndex < start) {
      this.selectedIndex = start;
    }
    if (this.selectedIndex > end) {
      this.selectedIndex = end;
    }
  }
}
