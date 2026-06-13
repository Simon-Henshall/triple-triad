/**
 * CardClaimModel
 * Stores state for the card-claim phase: the AI's initial hand
 * (the 5 cards the AI started the game with) and which card
 * the player currently has selected.
 */
export default class CardClaimModel {
  /**
   * Creates a CardClaimModel instance.
   * @param {Object} localDeps - dependencies provided by the state machine
   */
  constructor(localDeps = {}) {
    /** @type {import("../../shared/card/card.js").Card[]} */
    this.aiInitialCards = localDeps.aiInitialCards || [];
    this.selectedIndex = 0;
  }

  /**
   * Get the currently selected card.
   * @returns {import("../../shared/card/card.js").Card|undefined}
   */
  getSelectedCard() {
    return this.aiInitialCards[this.selectedIndex] || undefined;
  }

  /**
   * Move selection left (wrap around).
   */
  selectPrev() {
    if (this.aiInitialCards.length === 0) {
      return;
    }
    this.selectedIndex =
      (this.selectedIndex - 1 + this.aiInitialCards.length) %
      this.aiInitialCards.length;
  }

  /**
   * Move selection right (wrap around).
   */
  selectNext() {
    if (this.aiInitialCards.length === 0) {
      return;
    }
    this.selectedIndex = (this.selectedIndex + 1) % this.aiInitialCards.length;
  }
}
