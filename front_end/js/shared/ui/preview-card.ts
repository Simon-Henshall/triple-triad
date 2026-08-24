import { offsets } from "../../constants/offsets.js";
import { Game } from "../game/game.js";

/**
 * PreviewCard
 * Displays a large, scaled preview of a card on screen.
 * On show, the card animates in from below the stage.
 */
export const PreviewCard = {
  shown: false,

  /**
   * Show a preview of the given card, animating it in from the bottom.
   * @param {Object} card - Card object with a `visuals.container` property
   */
  showPreviewCard(card) {
    if (!card || !card.visuals || !card.visuals.container) {
      return;
    }

    this.hidePreviewCard();

    const original = card.visuals.container;
    const previewContainer = original.clone(true);

    const origBounds = original.getBounds();
    if (origBounds) {
      previewContainer.scaleX = offsets.scaledPreviewWidth / origBounds.width;
      previewContainer.scaleY = offsets.scaledPreviewHeight / origBounds.height;
    } else {
      previewContainer.scaleX = previewContainer.scaleY = 1;
    }

    // Start from below the visible stage
    const previewBounds = previewContainer.getBounds();
    const startY =
      Game.stage.canvas.height +
      (previewBounds ? previewBounds.height * previewContainer.scaleY : 200);

    previewContainer.x = offsets.previewX;
    previewContainer.y = startY;

    this.shown = previewContainer;

    Game.stage.addChild(previewContainer);

    // Animate card sliding up to its target position
    createjs.Tween.get(previewContainer, { override: true }).to(
      { y: offsets.previewY },
      400,
      createjs.Ease.quadOut,
    );

    Game.stage.update();
  },

  /**
   * Hide the preview card immediately (no animation).
   */
  hidePreviewCard() {
    const preview = this.shown;
    if (preview && Game.stage.contains(preview)) {
      Game.stage.removeChild(preview);
    }
    this.shown = undefined;
    Game.stage.update();
  },
};
