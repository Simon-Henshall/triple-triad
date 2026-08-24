/**
 * EndTurnView
 * Lightweight view for any small visuals that should occur during the end-turn
 * phase (scoreboard refresh or short transition animations).
 */
export default class EndTurnView {
  /**
   * Creates an EndTurnView instance.
   * @param {createjs.Stage} stage
   */
  constructor(stage) {
    this.stage = stage;
  }

  /**
   * Placeholder hook if any animation or UI work is needed when end-turn runs
   */
  show() {
    // Currently no animations required; scoreboard update handled elsewhere
  }

  /**
   * Placeholder hook if any cleanup is needed when end-turn ends
   */
  hide() {
    // No-op for now
  }

  /**
   * Activate the end-turn view (alias for show).
   */
  activate() {
    this.show();
  }

  /**
   * Deactivate the end-turn view (alias for hide).
   */
  deactivate() {
    this.hide();
  }
}
