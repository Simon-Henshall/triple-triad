import { Game } from "../../shared/game/game.js";
import { offsets } from "../../constants/offsets.js";

/**
 * AI Turn View
 * Handles visual rendering of the AI's hand and turn actions.
 */
export class AITurnView {
  /**
   * Constructor for AI Turn View.
   * @param {createjs.Stage} stage - The CreateJS stage to render on.
   */
  constructor(stage) {
    this.stage = stage;
  }

  /**
   * Place the AI hand on stage visually, animating cards in
   * from below the stage one at a time.
   */
  displayHand(hand, handOffsetX) {
    for (const [index, card] of hand.entries()) {
      const container = card.visuals.container;
      const targetY = offsets.handOffsetY + index * offsets.handCardOffset;

      container.x = handOffsetX || offsets.gameOffsetX / 2;
      container.y = this.stage.canvas.height + 200;
      container.alpha = 0;

      // Hide face, show back
      if (card.visuals.faceBitmap) {
        card.visuals.faceBitmap.visible = false;
      }
      if (card.visuals.colourBitmap) {
        card.visuals.colourBitmap.visible = false;
      }
      if (card.visuals.backBitmap) {
        card.visuals.backBitmap.visible = true;
      }

      this.stage.addChild(container);

      // Animate card sliding up and fading in with staggered delay
      createjs.Tween.get(container, { delay: index * 200 }).to(
        { y: targetY, alpha: 1 },
        400,
        createjs.Ease.quadOut,
      );
    }
    this.stage.update();
  }

  /**
   * Animate cards shifting down after a card is played
   */
  shiftCardsDown(hand, offsetY, playedIndex) {
    for (let index = 0; index < playedIndex; index++) {
      const card = hand[index];
      if (card?.visuals.container) {
        createjs.Tween.get(card.visuals.container).to(
          { y: card.visuals.container.y + offsetY },
          200,
        );
      }
    }
  }

  /**
   * Remove all AI hand cards from stage
   */
  clearHand(hand) {
    for (const card of hand) {
      if (card?.visuals.container) {
        Game.stage.removeChild(card.visuals.container);
      }
    }
    this.stage.update();
  }

  /**
   * Activate the AI turn view.
   */
  activate() {
    // No-op for now
  }

  /**
   * Deactivate the AI turn view.
   */
  deactivate() {
    // No-op for now
  }
}
