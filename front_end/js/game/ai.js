import { offsets } from "../constants/offsets.js";
import { BoardManager } from "../managers/BoardManager.js";
import { UIManager } from "../managers/UIManager.js";
import { PlacementController } from "../controllers/PlacementController.js";
import { aiHand } from "./aiHand.js";
import { getGameStateInstance } from "./game.state.js";

const placementController = new PlacementController();

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

    if (!BoardManager.freeCells.length) {
      console.warn("No free cells available for AI move!");
      return;
    }

    // Pick A Cell To Play In (Currently Random)
    UIManager.selectedAISquare =
      BoardManager.freeCells[Math.floor(Math.random() * BoardManager.freeCells.length)];
    BoardManager.checkSelectedRowColumn();

    // Place The Card
    this.aiCardsAboveSelection = aiSelectedCardIndex;

    const GameStateInstance = getGameStateInstance();

    setTimeout(() => {
      placementController.placeCard(
        aiSelectedCard,
        offsets.gameOffsetX +
          offsets.cellWidth * (UIManager.selectedColumn - 1) +
          offsets.cardOffsetX,
        offsets.gameOffsetY +
          offsets.cellHeight * (UIManager.selectedRow - 1) +
          offsets.cardOffsetY
      );

      // Only remove from logical hand array here; visuals are handled in placeCard()
      GameStateInstance.hands.AI.splice(aiSelectedCardIndex, 1);
      this.cardsInAIHand.splice(aiSelectedCardIndex, 1);
    }, this.aiDelay);
  },
};
