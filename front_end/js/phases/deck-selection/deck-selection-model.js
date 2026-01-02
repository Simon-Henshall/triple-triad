/**
 * Deck Selection Model
 */
export default class DeckSelectionModel {
  /**
   * Constructor
   */
  constructor() {
    this.container = new createjs.Container();
    this.background = undefined;
    this.shownCards = undefined;
    this.page = 1;
    this.pageDisplay = undefined;
    this.totalPages = undefined;
    this.remainingCards = undefined;
    this.displayedCards = undefined;
    this.displayedCard = undefined;
    this.displayedCardImage = undefined;
    this.displayedCardColour = undefined;
    this.selectedHandCardNumber = 0;
    this.selectedHandCard = undefined;
  }
}
