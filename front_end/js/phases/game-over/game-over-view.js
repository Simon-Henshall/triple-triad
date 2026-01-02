/**
 * GameOverView
 * Handles display of game outcome messages and UI transitions
 * for the game over phase.
 */
export default class GameOverView {
  /**
   * Creates a GameOverView instance.
   * @param {Object} stage - the CreateJS stage
   */
  constructor(stage) {
    this.stage = stage;
    this.container = undefined;
  }

  /**
   * Display the game outcome to the player.
   * @param {string} outcome - "win", "lose", or "draw"
   * @param {Object} counts - { aiCards, playerCards } card counts
   */
  displayOutcome(outcome, counts) {
    try {
      // Determine message based on outcome
      let message = "";
      switch (outcome) {
        case "win": {
          message = `You win! Final score - You: ${counts.playerCards}, AI: ${counts.aiCards}`;
          break;
        }
        case "lose": {
          message = `You lose! Final score - You: ${counts.playerCards}, AI: ${counts.aiCards}`;
          break;
        }
        case "draw": {
          message = `Draw! Final score - You: ${counts.playerCards}, AI: ${counts.aiCards}`;
          break;
        }
        default: {
          message = "Game Over";
        }
      }

      alert(message);
    } catch (error) {
      console.error("GameOverView: failed to display outcome", error);
    }
  }

  /**
   * Clear any UI elements from the view.
   */
  cleanup() {
    if (this.container && this.stage) {
      try {
        this.stage.removeChild(this.container);
      } catch (error) {
        console.error("GameOverView: failed to cleanup container", error);
      }
    }
  }
}
