/**
 * Handles the logical state of the selection board.
 * Tracks available cards, pagination, and selected index.
 */
export class SelectionBoardController {
  /**
   * @param {Array} cards - Array of card objects
   * @param {number} cardsPerPage - How many cards to show per page
   */
  constructor(cards = [], cardsPerPage = 11) {
    this.cards = cards;
    this.cardsPerPage = cardsPerPage;
    this.currentPage = 1;
    this.selectedIndex = 0; // absolute index
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

  /**
   * Select a specific card by absolute index
   * @param {number} index
   */
  selectIndex(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.cards.length - 1));
  }

  /** Select the next card (moves right/down logically) */
  selectNext() {
    this.selectIndex(this.selectedIndex + 1);
  }

  /** Select the previous card (moves left/up logically) */
  selectPrevious() {
    this.selectIndex(this.selectedIndex - 1);
  }

  /** @returns {Object|null} Currently selected card object */
  get selectedCard() {
    return this.cards[this.selectedIndex] || null;
  }

  /**
   * Paginate left or right and reset selectedIndex to top of new page
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    if (direction === "left" && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === "right" && this.currentPage < this.totalPages) {
      this.currentPage++;
    }

    // Reset selection to top of page
    this.selectedIndex = this.pageStart;
  }

  /** @returns {number} Index relative to current page */
  get selectedIndexOnPage() {
    return this.selectedIndex - this.pageStart;
  }

  /** Clamp selection to current page bounds */
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
