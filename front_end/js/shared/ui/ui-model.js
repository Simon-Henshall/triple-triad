import { Game } from "../game/game.js";
import { debug } from "../../utilities/debug.js";

export const UIModel = {
  // -------------------------
  // Grid / Selection state
  // -------------------------
  boardContainer: new createjs.Container(),
  squares: [],
  selectedSquare: 5,
  selectedRow: 2,
  selectedColumn: 2,
  squareLeft: "none",
  squareUp: "none",
  squareRight: "none",
  squareDown: "none",
  gridCursor: undefined,

  // -------------------------
  // Selection board state
  // -------------------------
  selectionBook: {
    container: undefined,
    background: undefined,
    shownCards: undefined,
    page: 1,
    pageDisplay: undefined,
    totalPages: undefined,
    remainingCards: undefined,
    displayedCards: undefined,
    displayedCard: undefined,
    displayedCardImage: undefined,
    displayedCardColour: undefined,
    selectedHandCardNumber: 0,
    selectedHandCard: undefined,
  },

  // -------------------------
  // Confirmation UI
  // -------------------------
  confirmation: {
    container: undefined,
    background: undefined,
    cursor: undefined,
    selectedChoice: 0,
  },

  // -------------------------
  // Player interaction flags
  // -------------------------
  selectedCardNumber: 0,
  selectedCard: undefined,
  previouslySelectedCard: [],
  playerSelectingHand: false,
  playerConfirming: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerTurn: "blue",

  /**
   * Restore player hand cursor visually (used on cancel).
   */
  restorePlayerHandCursor() {
    Game.controllers.cursorController.playerHand.place();
    if (debug.active) {
      console.log("Player hand cursor restored");
    }
    // Restore cursors
    UIModel.playerSelectingPlacement = false;
    UIModel.playerChoosingCard = true;
  },
};
