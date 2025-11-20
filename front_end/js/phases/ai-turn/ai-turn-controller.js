import { AITurnModel } from "./ai-turn-model.js";
import { AITurnView } from "./ai-turn-view.js";
import { BoardManager } from "../../shared/board/board-manager.js";
import { UIManager } from "../../shared/ui/ui-manager.js";
import { Game } from "../../shared/game/game.js";
import { offsets } from "../../constants/offsets.js";

/**
 * AI Turn Controller
 * Handles the AI's decision-making, interacts with BoardManager, and updates the view.
 */
export class AITurnController {
  /**
   * Constructor for AI Turn Controller.
   * @param {AITurnModel} model - The AI turn model.
   */
  constructor(model) {
    this.model = model;
    this.view = new AITurnView(Game.stage);
    this.handOffsetX = offsets.cardOffsetX; // x-position for AI hand on stage
  }

  /**
   * Initialise the AI hand visually and logically
   */
  initHand(drawnCards) {
    if (!drawnCards || drawnCards.length === 0) {
      return;
    }

    this.view.displayHand(drawnCards, this.handOffsetX);

    console.log(
      "[AI Turn] Hand initialised:",
      drawnCards.map((c) => c.data.name),
    );
  }

  /**
   * Executes a single AI turn
   */
  takeTurn() {
    // Choose a card
    const playedCard = this.model.chooseCard();
    if (!playedCard) {
      console.warn("[AI Turn] No cards left to play");
      return;
    }

    // Determine free cells
    const freeCells = BoardManager.boardArray
      .map((cell, index) => (cell.occupant ? undefined : index + 1))
      .filter(Boolean);

    if (freeCells.length === 0) {
      console.warn("[AI Turn] No free cells available!");
      return;
    }

    // Pick random free cell
    const selectedSquare =
      freeCells[Math.floor(Math.random() * freeCells.length)];
    UIManager.selectedSquare = selectedSquare;
    BoardManager.updateUISelection(UIManager.selectedSquare);

    // Animate cards above selection down
    this.view.shiftCardsDown(
      this.model.hand,
      offsets.handCardOffset,
      this.model.cardsAboveSelection,
    );

    // Place the card on the board
    Game.controllers.placementController.manager.placeCard(
      playedCard,
      offsets.gameOffsetX +
        offsets.cellWidth * (UIManager.selectedColumn - 1) +
        offsets.cardOffsetX,
      offsets.gameOffsetY +
        offsets.cellHeight * (UIManager.selectedRow - 1) +
        offsets.cardOffsetY,
    );

    // Update model
    this.model.decrementMove();

    console.log(
      "[AI Turn] Played card:",
      playedCard.data.name,
      "Cards remaining:",
      this.model.hand.length,
    );
  }

  /**
   * Reset hand between turns
   */
  resetHand() {
    this.view.clearHand(this.model.hand);
    this.model.resetHand();
  }
}
