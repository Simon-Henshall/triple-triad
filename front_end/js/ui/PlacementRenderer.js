// =======================================
// File: front_end/js/ui/PlacementRenderer.js
// =======================================

import { Game } from "../game/game.js";
import { offsets } from "../render/offsets.js";

/**
 * Handles all animations and visual effects for card placement,
 * including moving cards offscreen, onto the board, and showing
 * element bonuses/penalties.
 */
export class PlacementRenderer {
  /**
   * Animate a card moving offscreen (used before board placement).
   *
   * @param {createjs.Container} card - The card to animate.
   * @param {number} offscreenX - Target X coordinate offscreen.
   * @param {number} offscreenY - Target Y coordinate offscreen.
   * @param {(card: createjs.Container) => void} [onComplete] - Callback when animation finishes.
   */
  moveCardOffscreen(card, offscreenX, offscreenY, onComplete) {
    createjs.Tween.get(card)
      .to({ x: offscreenX, y: offscreenY }, 500)
      .call(() => onComplete && onComplete(card));
  }

  /**
   * Animate a card moving to its final position on the board.
   *
   * @param {createjs.Container} card - The card to animate.
   * @param {number} placementX - Final X coordinate on the board.
   * @param {number} placementY - Final Y coordinate on the board.
   * @param {(card: createjs.Container) => void} [onComplete] - Callback when animation finishes.
   */
  moveCardToBoard(card, placementX, placementY, onComplete) {
    // Ensure card renders on top
    Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    createjs.Tween.get(card)
      .to({ x: placementX, y: placementY }, 500)
      .call(() => onComplete && onComplete(card));
  }

  /**
   * Display a visual indicator for element effects (bonus/penalty) on a card.
   *
   * @param {createjs.Container} card - The card to attach the effect to.
   * @param {string} effectImagePath - File path to the effect image.
   */
  showElementEffect(card, effectImagePath) {
    const effectBmp = new createjs.Bitmap(effectImagePath);

    // Position effect relative to card
    effectBmp.x = card.x + offsets.cardWidth / 4;
    effectBmp.y = card.y + offsets.cardHeight / 3;

    Game.stage.addChild(effectBmp);
    Game.stage.setChildIndex(effectBmp, Game.stage.getNumChildren() - 1);
  }
}
