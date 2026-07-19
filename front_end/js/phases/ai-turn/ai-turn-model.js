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
    /**
     * Random placement delay (50-2000ms) determined once per game instance.
     * Used as the base timing for AI thinking animation steps and final placement pause.
     * This creates a unique, consistent "personality" for the AI each game.
     */
    this.placementDelay = Math.floor(Math.random() * 1951) + 50;
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
   * Choose which card index to play (stores selection index without removing the card).
   * Call takeCard() after the visual delay to actually remove it from the hand.
   * @returns {number} The index of the chosen card, or -1 if hand is empty.
   */
  chooseCard() {
    if (this.hand.length === 0) {
      return -1;
    }
    const cardIndex = Math.floor(Math.random() * this.hand.length);
    this.cardsAboveSelection = cardIndex;
    return cardIndex;
  }

  /**
   * Remove the previously selected card from the hand (call after chooseCard + visual delay).
   * @returns {Card|undefined} The removed card, or undefined if nothing to remove.
   */
  takeCard() {
    if (
      this.cardsAboveSelection < 0 ||
      this.cardsAboveSelection >= this.hand.length
    ) {
      return;
    }
    return this.hand.splice(this.cardsAboveSelection, 1)[0];
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
