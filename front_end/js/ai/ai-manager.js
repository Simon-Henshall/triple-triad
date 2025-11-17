import { offsets } from "../constants/offsets.js";
import { BoardManager } from "../board/board-manager.js";
import { UIManager } from "../ui/ui-manager.js";
import { Game } from "../game/game.js";

/**
 * Manages the AI's logical and visual state: deck, hand, and turn actions.
 */
export class AIManager {
  /**
   * Manages the AI's logical and visual state: deck, hand, and turn actions.
   *
   * @class AIManager
   */
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

    /** @type {number} Delay between AI decision and placement (ms) */
    this.aiDelay = 1000;
  }
  /**
   * Populates the AI's hand visually from the current deck.
   * If no logical hand exists yet, it draws up to 5 cards.
   */
  populateHand() {
    for (let index = 0; index < 5 && this.deck.length > 0; index++) {
      const randomIndex = Math.floor(Math.random() * this.deck.length);
      const [card] = this.deck.splice(randomIndex, 1);
      this.hand.push(card);

      const container = card.visuals.container;
      container.x = this.handOffsetX || offsets.gameOffsetX / 2;
      container.y = offsets.handOffsetY + index * offsets.handCardOffset;

      // Hide face, show back
      if (card.visuals.faceBitmap) {
        card.visuals.faceBitmap.visible = false;
      }
      if (card.visuals.colourBitmap) {
        card.visuals.colourBitmap.visible = false;
      }
      if (card.visuals.backBitmap) {
        card.visuals.backBitmap.visible = true;
      }

      Game.stage.addChild(container);
    }

    Game.stage.update();

    console.log(
      "[AI Manager] AI has drawn their hand. AI hand is now:",
      this.hand.map((c) => c.data.name),
    );
  }

  /**
   * Shift cards above the played card downwards (visual only).
   * @param {number} offsetY
   * @param {number} playedIndex
   */
  shiftCardsDown(offsetY, playedIndex) {
    for (let index = 0; index < playedIndex; index++) {
      const card = this.hand[index];
      if (card?.visuals.container) {
        createjs.Tween.get(card.visuals.container).to(
          { y: card.visuals.container.y + offsetY },
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
      if (card?.visuals.container) {
        Game.stage.removeChild(card.visuals.container);
      }
    }
    for (const card of this.hand) {
      if (card?.visuals.container) {
        Game.stage.addChild(card.visuals.container);
      }
    }

    // Ensure the AI card count display stays on top
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
      if (card?.visuals.container) {
        Game.stage.removeChild(card.visuals.container);
      }
    }
    this.hand = [];
    Game.stage.update();
  }
  /**
   * Executes an AI turn: selects a random card and places it on a free cell.
   * Ensures proper board registration and visual placement.
   */
  takeTurn() {
    if (this.hand.length === 0) {
      console.warn("[AI] No cards left to play!");
      return;
    }

    // Pick a random card from AI hand
    const cardIndex = Math.floor(Math.random() * this.hand.length);
    const playedCard = this.hand[cardIndex];

    // Get list of truly free cells
    const freeCells = BoardManager.boardArray
      .map((cell, index) => (cell.occupant ? undefined : index + 1))
      .filter(Boolean);

    if (freeCells.length === 0) {
      console.warn("[AI] No free cells available!");
      return;
    }

    // Pick a random free cell
    const selectedSquare =
      freeCells[Math.floor(Math.random() * freeCells.length)];
    UIManager.selectedSquare = selectedSquare;

    // Update UIManager row/column for placement
    BoardManager.updateUISelection(UIManager.selectedSquare);

    this.cardsAboveSelection = cardIndex;

    // Remove played card from hand
    this.hand.splice(cardIndex, 1);

    // Shift cards above visually
    this.shiftCardsDown(offsets.handCardOffset, cardIndex);

    Game.controllers.placementController.manager.placeCard(
      playedCard,
      offsets.gameOffsetX +
        offsets.cellWidth * (UIManager.selectedColumn - 1) +
        offsets.cardOffsetX,
      offsets.gameOffsetY +
        offsets.cellHeight * (UIManager.selectedRow - 1) +
        offsets.cardOffsetY,
    );
  }
}
