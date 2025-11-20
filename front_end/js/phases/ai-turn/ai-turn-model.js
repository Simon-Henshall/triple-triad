/**
 * AI Turn Model
 * Holds all AI hand/deck data and turn state.
 */
export class AITurnModel {
  /**
   * Create a new AI turn model
   */
  constructor() {
    this.deck = []; // AI deck
    this.hand = []; // AI hand (max 5)
    this.movesRemaining = 0; // Number of cards left to play
    this.cardsAboveSelection = 0;
    this.currentlyOwnedCards = 5; // Initial number of cards owned by AI
  }

  /**
   * Initialise AI hand from the deck
   * Returns an array of cards drawn
   */
  populateHand(maxHandSize = 5) {
    const drawnCards = [];
    for (let index = 0; index < maxHandSize && this.deck.length > 0; index++) {
      const randomIndex = Math.floor(Math.random() * this.deck.length);
      const [card] = this.deck.splice(randomIndex, 1);
      this.hand.push(card);
      drawnCards.push(card);
    }
    this.movesRemaining = this.hand.length;
    return drawnCards;
  }

  /**
   * Choose a card to play
   */
  chooseCard() {
    if (this.hand.length === 0) {
      return;
    }
    const cardIndex = Math.floor(Math.random() * this.hand.length);
    this.cardsAboveSelection = cardIndex;
    return this.hand.splice(cardIndex, 1)[0];
  }

  /**
   * Count moves left
   */
  decrementMove() {
    this.movesRemaining--;
  }

  /**
   * Check if turn is complete
   */
  isTurnComplete() {
    return this.movesRemaining <= 0;
  }

  /**
   * Reset hand
   */
  resetHand() {
    this.hand = [];
    this.movesRemaining = 0;
  }

  /**
   * Get the number of cards in the hand
   */
  getCardCountDisplay() {
    return this.currentlyOwnedCards;
  }
}
