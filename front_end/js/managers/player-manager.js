import { Game } from "../game/game.js";
import { SelectionBoardRenderer } from "../renderers/selection-board-renderer.js";
import { shuffle } from "../utilities/shuffle.js";
import { debug } from "../debug.js";

/**
 * Represents a single card in the game (logic + visual)
 */
export class Card {
  constructor(data, display) {
    this.data = data; // e.g., { displayName, image, strengthUp, ... }
    this.display = display; // createjs.Container representing the card visually
  }
}

/**
 * Manages the player's logical state: deck, hand, played cards, and counts.
 */
export class PlayerManager {
  constructor() {
    /** @type {Array<Card>} All owned cards in the game */
    this.deck = [];

    /** @type {Array<Card>} Cards currently in the player's hand (max 5) */
    this.hand = [];

    /** @type {number} Number of cards played by player */
    this.playedCardsCount = 0;

    /** @type {number} Total blue cards (score) */
    this.totalBlueCards = 5;

    /** @type {number} Horizontal offset for hand rendering (can be used by renderer) */
    this.handOffsetX = 0;

    /** @type {number} Number of cards above current selection */
    this.cardsAboveSelection = 0;

    /** @type {Object|null} Currently selected card */
    this.selectedCard = undefined;

    /** index of currently selected card */
    this.selectedCardIndex = 0;

    /** createjs.DisplayObject for cursor above hand */
    this.playerHandCursor = undefined;
  }

  /**
   * Add a card to the player's hand (max 5)
   * @param {Object} cardData
   * @param {createjs.Container} cardDisplay
   * @returns {boolean}
   */
  addCardToHand(cardData, cardDisplay) {
    if (!cardData || !cardDisplay || this.hand.length >= 5) {
      return false;
    }

    // Update logical count
    if (cardData.id != undefined) {
      cardData.count = (cardData.count || 0) - 1;
    }

    this.hand.push(new Card(cardData, cardDisplay));

    console.log("Added card to hand:", cardData, cardDisplay);
    console.log("Current hand is now:", this.hand);

    // Always recalc selection
    this._recalculateSelection();

    // Refresh board count display
    if (cardData.id != undefined) {
      SelectionBoardRenderer.updateBoardCount(cardData.id, 0);
    }

    return true;
  }

  /**
   * Remove last card from hand
   * @returns {createjs.Container|null} removed container
   */
  removeLastCard() {
    if (this.hand.length === 0) {
      return;
    }

    const removedCard = this.hand.pop();

    console.log("Removed card from hand:", removedCard);
    console.log("Current hand is now:", this.hand);

    if (removedCard.data && removedCard.data.id != undefined) {
      removedCard.data.count = (removedCard.data.count || 0) + 1;
      SelectionBoardRenderer.updateBoardCount(removedCard.data.id, 0);
    }

    // Animate removal
    createjs.Tween.get(removedCard.display)
      .to({ y: Game.stage.canvas.height + 200 }, 500, createjs.Ease.quadIn)
      .call(() => {
        removedCard.display.remove();
        Game.stage.update();
      });

    // Recalculate selection
    this._recalculateSelection();

    return removedCard.display;
  }

  /**
   * Get a hand container by index
   * @param {number} index
   * @returns {Object|null}
   */
  getHandCard(index) {
    return this.hand[index] || undefined;
  }

  /** Reset hand completely */
  resetHand() {
    this.hand = [];
    if (debug.active) {
      console.log("Resetting player hand from:", this.hand);
    }
    this._recalculateSelection();
  }

  /**
   * Shift cards down after one is placed
   * @param {object} offsets - offsets.handCardOffset
   */
  shiftCardsDown(offsets) {
    const count = Math.min(this.cardsAboveSelection, this.hand.length);

    for (let index = 0; index < count; index++) {
      const card = this.hand[index];
      if (card) {
        createjs.Tween.get(card.display).to(
          { y: card.display.y + offsets.handCardOffset },
          200,
        );
      }
    }

    this.cardsAboveSelection = 0;
    this._recalculateSelection();
  }

  /**
   * Private helper: recalculate selectedCard and selectedCardIndex
   */
  _recalculateSelection() {
    if (this.hand.length > 0) {
      this.selectedCardIndex = this.hand.length - 1;
      this.selectedCard = this.hand[this.selectedCardIndex];
    } else {
      this.selectedCardIndex = 0;
      this.selectedCard = undefined;
    }
  }
}
