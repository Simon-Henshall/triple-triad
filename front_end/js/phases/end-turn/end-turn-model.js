/**
 * EndTurnModel
 * Minimal model used by the end-turn phase to hold any small state required
 * for the transition (kept intentionally small for now).
 */
import { Game } from "../../shared/game/game.js";

/**
 * Class representing the model for the end-turn phase.
 * Currently holds a reference to the scoreboard for updating scores at end of turn.
 */
export default class EndTurnModel {
  /**
   * Initialises the EndTurnModel with a scoreboard.
   */
  constructor({ scoreboard } = {}) {
    this.scoreboard = scoreboard;
  }

  /**
   * Get the scoreboard instance.
   * Returns the injected scoreboard or falls back to the global UI scoreboard.
   */
  getScoreboard() {
    // Prefer an explicitly injected scoreboard
    if (this.scoreboard) {
      return this.scoreboard;
    }

    // Fallback to the global Game.ui.scoreBoard if available
    return Game?.ui?.scoreBoard ?? undefined;
  }
}
