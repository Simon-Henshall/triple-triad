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
   * @unimplemented TODO: Implement this
   * Get all cards that were flipped in this phase
   * @returns {Array<Card>}
   */
  getFlippedCards() {
    return this.flippedCards;
  }

  /**
   * @unimplemented TODO: Implement this
   * Reset the resolution state for the next turn
   */
  reset() {
    this.flippedCards = [];
    this.totalFlipped = 0;
    this.isResolvingFlips = false;
  }

  /**
   * @unimplemented TODO: Implement this
   * Set the resolution state
   * @param {boolean} isResolving
   */
  setResolvingFlips(isResolving) {
    this.isResolvingFlips = isResolving;
  }

  /**
   * @unimplemented TODO: Implement this
   * Check if any cards were flipped in this phase
   * @returns {boolean}
   */
  hasFlips() {
    return this.totalFlipped > 0;
  }
}
