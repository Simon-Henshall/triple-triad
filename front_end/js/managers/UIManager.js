// -----------------------------------------------------------------------------
// File: front_end/js/ui/UIManager.js
// Purpose: hold non-rendered UI state, structure, and references
// -----------------------------------------------------------------------------

export const UIManager = {
  // -------------------------
  // Grid / Selection state
  // -------------------------
  squares: [],
  selectedRow: 2,
  selectedColumn: 2,
  selectedSquare: 5,
  selectedAISquare: undefined,

  // MISSED
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
    hidePreviewCard() {
      if (this.displayedCard && this.displayedCard.parent) {
        this.displayedCard.parent.removeChild(this.displayedCard);
      }
    },

    showPreviewCard() {
      if (this.displayedCard && !this.displayedCard.parent) {
        Game.stage.addChild(this.displayedCard);
      }
    }
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
  
  // MISSED
  cardName: undefined,
  cardCount: undefined,
  card: undefined,
  cardImage: undefined,
};
