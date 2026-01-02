import EndTurnModel from "./end-turn-model.js";
import EndTurnView from "./end-turn-view.js";
import { swapPlayerTurn, getPlayerTurn } from "../../utilities/turn.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { Game } from "../../shared/game/game.js";
import { PhaseChecker } from "../../game/phases.js";

/**
 * EndTurnController
 * Responsible for handling end-of-turn logic: update scoreboard, check for
 * game over, swap the active player and transition to the next phase.
 */
export default class EndTurnController {
  /**
   * Creates an EndTurnController instance.
   * @param {Object} localDeps - dependencies provided by the state machine
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps = {}, transition) {
    this.transition = transition;
    this.model = new EndTurnModel(localDeps);
    this.view = new EndTurnView(Game.stage);
  }

  /**
   * Activate the end-turn phase: perform bookkeeping and move to next phase.
   */
  async activate() {
    // Ensure scoreboard reflects latest counts
    try {
      Game.ui?.scoreBoard?.update?.();
    } catch (error) {
      console.error("EndTurnController: failed to update scoreboard", error);
    }

    // If the board is full, end the game
    if (BoardModel.isGameOver()) {
      await this.transition("game-over");
      return;
    }

    // Swap the active player
    swapPlayerTurn();

    // Update PhaseChecker flags for consumer phases
    const current = getPlayerTurn();
    PhaseChecker.playerChoosingCard = current === "blue";

    // Transition to the next logical phase
    await this.transition(current === "red" ? "ai-turn" : "hand-select");
  }

  /**
   * Deactivate the end-turn phase.
   */
  async deactivate() {
    // Nothing to clean up at present
  }
}
