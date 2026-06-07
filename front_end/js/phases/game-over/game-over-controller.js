import GameOverModel from "./game-over-model.js";
import GameOverView from "./game-over-view.js";
import { Game } from "../../shared/game/game.js";

/**
 * GameOverController
 * Responsible for handling the game-over phase: determining the outcome,
 * displaying the result to the player, and managing transitions based on
 * game rules (e.g., sudden death).
 */
export default class GameOverController {
  /**
   * Creates a GameOverController instance.
   * @param {Object} localDeps - dependencies provided by the state machine
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps = {}, transition) {
    this.transition = transition;
    this.model = new GameOverModel(localDeps);
    this.view = new GameOverView(Game.stage);
  }

  /**
   * Activate the game-over phase: determine outcome, display result,
   * and handle sudden death rule if applicable.
   */
  async activate() {
    // Determine the match outcome
    const outcome = this.model.determineOutcome();
    const counts = this.model.getCardCounts();

    // Display the outcome to the player
    this.view.displayOutcome(outcome, counts);

    // Handle sudden death rule: restart game if it's a draw and sudden_death is active
    if (outcome === "draw" && Game.rules.includes("sudden_death")) {
      console.log(
        "[Game Over Controller] Draw detected with sudden_death rule - restarting game",
      );
      Game.startGame();
      return;
    }

    // For other outcomes, game is complete
    console.log(`[Game Over Controller] Game over - ${outcome}`);
  }

  /**
   * Deactivate the game-over phase.
   */
  async deactivate() {
    this.view.cleanup();
  }
}
