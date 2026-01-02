/**
 * Manages the player's logical state: deck, hand, played cards, and counts.
 */
export class PlayerModel {
  /**
   * Creates an instance of PlayerModel.
   *
   * @constructor
   */
  constructor({ view } = {}) {
    /** @type {Array<Card>} All owned cards in the game */
    this.deck = [];

    /** @type {Array<Card>} Cards currently in the player's hand (max 5) */
    this.hand = [];

    /** @type {number} Number of cards played by player */
    this.playedCardsCount = 0;

    /** @type {number} Total blue cards (score) */
    this.totalBlueCards = 5;

    /** @type {number} Horizontal offset for hand rendering (can be used by view) */
    this.handOffsetX = 0;

    /** @type {number} Number of cards above current selection */
    this.cardsAboveSelection = 0;

    /** @type {Object|null} Currently selected card */
    this.selectedCard = undefined;

    /** index of currently selected card */
    this.selectedCardIndex = 0;

    this.view = view;

    this.selectedCardNumber = 0;
    this.selectedCard = undefined;
    this.previouslySelectedCard = [];
  }

  /**
   * Adds a card from deck to hand.
   * Moves the actual Card instance, respects max hand size.
   *
   * @param {Card} card
   * @returns {boolean} true if added, false otherwise
   */
  addCardToHand(card) {
    const deckCard = this.deck.find((d) => d.data.id === card.data.id);
    if (!deckCard || deckCard.remaining <= 0) {
      console.warn(
        `[Player Model] No more copies available in deck for ${card.data?.name}`,
      );
      return false;
    }

    deckCard.remaining--;
    deckCard.selectedCount = (deckCard.selectedCount || 0) + 1;

    this.hand.push(card);
    console.log("[Player Model] Added card:", card.data.name);
    console.log(
      "[Player Model] Player hand is now:",
      this.hand.map((c) => c.data.name),
    );
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

    // Index before popping
    const index = this.hand.length - 1;

    // Pop the last logical card
    const card = this.hand.pop();

    // Find the on-stage container for that index
    const containerOnStage = this.view?.cardsInPlayerHand?.[index];
    if (containerOnStage) {
      this.view.animateCardToHand(containerOnStage, index, true);
    }

    // Return to deck
    const deckCard = this.deck.find((c) => c.data.id === card.data.id);
    if (deckCard) {
      deckCard.remaining = (deckCard.remaining || 0) + 1;
    }

    console.log("[Player Model] Removed card:", card.data.name);
    console.log(
      "[Player Model] Player hand is now:",
      this.hand.map((c) => c.data.name),
    );

    this._recalculateSelection();

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
    console.log(
      "[Player Model] Resetting player hand from:",
      this.hand,
      "to []",
    );

    // Restore every deck card’s remaining count to its full stock
    for (const deckCard of this.deck) {
      deckCard.remaining = deckCard.count; // full reset
      deckCard.selectedCount = 0;
    }

    // Clear player hand
    this.hand = [];

    // Notify UI / SelectionBook to visually reset
    this.selectionBook?.resetCounts?.();

    // Reset animation indices / visual state
    this.view?.resetHandSlots?.();

    console.log(
      "[Player Model] Player hand reset complete. Deck state restored.",
    );
  }

  /**
   * Shift cards down after one is placed
   * @param {object} offset - offsets.handCardOffset
   */
  shiftCardsDown(offset) {
    const count = Math.min(this.cardsAboveSelection, this.hand.length);

    for (let index = 0; index < count; index++) {
      const card = this.hand[index];
      console.log(card);
      console.log("Offset:", offset);
      if (card) {
        createjs.Tween.get(card.visuals.container).to(
          { y: card.visuals.container.y + offset },
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
