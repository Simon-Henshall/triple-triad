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
   * Generate a random integer between min and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  _randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Simulate the AI "thinking" by cycling its selection cursor across random cards
   * before finally settling on the chosen card.
   * Each thought step lasts ~2 seconds, with 2-5 steps total (4-10 seconds).
   * @param {Array} hand - The AI hand
   * @param {number} finalIndex - The index of the card the AI ultimately selects
   */
  async _animateThinking(hand, finalIndex) {
    const numberSteps = this._randomInt(2, 5);
    const handSize = hand.length;

    // Pick random intermediate indices that differ from final and from each other
    let previousIndex = finalIndex;
    for (let step = 0; step < numberSteps; step++) {
      // Choose a random index that differs from the previous one
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * handSize);
      } while (randomIndex === previousIndex && handSize > 1);

      // Show selection (cursor + indent) on the random card
      this.view.showSelection(hand, randomIndex);

      // Wait ~2 seconds before moving to the next thought
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Hide the previous selection
      this.view.hideSelection(hand);

      previousIndex = randomIndex;
    }
  }

  /**
   * Executes a single AI turn, animating a "thinking" phase where the selection
   * cursor moves across random cards (2-5 steps, each ~2s) before settling on
   * the final chosen card.
   */
  async takeTurn() {
    // Choose which card to play (selects index without removing)
    const cardIndex = this.model.chooseCard();
    if (cardIndex < 0) {
      console.warn("[AI Turn] No cards left to play");
      return;
    }

    // Animate the AI "thinking" — cycling through random cards before settling
    await this._animateThinking(this.model.hand, cardIndex);

    // Show the final selection cursor and indent the chosen card
    this.view.showSelection(this.model.hand, cardIndex);

    // Pause briefly so the user sees the final selection
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
