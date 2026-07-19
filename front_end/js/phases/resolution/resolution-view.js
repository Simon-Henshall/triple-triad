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

  /**
   * Display a flashy animated text popup for a triggered rule (Same, Plus, Combo, etc.).
   * The text scales up from small with a bounce, glows, then fades out.
   * @param {string} text - The rule name to display (e.g. "Same!", "Plus!", "Combo!")
   * @param {string} [color="#FFD700"] - The text colour (default gold)
   */
  showRulePopup(text, color = "#FFD700") {
    if (!this.stage) {
      return;
    }

    const cw = this.stage.canvas.width;
    const ch = this.stage.canvas.height;

    // Create a container for the popup so we can remove it easily
    const popupContainer = new createjs.Container();
    popupContainer.alpha = 0;
    this.stage.addChild(popupContainer);

    // Main popup text
    const popupText = new createjs.Text(
      text,
      "bold 56px Impact, Arial Black, sans-serif",
      color,
    );
    popupText.textAlign = "center";
    popupText.textBaseline = "middle";
    popupText.x = cw / 2;
    popupText.y = ch / 2 - 60;
    popupText.alpha = 0;
    popupText.scaleX = 0.3;
    popupText.scaleY = 0.3;
    popupContainer.addChild(popupText);

    // Glow text behind the main text (larger, semi-transparent, trailing effect)
    const glowText = new createjs.Text(
      text,
      "bold 56px Impact, Arial Black, sans-serif",
      color,
    );
    glowText.textAlign = "center";
    glowText.textBaseline = "middle";
    glowText.x = cw / 2;
    glowText.y = ch / 2 - 60;
    glowText.alpha = 0;
    glowText.scaleX = 0.3;
    glowText.scaleY = 0.3;
    popupContainer.addChildAt(glowText, 0);

    // Animate the container fade in
    createjs.Tween.get(popupContainer).to(
      { alpha: 1 },
      100,
      createjs.Ease.quartOut,
    );

    // Animate main text: scale up with bounce
    createjs.Tween.get(popupText)
      .wait(50)
      .to({ scaleX: 1.2, scaleY: 1.2, alpha: 1 }, 400, createjs.Ease.backOut)
      .to({ scaleX: 1, scaleY: 1 }, 200, createjs.Ease.sineOut)
      .wait(600)
      .to({ alpha: 0, scaleX: 0.5, scaleY: 0.5 }, 300, createjs.Ease.quartIn)
      .call(() => {
        // Remove popup from stage after animation completes
        if (popupContainer.parent) {
          this.stage.removeChild(popupContainer);
        }
      });

    // Animate glow text: slightly slower scale for trailing effect
    createjs.Tween.get(glowText)
      .wait(50)
      .to({ scaleX: 1.2, scaleY: 1.2, alpha: 0.4 }, 400, createjs.Ease.backOut)
      .to({ scaleX: 1, scaleY: 1 }, 200, createjs.Ease.sineOut)
      .to({ alpha: 0 }, 600);

    // Update the stage
    this.stage.update();
  }
}
