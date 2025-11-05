import { Game } from "../game/game.js";

export const UIManager = {
  // -------------------------
  // Grid / Selection state
  // -------------------------
  squares: [],
  selectedRow: 2,
  selectedColumn: 2,
  selectedSquare: 5,
  selectedAISquare: undefined,
  squareLeft: undefined,
  squareUp: undefined,
  squareRight: undefined,
  squareDown: undefined,
  gridCursor: null,

  // -------------------------
  // Selection board state
  // -------------------------
  selectionBoard: {
    container: null,
    background: null,
    shownCards: null,
    page: 1,
    pageDisplay: null,
    totalPages: undefined,
    remainingCards: undefined,
    displayedCards: undefined,
    displayedCard: null,
    displayedCardImage: null,
    displayedCardColour: null,
    selectedHandCardNumber: 0,
    selectedHandCard: null,
    showPreviewCard() {
      const sb = UIManager.selectionBoard;

      // Only proceed if there is a card to show
      if (!sb.displayedCard) return;

      // Ensure the container exists
      if (!sb.container) {
        sb.container = new createjs.Container();
      }

      // Ensure the container is on the stage
      if (!sb.container.parent) {
        Game.stage?.addChild(sb.container);
      }

      // Ensure the card is inside the container
      if (!sb.displayedCard.parent) {
        sb.container.addChild(sb.displayedCard);
      }

      // Force stage redraw
      Game.stage?.update();
    },

    hidePreviewCard() {
      const sb = UIManager.selectionBoard;
      if (sb.displayedCard && sb.displayedCard.parent) {
        sb.displayedCard.parent.removeChild(sb.displayedCard);
      }
    },
  },

  // -------------------------
  // Confirmation UI
  // -------------------------
  confirmation: {
    container: null,
    background: null,
    cursor: null,
    selectedChoice: 0,
  },

  // -------------------------
  // Info box state
  // -------------------------
  infoBox: {
    container: null,
    cardName: null,
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

  // -------------------------
  // Cards
  // -------------------------
  cardName: undefined,
  cardCount: undefined,
  card: undefined,
  cardImage: undefined,
};
