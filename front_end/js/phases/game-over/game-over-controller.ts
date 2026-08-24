import CardClaimController from "../card-claim/card-claim-controller.js";
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
    this._returnedFromClaim =
      localDeps?.result === "claimed" || localDeps?.result === "skipped";
  }

  /**
   * Transition to card-claim phase directly.
   * The state machine's currentPhaseName is unreliable because game-over
   * is often reached via direct instantiation (from placement-model.js).
   * So we instantiate the card-claim controller directly, just like the
   * rest of the game does.
   */
  _goToCardClaim() {
    this._returnedFromClaim = true;

    // Build deps for card-claim: pass the AI's initial hand snapshot
    const aiInitialCards =
      Game.models?.stateMachine?.rootDeps?.aiInitialCards || [];
    const cardClaim = new CardClaimController(
      { aiInitialCards },
      this.transition,
    );
    cardClaim.activate();
  }

  /**
   * Activate the game-over phase: determine outcome, display result,
   * and handle transitions (card-claim on win, sudden death on draw).
   */
  async activate() {
    // Determine the match outcome
    const outcome = this.model.determineOutcome();
    const counts = this.model.getCardCounts();

    // On a win, first show the win overlay, then transition to card-claim
    // UNLESS we're returning from card-claim (payload indicates this)
    if (outcome === "win") {
      console.log("[Game Over Controller] Win detected");

      // If returning from card-claim, just show the final overlay without redirect
      if (this._returnedFromClaim) {
        this.view.displayOutcome(outcome, counts);
        this._returnedFromClaim = false;
        return;
      }

      console.log("[Game Over Controller] Win - transitioning to card-claim");
      this.view.displayOutcome(outcome, counts, () => this._goToCardClaim());
      return;
    }

    // Handle sudden death rule: restart game if it's a draw and sudden_death is active
    if (outcome === "draw" && Game.rules.includes("sudden_death")) {
      console.log(
        "[Game Over Controller] Draw detected with sudden_death rule - restarting game",
      );
      this.view.displayOutcome(outcome, counts);
      Game.startGame();
      return;
    }

    // For other outcomes (lose), game is complete
    console.log(`[Game Over Controller] Game over - ${outcome}`);
    this.view.displayOutcome(outcome, counts);
  }

  /**
   * Deactivate the game-over phase.
   */
  async deactivate() {
    this.view.cleanup();
  }
}
