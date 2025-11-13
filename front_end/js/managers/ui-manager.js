import { offsets } from "../constants/offsets.js";
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

    showPreviewCard(card) {
      if (!card || !card.visuals || !card.visuals.container) {
        return;
      }

      // Remove any existing preview first
      this.hidePreviewCard();

      // Deep clone
      const original = card.visuals.container;
      const previewContainer = original.clone(true);

      // Force scale to match standard preview size
      const targetWidth = offsets.scaledPreviewWidth;
      const targetHeight = offsets.scaledPreviewHeight;

      const bounds = original.getBounds();
      if (bounds) {
        previewContainer.scaleX = targetWidth / bounds.width;
        previewContainer.scaleY = targetHeight / bounds.height;
      } else {
        // Fallback: scale proportionally if bounds not ready yet
        previewContainer.scaleX = previewContainer.scaleY = 1;
      }

      // Position preview
      previewContainer.x = offsets.previewX;
      previewContainer.y = offsets.previewY;

      // Store reference for later removal
      UIManager.previewCardContainer = previewContainer;

      Game.stage.addChild(previewContainer);
      Game.stage.update();
    },

    hidePreviewCard() {
      console.log("[UI Manager] Hiding preview card...");
      const preview = UIManager.previewCardContainer;
      if (preview && Game.stage.contains(preview)) {
        Game.stage.removeChild(preview);
      }
      UIManager.previewCardContainer = undefined;
      Game.stage.update();
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
