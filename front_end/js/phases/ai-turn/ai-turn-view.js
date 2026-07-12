import { Game } from "../../shared/game/game.js";
import { offsets } from "../../constants/offsets.js";
import { config } from "../../constants/config.js";

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
    this.handOffsetX = 0;

    // Create the AI hand cursor bitmap
    this.aiCursor = new createjs.Bitmap(config.imagePath + "cursor.png");
    this.aiCursor.visible = false;
    this._selectedCardIndex = -1;
  }

  /**
   * Place the AI hand on stage visually, animating cards in
   * from below the stage one at a time.
   * When "open" rule is active, cards are shown face-up.
   * When "open" rule is inactive, cards are shown face-down (back visible).
   */
  displayHand(hand, handOffsetX) {
    this.handOffsetX = handOffsetX || offsets.gameOffsetX / 2;
    const isOpen = Game.rules.includes("open");

    for (const [index, card] of hand.entries()) {
      const container = card.visuals.container;
      const targetY = offsets.handOffsetY + index * offsets.handCardOffset;

      container.x = this.handOffsetX;
      container.y = this.stage.canvas.height + 200;
      container.alpha = 0;

      if (isOpen) {
        // Show card face (open rule)
        if (card.visuals.faceBitmap) {
          card.visuals.faceBitmap.visible = true;
        }
        if (card.visuals.colourBitmap) {
          card.visuals.colourBitmap.visible = true;
        }
        if (card.visuals.backBitmap) {
          card.visuals.backBitmap.visible = false;
        }
      } else {
        // Hide face, show back (closed rule)
        if (card.visuals.faceBitmap) {
          card.visuals.faceBitmap.visible = false;
        }
        if (card.visuals.colourBitmap) {
          card.visuals.colourBitmap.visible = false;
        }
        if (card.visuals.backBitmap) {
          card.visuals.backBitmap.visible = true;
        }
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
   * Show the AI selection cursor and indent the card at the given hand index.
   * Positions the cursor relative to the card container's current Y position
   * (which accounts for any previous shiftCardsDown adjustments).
   * @param {Array} hand - The AI's hand array
   * @param {number} cardIndex - Index of the selected card
   */
  showSelection(hand, cardIndex) {
    const card = hand[cardIndex];
    if (!card?.visuals?.container) {
      return;
    }

    // Store the selected index for later cleanup
    this._selectedCardIndex = cardIndex;

    // Position the cursor to the left of the selected card.
    // Use the card container's current y (after any shiftCardsDown adjustments)
    // with an offset to align the cursor arrow tip with the card centre.
    const cursorX = this.handOffsetX - 50;
    const cardContainerY = card.visuals.container.y;
    const cursorY = cardContainerY + 80; // vertical centre of a 120px-high card

    this.aiCursor.x = cursorX;
    this.aiCursor.y = cursorY;
    this.aiCursor.visible = true;
    this.stage.addChild(this.aiCursor);

    // Indent the selected card (shift right, away from the AI hand stack)
    card.visuals.container.x = this.handOffsetX + 30;

    this.stage.update();
  }

  /**
   * Hide the AI selection cursor and unindent the previously selected card.
   * @param {Array} [hand] - The AI's hand array (optional, will use stored index)
   */
  hideSelection(hand) {
    // Unindent the previously selected card
    if (
      this._selectedCardIndex >= 0 &&
      hand &&
      hand[this._selectedCardIndex]?.visuals?.container
    ) {
      hand[this._selectedCardIndex].visuals.container.x = this.handOffsetX;
    }

    // Remove the cursor from the stage
    if (
      typeof this.stage?.contains === "function" &&
      this.stage.contains(this.aiCursor)
    ) {
      this.stage.removeChild(this.aiCursor);
    }
    this.aiCursor.visible = false;
    this._selectedCardIndex = -1;

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
    // Clean up cursor if still on stage
    if (
      typeof this.stage?.contains === "function" &&
      this.stage.contains(this.aiCursor)
    ) {
      this.stage.removeChild(this.aiCursor);
    }
    this.aiCursor.visible = false;
    this._selectedCardIndex = -1;

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
