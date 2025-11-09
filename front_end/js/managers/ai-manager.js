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
    /** @type {Array<AICard>} Cards currently in the AI’s hand (max 5) */
    this.hand = [];

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
    this.hand = [];

    const playerManager = Game.managers.playerManager;
    console.log(playerManager);
    const pickedCards = shuffle(playerManager.deck).slice(0, 5);
    console.log(pickedCards);

    // Create new visual containers for AI cards
    const count = 5;
    for (let index_ = 0; index_ < count; index_++) {
      const cardContainer = createCardContainer(
        pickedCards[index_],
        "red",
        this.handOffsetX || offsets.gameOffsetX / 2 || 100,
        (offsets.handOffsetY || 50) + index_ * (offsets.handCardOffset || 95),
        {
          showBack: true,
          frontImageSrc: config.cardPath + pickedCards[index_].image + ".png",
          backImageSrc: config.cardPath + "back.png",
          onReady: () => Game.stage.update(),
        },
      );

      this.hand.push(new AICard(pickedCards[index_], cardContainer));
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
      return;
    }
    if (BoardManager.freeCells.length === 0) {
      return;
    }

    const cardIndex = Math.floor(Math.random() * this.hand.length);
    const selectedCard = this.hand[cardIndex];

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

      // Ensure played card is on top of stage
      Game.stage.addChild(playedCard.display);

      // Place the selected card visually
      Game.controllers.placementController.placeCard(
        playedCard.display,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY,
      );
    }, this.aiDelay);
  }

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

    // No need to touch cards below the played card
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
