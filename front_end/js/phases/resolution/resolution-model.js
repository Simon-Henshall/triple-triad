/**
 * ResolutionModel tracks the state of card flips during the resolution phase.
 * It manages which cards have been flipped and their ownership changes.
 */
export default class ResolutionModel {
  /**
   * Constructor for ResolutionModel
   */
  constructor() {
    /**
     * Array of cards that have been flipped during this resolution phase
     * @type {Array<Card>}
     */
    this.flippedCards = [];

    /**
     * Total number of cards flipped in this resolution phase
     * @type {number}
     */
    this.totalFlipped = 0;

    /**
     * Whether resolution phase is currently active
     * @type {boolean}
     */
    this.isResolvingFlips = false;
  }

  /**
   * Record a card that has been flipped
   * @param {Card} card - The card that was flipped
   */
  recordFlip(card) {
    if (!this.flippedCards.includes(card)) {
      this.flippedCards.push(card);
      this.totalFlipped++;
    }
  }

  /**
   * Get the list of flipped cards
   * @returns {Array<Card>} The array of flipped cards
   */
  getFlippedCards() {
    return this.flippedCards;
  }

  /**
   * Check if there are any flips recorded
   * @returns {boolean} Whether there are any flipped cards
   */
  hasFlips() {
    return this.flippedCards.length > 0;
  }

  /**
   * Set whether the resolution phase is currently resolving flips
   * @param {boolean} value - The new state
   */
  setResolvingFlips(value) {
    this.isResolvingFlips = value;
  }

  /**
   * Reset the model state, clearing all flips
   */
  reset() {
    this.flippedCards = [];
    this.totalFlipped = 0;
    this.isResolvingFlips = false;
  }
}
