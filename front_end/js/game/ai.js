import { offsets } from "../render/offsets.js";
import { board } from "../render/board.js";
import { ui } from "../render/ui.js";
import { placementController } from "./placementController.js";
import { aiHand } from "./aiHand.js";

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
    const aiSelectedCard =
      ai.cardsInAIHand[Math.floor(Math.random() * ai.cardsInAIHand.length)];
    const aiSelectedCardNumber = ai.cardsInAIHand.indexOf(aiSelectedCard);

    // Pick A Cell To Play In (Currently Random)
    ui.selectedAISquare =
      board.freeCells[Math.floor(Math.random() * board.freeCells.length)];
    board.checkSelectedRowColumn();

    // Place The Card
    ai.aiCardsAboveSelection = aiSelectedCardNumber;
    ai.cardsInAIHand.splice(aiSelectedCardNumber, 1);
    setTimeout(function () {
      placementController.placeCard(
        aiSelectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (ui.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (ui.selectedRow - 1) +
          offsets.cardOffsetY
      );
    }, ai.aiDelay);
  },
};
