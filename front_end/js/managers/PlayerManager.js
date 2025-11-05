import { Game } from "../game/game.js";
import { SelectionBoardRenderer } from "../ui/SelectionBoardRenderer.js";

/**
 * Manages all logical state of the player: deck, hand, played cards, and counts.
 */
export class PlayerManager {
  constructor() {
    /** @type {Array<Object>} All owned cards in the game */
    this.ownedCards = [];

    /** @type {Array<Object>} Player's current shuffled deck (from ownedCards) */
    this.playerCards = [];

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

    /** @type {number} Total cards held by player */
    this.playerCardCount = 0;

    /** @type {Object|null} Currently selected card */
    this.selectedCard = null;

    /** index of currently selected card */
    this.selectedCardIndex = 0;

    /** createjs.DisplayObject for cursor above hand */
    this.playerHandCursor = null;
  }

  /** Shuffle an array (Fisher-Yates) */
  shuffleDeck(array = this.playerCards) {
    let m = array.length,
      t,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  }

  /**
   * Initialize the player's deck from owned cards
   */
  initDeck() {
    this.playerCards = this.shuffleDeck([...this.ownedCards]);
    this.playerCardCount = this.playerCards.length;
  }

  /**
   * Add a card to the hand (max 5 cards)
   * @param {Object} card
   * @returns {boolean} success
   */
  addCardToHand(card, container) {
    if (!card || !container) return false;

    // Update board count
    if (card.id != null) {
      card.count = (card.count || 0) - 1;
    }

    this.playerCards.push(card);
    this.cardsInHand.push(container);
    this.selectedCard = card;

    SelectionBoardRenderer.updateBoardCount(card.id, 0);

    return true;
  }

  /**
   * Remove last card from hand (used for cancel)
   * @returns {Object|null} removed card
   */
  removeLastCard() {
    if (this.playerCards.length === 0) return null;

    const removedCard = this.playerCards.pop();
    const removedContainer = this.cardsInHand.pop();
    if (!removedCard || !removedContainer) return null;

    // Step 1: Update board count
    if (removedCard.id != null) {
      removedCard.count = (removedCard.count || 0) + 1;
      SelectionBoardRenderer.updateBoardCount(removedCard.id, 0);
    }

    // Step 2: Animate removal
    createjs.Tween.get(removedContainer)
      .to({ y: Game.stage.canvas.height + 200 }, 500, createjs.Ease.quadIn)
      .call(() => {
        Game.stage.removeChild(removedContainer);
        Game.stage.update();
      });

    // Step 3: Update selected card (logical)
    this.selectedCard = this.playerCards[this.playerCards.length - 1] || null;

    return removedContainer; // return container for visual updates in controller
  }

  /**
   * Increment the number of cards played by the player
   */
  incrementPlayedCardCount() {
    this.playedCardsCount++;
  }

  /**
   * Get a card from hand by index
   * @param {number} index
   * @returns {Object|null}
   */
  getHandCard(index) {
    return this.cardsInHand[index] || null;
  }

  /**
   * Reset the hand completely (used between rounds or replays)
   */
  resetHand() {
    this.cardsInHand = [];
    this.selectedCard = null;
  }

  /**
   * Shift cards down after one is placed and update selection index.
   */
  shiftCardsDown(offsets) {
    const count = Math.min(this.cardsAboveSelection, this.cardsInHand.length);

    for (let i = 0; i < count; i++) {
      const card = this.cardsInHand[i];
      if (card) {
        createjs.Tween.get(card).to(
          { y: card.y + offsets.handCardOffset },
          200
        );
      }
    }

    // recalc cardsAboveSelection for next move
    this.cardsAboveSelection = 0;

    // reset selection safely
    this.selectedCardIndex = 0;
    this.selectedCard = this.cardsInHand[0] || null;
  }

  /**
   * Increment played card count
   */
  incrementPlayedCards() {
    this.playedCardsCount++;
  }
}
