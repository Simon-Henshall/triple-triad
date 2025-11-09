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
    this.selectedIndex = cards.length > 0 ? 0 : -1;
  }

  /** @returns {number} Total pages based on current cards and cardsPerPage */
  get totalPages() {
    return Math.max(1, Math.ceil(this.cards.length / this.cardsPerPage));
  }

  /** @returns {number} Index of the first card on the current page */
  get pageStart() {
    return (this.currentPage - 1) * this.cardsPerPage;
  }

  /** @returns {number} Index of the last card on the current page */
  get pageEnd() {
    return this.pageStart + this.displayedCards.length - 1;
  }

  /** @returns {Array} Slice of cards currently displayed on this page */
  get displayedCards() {
    return this.cards.slice(this.pageStart, this.pageStart + this.cardsPerPage);
  }

  /** @returns {Object|undefined} Currently selected card */
  get selectedCard() {
    return this.selectedIndex >= 0 ? this.cards[this.selectedIndex] : undefined;
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
    if (this.cards.length === 0) {
      return -1;
    }
    return Math.max(0, Math.min(index, this.cards.length - 1));
  }

  /** Clamp a page number to valid range */
  _clampPage(page) {
    return Math.max(1, Math.min(page, this.totalPages));
  }

  /**
   * Set current page safely and reset selection to first card on page
   * @param {number} newPage
   */
  _setPage(newPage) {
    this.currentPage = this._clampPage(newPage);
    this.selectedIndex = this.cards.length > 0 ? this.pageStart : -1;
  }

  /**
   * Select a specific card by absolute index
   * @param {number} index
   * @returns {boolean} True if requested index was valid
   */
  selectIndex(index) {
    const clamped = this._clampIndex(index);
    this.selectedIndex = clamped;
    return clamped === index;
  }

  /** Move selection to next card (absolute) */
  selectNext() {
    this.selectIndex(this.selectedIndex + 1);
  }

  /** Move selection to previous card (absolute) */
  selectPrevious() {
    this.selectIndex(this.selectedIndex - 1);
  }

  /** Move to next page (if available) and reset selection to first card */
  paginateRight() {
    this._setPage(this.currentPage + 1);
  }

  /** Move to previous page (if available) and reset selection to first card */
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
    if (this.selectedIndex < this.pageStart) {
      this.selectedIndex = this.pageStart;
    }
    if (this.selectedIndex > this.pageEnd) {
      this.selectedIndex = this.pageEnd;
    }
  }
}
