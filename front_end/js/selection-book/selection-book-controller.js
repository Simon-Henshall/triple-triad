/**
 *
 */
export class SelectionBookController {
  /**
   *
   */
  constructor(deck = [], cardsPerPage = 11) {
    this.cards = deck.map((c) => ({
      ...c,
      remaining: (c.count ?? 0) - (c.selected ?? 0),
    }));
    this.cardsPerPage = cardsPerPage;

    this.currentPage = 1;
    this.selectedIndexOnPage = 0; // index within the current page slice
  }

  /** All cards with remaining > 0 */
  get remainingCards() {
    return this.cards.filter((c) => c.remaining > 0);
  }

  /** Total pages based on remaining cards */
  get totalPages() {
    return Math.max(
      1,
      Math.ceil(this.remainingCards.length / this.cardsPerPage),
    );
  }

  /** Slice of remaining cards for the current page */
  get visibleCards() {
    const start = (this.currentPage - 1) * this.cardsPerPage;
    return this.remainingCards.slice(start, start + this.cardsPerPage);
  }

  /** Get the currently selected card object */
  get selectedCard() {
    return this.visibleCards[this.selectedIndexOnPage];
  }

  /** Move cursor down */
  moveNext() {
    if (this.selectedIndexOnPage < this.visibleCards.length - 1) {
      this.selectedIndexOnPage++;
    } else if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.selectedIndexOnPage = 0;
    }
  }

  /** Move cursor up */
  movePrevious() {
    if (this.selectedIndexOnPage > 0) {
      this.selectedIndexOnPage--;
    } else if (this.currentPage > 1) {
      this.currentPage--;
      this.selectedIndexOnPage = this.visibleCards.length - 1;
    }
  }

  /** Paginate left/right manually */
  paginate(direction) {
    if (direction === "right" && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (direction === "left" && this.currentPage > 1) {
      this.currentPage--;
    }
    this.selectedIndexOnPage = 0; // reset cursor to top of page
  }
}
