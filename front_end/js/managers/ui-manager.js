import { offsets } from "../constants/offsets.js";
import { Game } from "../game/game.js";

export const UIManager = {
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

    showPreviewCard(card) {
      if (!card || !card.visuals || !card.visuals.container) {
        return;
      }

      this.hidePreviewCard();

      const original = card.visuals.container;
      const previewContainer = original.clone(true);

      const bounds = original.getBounds();
      if (bounds) {
        previewContainer.scaleX = offsets.scaledPreviewWidth / bounds.width;
        previewContainer.scaleY = offsets.scaledPreviewHeight / bounds.height;
      } else {
        previewContainer.scaleX = previewContainer.scaleY = 1;
      }

      previewContainer.x = offsets.previewX;
      previewContainer.y = offsets.previewY;

      UIManager.previewCardContainer = previewContainer;

      Game.stage.addChild(previewContainer);
      Game.stage.update();
    },

    hidePreviewCard() {
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
    const { infoBox } = UIManager;
    if (infoBox.container) {
      Game.stage.setChildIndex(
        infoBox.container,
        Game.stage.getNumChildren() - 1,
      );
      infoBox.container.visible = true;
    }
  },
};
