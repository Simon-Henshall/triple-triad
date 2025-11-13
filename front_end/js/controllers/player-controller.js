import { Game } from "../game/game.js";
import { SelectionBoardRenderer } from "../renderers/selection-board-renderer.js";

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
   * TODO: UNCALLED
   * Select a card in hand by index
   * @param {number} index
   */
  selectCard(index) {
    const card = this.manager.getHandCard(index);
    if (!card) {
      return;
    }

    this.manager.selectedCard = card;
    this.renderer.indentSelectedCard(card);
    this.ui.selectedCard = card;
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

    // Update selection board preview card to match new selected card
    SelectionBoardRenderer.updateDisplay({ skipTween: true });
  }

  /**
   * TODO: UNCALLED
   * Populate and render the initial hand visually
   */
  populateHand() {
    this.renderer.populateHand();
  }

  /**
   * Reset the player's hand completely
   */
  resetHand() {
    this.manager.resetHand();
    this.renderer.resetHand();
  }
}
