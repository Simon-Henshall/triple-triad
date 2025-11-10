import { offsets } from "../constants/offsets.js";
import { BoardManager } from "../managers/board-manager.js";
import { UIManager } from "../managers/ui-manager.js";
import { Game } from "../game/game.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { config } from "../config.js";
import { createCardContainer } from "../utilities/cards.js";
import { debug } from "../debug.js";
import { shuffle } from "../utilities/shuffle.js";

/**
 * Represents a single AI card (logic + visual)
 */
export class AICard {
  constructor(data, display) {
    this.data = data;
    this.display = display;
  }
}

/**
 * Manages the AI's logical and visual state: deck, hand, and turn actions.
 */
export class AIManager {
  constructor() {
    /** @type {Array<AICard>} Cards in the AI's deck */
    this.deck = [];

    /** @type {Array<AICard>} Cards currently in the AI's hand (max 5) */
    this.hand = [];

    /** @type {number} Number of cards currently owned by the AI (score) */
    this.totalRedCards = 5;

    /** @type {number} Horizontal offset for AI hand rendering */
    this.handOffsetX = 0;

    /** @type {number} Index offset for the next card to be played */
    this.cardsAboveSelection = 0;

    /** @type {Array<AICard>} Essentially just totalRedCards - TODO: Improve this linkage */
    this.aiCardCount = [];

    /** @type {number} Delay between AI decision and placement (ms) */
    this.aiDelay = 1000;
  }

  /**
   * Populates the AI's hand visually from the current GameState.
   * If no logical hand exists yet, it generates a new one from the player's deck.
   */
  populateHand() {
    // If deck not yet created, clone from player deck
    if (!this.deck || this.deck.length === 0) {
      const playerDeck = Game.managers.playerManager.deck;
      this.deck = structuredClone(playerDeck); // or $.extend(true, [], playerDeck)
    }

    // Randomly pick 5 cards from AI deck
    this.hand = [];
    for (let index = 0; index < 5 && this.deck.length > 0; index++) {
      const index = Math.floor(Math.random() * this.deck.length);
      const [card] = this.deck.splice(index, 1);
      this.hand.push(card);
    }

    console.log("[AIManager] Hand populated:", this.hand);
  }

  /**
   * Executes an AI turn: selects a random card and plays it on a random free cell.
   * Visual placement and flip logic are handled by PlacementController.
   */
  takeTurn() {
    // Pick a random card from AI hand
    const cardIndex = Math.floor(Math.random() * this.hand.length);

    // Pick a random free cell for placement
    UIManager.selectedAISquare =
      BoardManager.freeCells[
        Math.floor(Math.random() * BoardManager.freeCells.length)
      ];

    BoardManager.checkSelectedRowColumn();
    this.cardsAboveSelection = cardIndex;

    setTimeout(() => {
      // Remove the played card from hand
      const playedCard = this.hand.splice(cardIndex, 1)[0];

      // Animate only cards above the played card
      this.shiftCardsDown(offsets.handCardOffset, cardIndex);

      // Ensure played card renders on top
      Game.stage.addChild(playedCard.display);

      // Place card visually on board
      Game.controllers.placementController.placeCard(
        playedCard.display,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY,
      );

      // Reorder remaining AI hand for consistent layering
      this.reorderHand();
    }, this.aiDelay);
  }

  /**
   * Shift cards above the played card downwards.
   * @param {number} offsetY
   * @param {number} playedIndex
   */
  shiftCardsDown(offsetY, playedIndex) {
    for (let index = 0; index < playedIndex; index++) {
      const card = this.hand[index];
      if (card?.display) {
        createjs.Tween.get(card.display).to(
          { y: card.display.y + offsetY },
          200,
        );
      }
    }
  }

  /**
   * Ensures remaining AI cards are stacked in order on stage.
   */
  reorderHand() {
    for (const card of this.hand) {
      if (card?.display) {
        Game.stage.removeChild(card.display);
      }
    }
    for (const card of this.hand) {
      if (card?.display) {
        Game.stage.addChild(card.display);
      }
    }

    // Ensure the score display stays on top
    if (this.aiCardCount.text) {
      Game.stage.removeChild(this.aiCardCount);
      Game.stage.addChild(this.aiCardCount);
    }
  }

  /**
   * Clears AI hand and removes all visuals from stage.
   */
  resetHand() {
    for (const card of this.hand) {
      if (card?.display) {
        Game.stage.removeChild(card.display);
      }
    }
    this.hand = [];
    Game.stage.update();
  }
}
