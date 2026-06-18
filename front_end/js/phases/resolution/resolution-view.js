/**
 * ResolutionView handles all visual animations for card flips during the resolution phase.
 */
export class ResolutionView {
  /**
   * Constructor for ResolutionView
   * @param {createjs.Stage} stage - The main game stage
   */
  constructor(stage) {
    this.stage = stage;
  }

  /**
   * Flip a single card container using a scale tween animation.
   *
   * The axis of the flip depends on `direction`:
   * - "left" or "right" → animate **scaleX** (horizontal squash/expand)
   * - "up" or "down"   → animate **scaleY** (vertical squash/expand)
   *
   * The container is squished to zero on the relevant axis, then expanded
   * back to the original value. The card's colour/ownership bitmap is already
   * updated by ResolutionController before this call, so the "new side" is
   * visible as the card expands.
   *
   * @param {createjs.Container} container - The card container to flip
   * @param {string} direction - "left" | "right" | "up" | "down"
   */
  flipCard(container, direction) {
    if (!container) {
      return;
    }

    const isHorizontal = direction === "left" || direction === "right";
    const axis = isHorizontal ? "scaleX" : "scaleY";
    const originalValue = container[axis];

    const firstTarget = { [axis]: 0 };

    const secondTarget = { [axis]: originalValue };

    createjs.Tween.get(container, { override: true })
      .to(firstTarget, 200, createjs.Ease.quadIn)
      .to(secondTarget, 200, createjs.Ease.quadOut)
      .call(() => {
        this.stage?.update();
      });
  }

  /**
   * Ensure card visuals are correct after a flip.
   * The colour/ownership bitmap is already swapped by card.setOwner(),
   * so this method just guarantees the face art stays on top of the
   * display list.
   *
   * @param {import("../shared/card/card.js").Card} card - The Card instance
   */
  refreshCardFace(card) {
    if (!card?.visuals?.container) {
      return;
    }

    const container = card.visuals.container;
    const face = card.visuals.faceBitmap;

    if (face && container.contains(face)) {
      container.setChildIndex(face, container.getNumChildren() - 1);
    }
  }
}
