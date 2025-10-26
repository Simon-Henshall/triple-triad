import { offsets } from "../render/offsets.js";
import { board } from "../render/board.js";
import { ui } from "../render/ui.js";
import { placementController } from "./placementController.js";
import { aiHand } from "./aiHand.js";
import { getGameStateInstance } from "./game.state.js";

export const ai = {
  handOffsetX: 0,
  cardsInAIHand: [],
  aiCardsAboveSelection: 0,
  aiCardCount: 0,
  aiDelay: 1000,
  totalRedCards: 5,
  aiHand: aiHand,
  // -------------------------
  // AI TURN
  // -------------------------
  turn() {
    // Pick A Card To Play (Currently Random)
    if (this.cardsInAIHand.length === 0) {
      console.warn("AI has no cards to play!");
      return;
    }

    const aiSelectedCardIndex = Math.floor(
      Math.random() * this.cardsInAIHand.length
    );
    const aiSelectedCard = this.cardsInAIHand[aiSelectedCardIndex];

    if (!board.freeCells.length) {
      console.warn("No free cells available for AI move!");
      return;
    }

    // Pick A Cell To Play In (Currently Random)
    ui.selectedAISquare =
      board.freeCells[Math.floor(Math.random() * board.freeCells.length)];
    board.checkSelectedRowColumn();

    // Place The Card
    this.aiCardsAboveSelection = aiSelectedCardIndex;

    const GameStateInstance = getGameStateInstance();

    setTimeout(() => {
      placementController.placeCard(
        aiSelectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (ui.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (ui.selectedRow - 1) +
          offsets.cardOffsetY
      );

      // Only remove from logical hand array here; visuals are handled in placeCard()
      GameStateInstance.hands.AI.splice(aiSelectedCardIndex, 1);
      this.cardsInAIHand.splice(aiSelectedCardIndex, 1);
    }, this.aiDelay);
  },
};
