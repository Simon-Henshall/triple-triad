/**
 * GameOverModel
 * Handles game outcome determination: comparing card counts,
 * determining win/lose/draw, and managing sudden death rules.
 */
export default class GameOverModel {
  /**
   * Creates a GameOverModel instance.
   * @param {Object} localDeps - dependencies provided by the state machine
   */
  constructor(localDeps = {}) {
    this.playerModel = localDeps.playerModel;
    this.aiTurnModel = localDeps.aiTurnModel;
  }

  /**
   * Determine the outcome of the current match.
   * @returns {string} "win", "lose", or "draw"
   */
  determineOutcome() {
    if (!this.playerModel || !this.aiTurnModel) {
      console.error("[Game Over Model] Missing player or AI model");
      return "draw";
    }

    const aiCards = this.aiTurnModel.currentlyOwnedCards;
    const playerCards = this.playerModel.totalBlueCards;

    if (aiCards > playerCards) {
      return "lose";
    } else if (playerCards > aiCards) {
      return "win";
    } else {
      return "draw";
    }
  }

  /**
   * Get the current card counts for display.
   * @returns {Object} { aiCards, playerCards }
   */
  getCardCounts() {
    return {
      aiCards: this.aiTurnModel?.currentlyOwnedCards || 0,
      playerCards: this.playerModel?.totalBlueCards || 0,
    };
  }
}
