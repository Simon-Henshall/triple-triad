import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

/**
 * CardClaimView
 * Renders the card-claim UI: dark background with the AI's 5 initial
 * cards displayed face-up in a horizontal row the player can select from.
 */
export default class CardClaimView {
  /**
   * Creates a CardClaimView instance.
   * @param {createjs.Stage} stage - the CreateJS stage
   */
  constructor(stage) {
    this.stage = stage;
    this.container = undefined;
    this.cardContainers = [];
  }

  /**
   * Build the card-claim UI on the stage.
   * Preloads card images if needed, then renders the display.
   * @param {import("../../shared/card/card.js").Card[]} cards - the AI's 5 initial cards
   * @param {number} selectedIndex - index of the currently selected card
   */
  async build(cards, selectedIndex = 0) {
    this.cleanup();

    // Preload all card images so they render immediately
    await this._preloadImages(cards);

    this.container = new createjs.Container();
    this.stage.addChild(this.container);

    const cw = this.stage.canvas.width;
    const ch = this.stage.canvas.height;

    // ----- Solid dark background -----
    const bg = new createjs.Shape();
    bg.graphics.beginFill("#0a0a1a").drawRect(0, 0, cw, ch);
    this.container.addChild(bg);

    // ----- Title -----
    const titleLabel = new createjs.Text(
      "CLAIM A CARD",
      "bold 42px Impact, Arial Black, sans-serif",
      "#FFD700",
    );
    titleLabel.textAlign = "center";
    titleLabel.textBaseline = "middle";
    titleLabel.x = cw / 2;
    titleLabel.y = 100;
    titleLabel.outline = 2;
    this.container.addChild(titleLabel);

    // ----- Sub-instruction -----
    const subLabel = new createjs.Text(
      "Select one of the AI's cards to claim as your own",
      "18px Arial, sans-serif",
      "#e0e0e0",
    );
    subLabel.textAlign = "center";
    subLabel.textBaseline = "middle";
    subLabel.x = cw / 2;
    subLabel.y = 150;
    this.container.addChild(subLabel);

    // ----- Card showcase (horizontal row) -----
    this._renderCardRow(cards, selectedIndex, cw, ch);

    // ----- Footer controls hint -----
    const hintText = new createjs.Text(
      "\u2190 \u2192 Navigate   |   ENTER Claim   |   ESC Skip",
      "16px Arial, sans-serif",
      "#aaaaaa",
    );
    hintText.textAlign = "center";
    hintText.textBaseline = "middle";
    hintText.x = cw / 2;
    hintText.y = ch - 50;
    this.container.addChild(hintText);

    // Fade in
    this.container.alpha = 0;
    createjs.Tween.get(this.container).to(
      { alpha: 1 },
      400,
      createjs.Ease.quartOut,
    );

    this.stage.update();
  }

  /**
   * Preload all card images to ensure they display immediately.
   * @param {import("../../shared/card/card.js").Card[]} cards
   * @returns {Promise<void>}
   */
  _preloadImages(cards) {
    const promises = [];
    for (const card of cards) {
      if (!card?.data?.imagePath) {
        continue;
      }
      const promise = new Promise((resolve) => {
        const img = new Image();
        img.addEventListener("load", () => resolve());
        img.addEventListener("error", () => resolve()); // resolve anyway
        img.src = card.data.imagePath;
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  }

  /**
   * Render a horizontal row of AI cards.
   * Each card display is built from data to avoid relying on potentially
   * stale or incorrectly cloned CreateJS containers.
   * @param {import("../../shared/card/card.js").Card[]} cards
   * @param {number} selectedIndex
   * @param {number} cw - canvas width
   * @param {number} ch - canvas height
   */
  _renderCardRow(cards, selectedIndex, cw, ch) {
    this.cardContainers = [];

    if (!cards || cards.length === 0) {
      return;
    }

    const gap = 15;
    const totalWidth =
      cards.length * offsets.scaledCardWidth + (cards.length - 1) * gap;
    const startX = (cw - totalWidth) / 2;
    const cardY = ch / 2 - offsets.scaledCardHeight / 2;

    for (const [index, card] of cards.entries()) {
      // Build a fresh card display container from the card's data
      const display = this._buildCardDisplay(card);

      // Wrap in a positioned container
      const wrapper = new createjs.Container();
      wrapper.addChild(display.container);

      display.container.x = 0;
      display.container.y = 0;
      wrapper.x = startX + index * (offsets.scaledCardWidth + gap);
      wrapper.y = cardY;

      // Selection highlight ring
      const highlight = new createjs.Shape();
      highlight.graphics
        .setStrokeStyle(3)
        .beginStroke("#FFD700")
        .drawRect(
          -6,
          -6,
          offsets.scaledCardWidth + 12,
          offsets.scaledCardHeight + 12,
        );
      highlight.visible = index === selectedIndex;
      wrapper.addChild(highlight);

      this.container.addChild(wrapper);

      this.cardContainers.push({
        wrapper,
        highlight,
        cardContainer: display.container,
      });
    }
  }

  /**
   * Build a fresh card display from the card's data.
   * We create new bitmaps using the card's stored imagePath
   * and colour. If the image has already been loaded by the
   * browser (e.g. from the original card display), it will
   * be served from cache and display immediately.
   * @param {import("../../shared/card/card.js").Card} card
   * @returns {{ container: createjs.Container }}
   */
  _buildCardDisplay(card) {
    const container = new createjs.Container();
    container.name = "cardClaimDisplay";

    // Colour overlay (red for AI cards) - added FIRST so face goes on top
    const colourBitmap = new createjs.Bitmap("assets/custom/red.png");
    colourBitmap.name = "claimColourBitmap";
    container.addChild(colourBitmap);

    // Face image - added SECOND so it renders on TOP of the colour
    const faceBitmap = new createjs.Bitmap(card.data.imagePath);
    faceBitmap.name = "claimFaceBitmap";
    container.addChild(faceBitmap);

    // Scale to fit target card dimensions
    /**
     * Check the scale of the face bitmap and update the container accordingly.
     */
    const checkScale = () => {
      const img = faceBitmap.image;
      if (img && img.width > 0 && img.height > 0) {
        const sx = offsets.scaledCardWidth / img.width;
        const sy = offsets.scaledCardHeight / img.height;
        container.scaleX = sx;
        container.scaleY = sy;
        this.stage.update();
      } else {
        // Use a default scale - images should load from cache quickly
        container.scaleX = offsets.scaledCardWidth / offsets.cardWidth;
        container.scaleY = offsets.scaledCardHeight / offsets.cardHeight;
      }
    };

    // Check immediately
    checkScale();

    // Also listen for load event in case images load asynchronously
    /**
     * Handle the image load event to ensure the card is scaled correctly once the image is available.
     * This is important for cases where the image is not immediately available (e.g. not cached).
     * Once the image loads, we check the scale and update the container.
     */
    const onImgLoad = () => {
      checkScale();
      faceBitmap.image?.removeEventListener?.("load", onImgLoad);
    };
    if (faceBitmap.image?.addEventListener) {
      faceBitmap.image.addEventListener("load", onImgLoad);
    }

    return { container };
  }

  /**
   * Update which card is visually highlighted.
   * @param {number} selectedIndex
   */
  updateSelection(selectedIndex) {
    for (let index = 0; index < this.cardContainers.length; index++) {
      const entry = this.cardContainers[index];
      if (entry) {
        entry.highlight.visible = index === selectedIndex;
      }
    }
    this.stage.update();
  }

  /**
   * Run a brief "card claimed" animation on the selected card.
   * @param {number} index - index of the claimed card
   * @param {Function} onComplete - called when animation finishes
   */
  animateClaim(index, onComplete) {
    const entry = this.cardContainers[index];
    if (!entry) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    createjs.Tween.get(entry.wrapper)
      .to({ scaleX: 1.3, scaleY: 1.3, alpha: 0 }, 600, createjs.Ease.quartIn)
      .call(() => {
        if (onComplete) {
          onComplete();
        }
      });

    this.stage.update();
  }

  /**
   * Remove the card-claim UI from the stage.
   */
  cleanup() {
    if (this.container && this.stage) {
      try {
        this.stage.removeChild(this.container);
      } catch (error) {
        console.error("[Card Claim View] Failed to remove container", error);
      }
    }
    this.container = undefined;
    this.cardContainers = [];
  }
}
