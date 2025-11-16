/**
 * Bridges player input, logical state, and rendering.
 */
export class PlayerController {
  /**
   * Constructor for PlayerController
   * @param {PlayerManager} manager - instance of PlayerManager
   * @param {PlayerRenderer} renderer - instance of PlayerRenderer
   * @param {Object} uiManager - instance of UIManager
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
