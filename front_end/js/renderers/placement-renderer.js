import { Game } from "../game/game.js";
import { offsets } from "../constants/offsets.js";
import { ai } from "../game/ai.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { UIManager } from "../managers/ui-manager.js";

/**
 * Handles all visual animations and effects for card placement,
 * including transitions offscreen, board entry, and element bonuses/penalties.
 */
export class PlacementRenderer {
  /**
   * Animate a card moving offscreen (before being placed on the board).
   *
   * @param {createjs.Container} card - The card to animate.
   * @param {number} offscreenX - Target X coordinate offscreen.
   * @param {number} offscreenY - Target Y coordinate offscreen.
   * @param {(card: createjs.Container) => void} [onComplete] - Callback when animation finishes.
   */
  moveCardOffscreen(card, offscreenX, offscreenY, onComplete) {
    createjs.Tween.get(card)
      .to({ x: offscreenX, y: offscreenY }, 500)
      .call(() => onComplete?.(card));
  }

  /**
   * Animate a card moving from offscreen to its target board position.
   *
   * @param {createjs.Container} card - The card to animate.
   * @param {number} placementX - Final X coordinate on the board.
   * @param {number} placementY - Final Y coordinate on the board.
   * @param {(card: createjs.Container) => void} [onComplete] - Callback when animation finishes.
   */
  moveCardToBoard(card, placementX, placementY, onComplete) {
    // Ensure card renders above all others
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => onComplete?.(card));
  }

  /**
   * Display a visual indicator for element effects (e.g., +1 / −1) on a card.
   *
   * @param {createjs.Container} card - The card to attach the effect to.
   * @param {string} effectImagePath - File path to the effect image.
   */
  showElementEffect(card, effectImagePath) {
    const effectBmp = new createjs.Bitmap(effectImagePath);

    // Position effect relative to card center
    effectBmp.x = card.x + offsets.cardWidth / 4;
    effectBmp.y = card.y + offsets.cardHeight / 3;

    Game.stage.addChild(effectBmp);
    Game.stage.setChildIndex(effectBmp, Game.stage.getNumChildren() - 1);
  }

  /**
   * Shift cards in the current player's hand downward after a placement,
   * or adjust AI cards accordingly.
   */
  shiftHandCardsDown() {
    if (getPlayerTurn() === "blue") {
      const playerManager = Game.managers.playerManager;
      playerManager.shiftCardsDown(offsets);
    } else {
      // AI hand movement
      this.animateDown(ai.cardsInAIHand, ai.aiCardsAboveSelection);
    }
  }

  /**
   * Animate a downward offset for a given set of cards.
   *
   * @param {createjs.Container[]} hand - The array of card containers to animate.
   * @param {number} count - How many cards to shift down.
   */
  animateDown(hand, count) {
    for (let index = 0; index < count; index++) {
      createjs.Tween.get(hand[index]).to(
        { y: hand[index].y + offsets.handCardOffset },
        200,
      );
    }
  }

  /**
   * Indent the newly selected default card after placement (visual feedback).
   */
  indentAfterPlacement() {
    if (UIManager.selectedCard) {
      UIManager.selectedCard.x -= 30;
    }
  }
}
