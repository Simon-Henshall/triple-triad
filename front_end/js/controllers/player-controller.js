import { Game } from "../game/game.js";

/**
 * Bridges player input, logical state, and rendering.
 */
export class PlayerController {
  /**
   * @param {PlayerManager} manager
   * @param {PlayerRenderer} renderer
   * @param {Object} uiManager
   */
  constructor(manager, renderer, uiManager) {
    this.manager = manager;
    this.renderer = renderer;
    this.ui = uiManager;
  }

  /**
   * Reset the player's hand completely
   */
  resetHand() {
    this.manager.resetHand();
    this.renderer.resetHand();
  }
}
