import { AITurnView } from "./ai-turn-view.js";
import { BoardModel } from "../../shared/board/board-model.js";
import { Game } from "../../shared/game/game.js";
import { offsets } from "../../constants/offsets.js";

/**
 * AI Turn Controller
 * Handles the AI's decision-making, interacts with BoardModel, and updates the view.
 */
export class AITurnController {
  /**
   * Constructor for AI Turn Controller.
   * @param {Object} localDeps - dependencies provided by the state machine
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps, transition) {
    this.model = localDeps.aiModel;
    this.transition = transition;
    this.view = new AITurnView(Game.stage);
    this.handOffsetX = offsets.cardOffsetX; // x-position for AI hand on stage
  }

  /**
   * Activate the AI turn phase.
   */
  async activate() {
    console.log("[AI Turn] Activating AI turn phase");
    console.log(
      "[AI Turn] AI hand:",
      this.model.hand.map((c) => c.data.name),
    );
    // Execute the AI's turn (await so the phase stays active during the 2s delay)
    await this.takeTurn();
  }

  /**
   * Deactivate the AI turn phase.
   */
  async deactivate() {
    // Clean up if needed
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
   * Executes a single AI turn with a 2-second visual delay
   * to show the card selection (cursor + indentation).
   */
  async takeTurn() {
    // Choose which card to play (selects index without removing)
    const cardIndex = this.model.chooseCard();
    if (cardIndex < 0) {
      console.warn("[AI Turn] No cards left to play");
      return;
    }

    // Show the selection cursor and indent the chosen card
    this.view.showSelection(this.model.hand, cardIndex);

    // Wait 2 seconds so the user can see the selection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Hide the selection cursor and unindent
    this.view.hideSelection(this.model.hand);

    // Now actually remove the selected card from the AI's hand
    const playedCard = this.model.takeCard();
    if (!playedCard) {
      console.warn("[AI Turn] Failed to retrieve selected card from hand");
      return;
    }

    // Determine free cells
    const freeCells = BoardModel.boardArray
      .map((cell, index) => (cell.occupant ? undefined : index + 1))
      .filter(Boolean);

    if (freeCells.length === 0) {
      console.warn("[AI Turn] No free cells available!");
      return;
    }

    // Pick random free cell
    const selectedSquare =
      freeCells[Math.floor(Math.random() * freeCells.length)];
    BoardModel.selectedSquare = selectedSquare;
    BoardModel.updateUISelection(BoardModel.selectedSquare);

    // Animate cards above selection down
    this.view.shiftCardsDown(
      this.model.hand,
      offsets.handCardOffset,
      this.model.cardsAboveSelection,
    );

    // Place the card on the board
    Game.controllers.placementController.model.placeCard(
      playedCard,
      offsets.gameOffsetX +
        offsets.cellWidth * (BoardModel.selectedColumn - 1) +
        offsets.cardOffsetX,
      offsets.gameOffsetY +
        offsets.cellHeight * (BoardModel.selectedRow - 1) +
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
