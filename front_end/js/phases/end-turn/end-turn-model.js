/**
 * EndTurnModel
 * Minimal model used by the end-turn phase to hold any small state required
 * for the transition (kept intentionally small for now).
 */
export default class EndTurnModel {
  /**
   * Initialises the EndTurnModel with a scoreboard.
   */
  constructor({ scoreboard } = {}) {
    this.scoreboard = scoreboard;
  }

  /**
   * @unimplemented TODO: Implement this
   * Get the scoreboard instance.
   */
  getScoreboard() {
    return this.scoreboard;
  }
}
