import { Game } from "../game/game.js";
import { offsets } from "../constants/offsets.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { UIManager } from "../managers/ui-manager.js";

/**
 * Handles all visual animations and effects for card placement,
 * including transitions offscreen, board entry, and element bonuses/penalties.
 */
export class PlacementRenderer {
  /**
   * Shift cards in the current player's hand downward after a placement,
   * or adjust AI cards accordingly.
   */
  shiftHandCardsDown() {
    console.log("shiftHandCardsDown");
    if (getPlayerTurn() === "blue") {
      const playerManager = Game.managers.playerManager;
      playerManager.shiftCardsDown(offsets.handCardOffset);
    } else {
      // AI hand movement
      const aiManager = Game.managers.aiManager;
      this.animateDown(aiManager.hand, aiManager.cardsAboveSelection);
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
      createjs.Tween.get(hand[index].visuals.container).to(
        { y: hand[index].visuals.container.y + offsets.handCardOffset },
        200,
      );
    }
  }

  /**
   * Animate a card moving offscreen (before being placed on the board).
   *
   * @param {createjs.Container} card - The card to animate.
   * @param {number} offscreenX - Target X coordinate offscreen.
   * @param {number} offscreenY - Target Y coordinate offscreen.
   * @param {(card: createjs.Container) => void} [onComplete] - Callback when animation finishes.
   */
  moveCardOffscreen(card, onComplete) {
    console.log("moveCardOffscreen:", card);
    createjs.Tween.get(card.visuals.container)
      .to({ x: offsets.offscreenX, y: offsets.offscreenY }, 500)
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
    console.log(card);
    // Ensure card renders above all others
    //Game.stage.setChildIndex(card, Game.stage.getNumChildren() - 1);

    createjs.Tween.get(card.visuals.container)
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

    // Scale correctly
    effectBmp.scaleX = 0.5;
    effectBmp.scaleY = 0.5;

    // Position relative to the card container
    effectBmp.x = card.visuals.container.getBounds()?.width / 4;
    effectBmp.y = card.visuals.container.getBounds()?.height / 3;

    // Add to the card container
    card.visuals.container.addChild(effectBmp);

    // Optional: animate it popping up/fading out
    // createjs.Tween.get(effectBmp)
    //   .to({ y: effectBmp.y - 20, alpha: 0 }, 500)
    //   .call(() => card.visuals.container.removeChild(effectBmp));
  }

  /**
   * Indent the newly selected default card after placement (visual feedback).
   */
  indentAfterPlacement() {
    if (UIManager.selectedCard) {
      console.log(
        "Indenting selected card after placement",
        UIManager.selectedCard,
      );
      UIManager.selectedCard.visuals.container.x -= 30;
    }
  }
}
