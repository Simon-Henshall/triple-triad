import { Game } from "../game/game.js";
import { SelectionBoardRenderer } from "../renderers/selection-board-renderer.js";
import { shuffle } from "../utilities/shuffle.js";

/**
 * Manages the player's logical state: deck, hand, played cards, and counts.
 */
export class PlayerManager {
  constructor() {
    /** @type {Array<Object>} All owned cards in the game */
    this.ownedCards = [];

    /** @type {Array<Object>} Player's current shuffled deck (from ownedCards) */
    this.playerCards = []; // shuffled deck + cards temporarily in hand

    /** @type {Array<Object>} Cards currently in the player's hand (max 5) */
    this.cardsInHand = [];

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

  /** Shuffle owned cards into the deck */
  initDeck() {
    this.playerCards = shuffle([...this.ownedCards]);
  }

  /**
   * Add a card to the player's hand (max 5)
   * @param {Object} card
   * @param {createjs.Container} container
   * @returns {boolean}
   */
  addCardToHand(card, container) {
    if (!card || !container || this.cardsInHand.length >= 5) {
      return false;
    }

    // Update logical board count
    if (card.id != undefined) {
      card.count = (card.count || 0) - 1;
      // Keep playerCards array for removal logic
      this.playerCards.push(card);
    }

    this.cardsInHand.push(container);

    // Always recalc selection
    this._recalculateSelection();

    // Refresh board count display
    if (card.id != undefined) {
      SelectionBoardRenderer.updateBoardCount(card.id, 0);
    }

    return true;
  }

  /**
   * Remove last card from hand
   * @returns {createjs.Container|null} removed container
   */
  removeLastCard() {
    if (this.cardsInHand.length === 0) {
      return;
    }

    const removedContainer = this.cardsInHand.pop();
    const removedCard = this.playerCards.pop();

    if (removedCard && removedCard.id != undefined) {
      removedCard.count = (removedCard.count || 0) + 1;
      SelectionBoardRenderer.updateBoardCount(removedCard.id, 0);
    }

    // Animate removal
    createjs.Tween.get(removedContainer)
      .to({ y: Game.stage.canvas.height + 200 }, 500, createjs.Ease.quadIn)
      .call(() => {
        removedContainer.remove();
        Game.stage.update();
      });

    // Recalculate selection
    this._recalculateSelection();

    return removedContainer;
  }

  /**
   * Get a hand container by index
   * @param {number} index
   * @returns {Object|null}
   */
  getHandCard(index) {
    return this.cardsInHand[index] || undefined;
  }

  /** Reset hand completely */
  resetHand() {
    this.cardsInHand = [];
    this.playerCards = [];
    this._recalculateSelection();
  }

  /**
   * Shift cards down after one is placed
   * @param {object} offsets - offsets.handCardOffset
   */
  shiftCardsDown(offsets) {
    const count = Math.min(this.cardsAboveSelection, this.cardsInHand.length);

    for (let index = 0; index < count; index++) {
      const card = this.cardsInHand[index];
      if (card) {
        createjs.Tween.get(card).to(
          { y: card.y + offsets.handCardOffset },
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
    if (this.cardsInHand.length > 0) {
      this.selectedCardIndex = this.cardsInHand.length - 1;
      this.selectedCard = this.playerCards[this.selectedCardIndex];
    } else {
      this.selectedCardIndex = 0;
      this.selectedCard = undefined;
    }
  }
}
