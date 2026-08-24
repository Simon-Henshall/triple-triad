import { Game } from "../../shared/game/game.js";
import { Card } from "../../shared/card/card.js";
import DeckSelectionModel from "./deck-selection-model.js";
import { CursorModel } from "../../shared/cursor/cursor-model.js";

/**
 * Deck Selection Controller
 * @export
 * @class DeckSelectionController
 * @typedef {DeckSelectionController}
 */
export class DeckSelectionController {
  /**
   * Constructor for the DeckSelectionController
   * @param {Array} deck - Array of Card objects with count and selected properties
   * @param {PlayerModel} playerModel - Reference to the player model
   */
  constructor({ deck = [], playerModel }) {
    this.cards = deck.map((c) => ({
      ...c,
      remaining: (c.count ?? 0) - (c.selected ?? 0),
      initiallyHidden: (c.count ?? 0) === 0,
    }));
    this.playerModel = playerModel;
    this.cardsPerPage = 11;

    this.currentPage = 1;
    this.selectedIndexOnPage = 0;
  }

  /** Cards that should actually appear in the book (for both display and selection) */
  get displayedCards() {
    // Recalculate remaining per archetype
    return this.cards
      .map((archetype) => {
        const inHandCount = this.playerModel?.hand.filter(
          (h) => h.data.id === archetype.data.id,
        ).length;
        return {
          ...archetype,
          remaining: (archetype.count ?? 0) - inHandCount,
        };
      })
      .filter((c) => {
        // Keep if:
        // 1️⃣ It was NOT initially hidden (had stock at the start), OR
        // 2️⃣ It’s dynamically dropped to 0 after being visible
        return !c.initiallyHidden;
      });
  }

  /** Page-based slicing */
  get visibleCards() {
    const CARDS_PER_PAGE = this.cardsPerPage ?? 11;
    const pageStart = (this.currentPage - 1) * CARDS_PER_PAGE;
    const pageEnd = pageStart + CARDS_PER_PAGE;
    return this.displayedCards.slice(pageStart, pageEnd);
  }

  /** Total pages */
  get totalPages() {
    return Math.max(
      1,
      Math.ceil(this.displayedCards.length / this.cardsPerPage),
    );
  }

  /** Current selection */
  get selectedCard() {
    return this.visibleCards[this.selectedIndexOnPage];
  }

  /** Cursor movement */
  moveNext() {
    const cards = this.visibleCards;
    if (cards.length === 0) {
      return;
    }
    this.selectedIndexOnPage = Math.min(
      this.selectedIndexOnPage + 1,
      cards.length - 1,
    );
  }

  /**
   * Move the selection up one
   */
  movePrevious() {
    if (this.visibleCards.length === 0) {
      return;
    }
    this.selectedIndexOnPage = Math.max(this.selectedIndexOnPage - 1, 0);
  }

  /**
   * Handles pagination of the selection board.
   * @param {"up|down|left|right"} direction
   */
  paginate(direction) {
    if (direction === "right" && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (direction === "left" && this.currentPage > 1) {
      this.currentPage--;
    }
    this.selectedIndexOnPage = 0;
  }

  /**
   * Auto-pick a random card from the player's deck, respecting ownership counts.
   * Used by the Random rule.
   * @returns {Card|undefined} A new Card instance for the hand, or undefined if deck is exhausted
   */
  _pickRandomCard() {
    // Build a pool of available card archetypes (those with remaining count > 0)
    const available = this.displayedCards.filter((c) => c.remaining > 0);
    if (available.length === 0) {
      return;
    }

    const archetype = available[Math.floor(Math.random() * available.length)];

    // Create a new Card instance for the hand (count=1 for the hand slot)
    const card = new Card(archetype.data, "player", 1);
    card.visuals = { ...archetype.visuals };
    return card;
  }

  /**
   * Auto-select 5 random cards from the deck (Random rule).
   * Respects each card's ownership count limit by tracking how many of each
   * archetype have been selected.
   * @returns {Card[]} Array of 5 Card instances for the player's hand
   */
  _autoSelectRandomHand() {
    const hand = [];

    // Track selection counts per card ID
    const selectedCounts = {};

    for (let attempt = 0; attempt < 100 && hand.length < 5; attempt++) {
      // Find deck cards that still have remaining copies
      const available = this.playerModel.deck.filter((deckCard) => {
        const id = deckCard.data.id;
        const selectedSoFar = selectedCounts[id] || 0;
        return selectedSoFar < (deckCard.count ?? 0);
      });

      if (available.length === 0) {
        break;
      }

      const pick = available[Math.floor(Math.random() * available.length)];
      const id = pick.data.id;
      selectedCounts[id] = (selectedCounts[id] || 0) + 1;

      // Clone the deck card to create a proper hand card with visuals.
      // Card.clone() already deep-clones the container and sets up scaling.
      const handCard = pick.clone({ owner: "player", count: 1 });

      // Position offscreen (renderHand will reposition if needed)
      handCard.visuals.container.x = this.playerModel.handOffsetX;
      handCard.visuals.container.y = 0;

      hand.push(handCard);
    }

    return hand;
  }

  /**
   * Selection phase setup.
   * Called when the selection phase has started.
   * If the Random rule is active, skips the selection UI and auto-picks 5 cards.
   */
  activate() {
    // Random rule: skip selection UI, auto-pick 5 random cards
    if (Game.rules.includes("random")) {
      const autoHand = this._autoSelectRandomHand();
      for (const card of autoHand) {
        this.playerModel.addCardToHand(card);
      }
      // Skip directly to game start, bypassing confirmation
      Game.stage.removeChild(DeckSelectionModel.container);
      Game.startGame();
      CursorModel.playerHand.init();
      return;
    }

    Game.setupSelectionBook(this.playerModel);

    // If the view exists later, notify it here:
    // this.view?.show();
  }

  /**
   * Selection phase cleanup.
   * Called when the selection phase has ended.
   */
  deactivate() {
    // For now this can remain empty or contain minimal cleanup.
    // Later maybe:
    // - hide/remove selection book UI
    // - detach input handlers
    // - reset cursor visuals
  }
}
