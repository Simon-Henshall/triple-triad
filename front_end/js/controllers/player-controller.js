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
   * Remove the last card from the hand (e.g., cancel action)
   */
  removeLastCard() {
    const removedContainer = this.manager.removeLastCard();
    if (!removedContainer) {
      return;
    }

    const index = this.manager.hand.length;

    // Animate the removed card back to hand (reverse)
    this.renderer.animateCardToHand(removedContainer, index, true);

    // Immediately update z-order of remaining hand + preview
    this.renderer._updateHandAndPreviewZOrder();
    Game.stage.update();
  }

  /**
   * Reset the player's hand completely
   */
  resetHand() {
    this.manager.resetHand();
    this.renderer.resetHand();
  }
}
