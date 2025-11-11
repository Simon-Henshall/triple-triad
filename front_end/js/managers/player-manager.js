import { SelectionBookRenderer } from "../selection-book/selection-book-renderer.js";
import { debug } from "../debug.js";
import { SelectionBookUI } from "../selection-book/selection-book-ui.js";

/**
 * Represents a single card in the game (logic + visual)
 */
export class Card {
  /**
   * Creates an instance of Card.
   *
   * @constructor
   * @param {*} data
   * @param {*} display
   */
  constructor(data, display) {
    this.data = data; // e.g., { displayName, image, strengthUp, ... }
    this.display = display; // createjs.Container representing the card visually
  }
}

/**
 * Manages the player's logical state: deck, hand, played cards, and counts.
 */
export class PlayerManager {
  /**
   * Creates an instance of PlayerManager.
   *
   * @constructor
   */
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
   * Handles the selection of a card from the selection book
   *
   * @param {*} controller
   */
  _handleSelectionConfirm(controller) {
    const selectedIndex = controller.selectedIndexOnPage ?? 0;
    const currentPage = controller.currentPage ?? 1;
    const CARDS_PER_PAGE = controller.cardsPerPage ?? 11;
    const absoluteIndex = (currentPage - 1) * CARDS_PER_PAGE + selectedIndex;

    const card = controller.cards[absoluteIndex];

    if (!card) {
      console.warn("No card selected at index:", absoluteIndex);
      return;
    }

    const added = this.addCardToHand(card);

    if (added) {
      // Optionally give feedback or refresh UI
      SelectionBookRenderer.populate(controller);
      console.log(`✅ Added ${card.data?.name ?? card.name} to hand.`);
    } else {
      console.log(`⚠️ Could not add card: ${card.data?.name ?? card.name}`);
    }
  }

  /**
   * Adds a card from deck to hand.
   * Moves the actual Card instance, respects max hand size.
   *
   * @param {Card} card
   * @returns {boolean} true if added, false otherwise
   */
  addCardToHand(cardData) {
    if (!cardData) {
      return false;
    }

    // Find the archetype in the deck
    const deckEntry = this.deck.find((c) => c.data.id === cardData.data.id);
    if (!deckEntry || deckEntry.count <= 0) {
      console.warn("No more copies available in deck for", cardData.data.name);
      return false;
    }

    // Create a real Card instance
    const card = new Card(deckEntry, deckEntry.visuals);

    // Add to hand
    this.hand.push(card);

    // Decrement count
    deckEntry.count--;

    console.log(
      `[Player Manager] Added card: ${deckEntry.data.name} — remaining copies: ${deckEntry.count}`,
    );

    console.log(
      "[Player Manager] Player hand is now:",
      this.hand.map((card) => card.data.data.name),
    );

    this._recalculateSelection();

    // Update the UI immediately
    SelectionBookRenderer.populate(SelectionBookUI.controller);

    return true;
  }

  /**
   * Removes the most recently added card from hand and returns it to the deck.
   * Accepts a specific card instance to remove (default: top of stack).
   *
   * @param {Card} [card] - Optional specific card instance to remove
   * @returns {boolean} true if removed, false otherwise
   */
  /**
   * Removes the most recently added card from the player's hand
   * and returns it to the deck.
   */
  removeLastCardFromHand() {
    if (this.hand.length === 0) {
      return false;
    }

    // Pop the last card (most recently added)
    const card = this.hand.pop();

    // Return it to the deck
    const archetype = this.deck.find((c) => c.data.id === card.data.data.id);
    if (archetype) {
      archetype.count = (archetype.count || 0) + 1;
    } else {
      // Safety fallback: add the full card back into the deck
      this.deck.push(card);
    }

    console.log(
      "[Player Manager] Removed card from hand:",
      card.data.data.name,
    );
    console.log(
      "[Player Manager] Player hand is now:",
      this.hand.map((card) => card.data.data.name),
    );

    // Recalculate hand selection
    this._recalculateSelection();

    // Update the UI immediately
    SelectionBookRenderer.populate(SelectionBookUI.controller);

    return card;
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
