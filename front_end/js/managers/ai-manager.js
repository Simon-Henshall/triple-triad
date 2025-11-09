import { offsets } from "../constants/offsets.js";
import { BoardManager } from "../managers/board-manager.js";
import { UIManager } from "../managers/ui-manager.js";
import { Game } from "../game/game.js";
import { getGameStateInstance } from "../game/game.state.js";
import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { config } from "../config.js";
import { createCardContainer } from "../utilities/cards.js";
import { shuffle } from "../utilities/shuffle.js";
import { debug } from "../debug.js";

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
    /** @type {Array<AICard>} Cards currently in the AI’s hand (max 5) */
    this.hand = [];

    /** @type {number} Number of cards played by player */
    this.aiCardCount = 0;

    /** @type {number} Number of cards currently owned by the AI (score) */
    this.totalRedCards = 5;

    /** @type {number} Horizontal offset for AI hand rendering */
    this.handOffsetX = 0;

    /** @type {number} Index offset for the next card to be played */
    this.cardsAboveSelection = 0;

    /** @type {number} Delay between AI decision and placement (ms) */
    this.aiDelay = 1000;
  }

  /**
   * Populates the AI's hand visually from the current GameState.
   * If no logical hand exists yet, it generates a new one from the player's deck.
   */
  populateHand() {
    const GameStateInstance = getGameStateInstance();

    // Lazily populate AI logical hand if empty
    if (GameStateInstance.hands.AI.length === 0) {
      const playerManager = Game.managers.playerManager;
      GameStateInstance.hands.AI = shuffle([...playerManager.deck]).slice(0, 5);
    }

    // Remove any previous AI hand containers
    for (const card of this.hand) {
      if (card.display) {
        Game.stage.removeChild(card.display);
      }
    }
    this.hand = [];

    // Create new visual containers for AI cards
    for (const [index, cardData] of GameStateInstance.hands.AI.entries()) {
      const cardContainer = createCardContainer(
        cardData,
        "red",
        this.handOffsetX || offsets.gameOffsetX / 2 || 100,
        (offsets.handOffsetY || 50) + index * (offsets.handCardOffset || 95),
        {
          showBack: true,
          frontImageSrc: config.cardPath + cardData.image + ".png",
          backImageSrc: config.cardPath + "back.png",
          onReady: () => Game.stage.update(),
        },
      );

      this.hand.push(new AICard(cardData, cardContainer));
      Game.stage.addChild(cardContainer);
    }

    if (debug.active) {
      console.log("AI chose the following cards:", this.hand);
    }

    // Flip AI hand if "open" rule applies
    if (Game.rules?.includes("open")) {
      const playerManager = Game.managers.playerManager;
      const flippingRenderer = new FlippingRenderer(playerManager);
      flippingRenderer.flipAIHand();
    }

    Game.stage.update();
  }

  /**
   * Executes an AI turn: selects a random card and plays it on a random free cell.
   * Visual placement and flip logic are handled by PlacementController.
   */
  takeTurn() {
    if (this.hand.length === 0) {
      console.warn("AI has no cards to play!");
      return;
    }

    if (BoardManager.freeCells.length === 0) {
      console.warn("No free cells available for AI move!");
      return;
    }

    // Pick random card and target square
    const cardIndex = Math.floor(Math.random() * this.hand.length);
    const selectedCard = this.hand[cardIndex];
    const GameStateInstance = getGameStateInstance();

    UIManager.selectedAISquare =
      BoardManager.freeCells[
        Math.floor(Math.random() * BoardManager.freeCells.length)
      ];

    BoardManager.checkSelectedRowColumn();
    this.cardsAboveSelection = cardIndex;

    // Delay the actual placement for natural pacing
    setTimeout(() => {
      Game.controllers.placementController.placeCard(
        selectedCard.display,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY,
      );

      // Remove the logical card from hand
      GameStateInstance.hands.AI.splice(cardIndex, 1);
      this.hand.splice(cardIndex, 1);
    }, this.aiDelay);
  }

  /**
   * Resets the AI’s hand and clears visuals from the stage.
   */
  resetHand() {
    for (const card of this.hand) {
      if (card.display) {
        Game.stage.removeChild(card.display);
      }
    }
    this.hand = [];
    Game.stage.update();
  }
}
