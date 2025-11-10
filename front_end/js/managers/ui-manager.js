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
    showPreviewCard() {
      const sb = UIManager.selectionBook;

      // Only proceed if there is a card to show
      if (!sb.displayedCard) {
        return;
      }

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
      const sb = UIManager.selectionBook;
      if (sb.displayedCard && sb.displayedCard.parent) {
        sb.displayedCard.parent.removeChild(sb.displayedCard);
      }
    },

    updateCounts(deckCount, handCount) {
      if (this.countText) {
        this.countText.text = `Deck: ${deckCount} | Hand: ${handCount}`;
      }
    },
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
  // Info box state
  // -------------------------
  infoBox: {
    container: undefined,
    cardName: undefined,
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

  bringToFront() {
    // Ensure info box is visible and topmost
    const { infoBox } = UIManager;
    Game.stage.setChildIndex(
      infoBox.container,
      Game.stage.getNumChildren() - 1,
    );
    infoBox.container.visible = true;
  },
};
