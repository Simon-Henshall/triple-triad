export class SelectionBoardController {
  constructor(cards = [], cardsPerPage = 11) {
    this.cards = cards; // logical hand / deck
    this.cardsPerPage = cardsPerPage;
    this.currentPage = 1;
    this.selectedIndex = 0; // absolute index
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.cards.length / this.cardsPerPage));
  }

  get pageStart() {
    return (this.currentPage - 1) * this.cardsPerPage;
  }

  get displayedCards() {
    return this.cards.slice(this.pageStart, this.pageStart + this.cardsPerPage);
  }

  selectIndex(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.cards.length - 1));
  }

  selectNext() {
    this.selectIndex(this.selectedIndex + 1);
  }

  selectPrevious() {
    this.selectIndex(this.selectedIndex - 1);
  }

  get selectedCard() {
    return this.cards[this.selectedIndex] || null;
  }

  paginate(direction) {
    if (direction === "left" && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === "right" && this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    // Clamp selectedIndex to top of page
    this.selectedIndex = this.pageStart;
  }

  get selectedIndexOnPage() {
    return this.selectedIndex - this.pageStart;
  }

  clampSelectionToPage() {
    const start = this.pageStart;
    const end = start + this.displayedCards.length - 1;
    if (this.selectedIndex < start) this.selectedIndex = start;
    if (this.selectedIndex > end) this.selectedIndex = end;
  }
}
