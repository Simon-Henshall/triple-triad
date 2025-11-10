import { Game } from "../game/game.js";
import { config } from "../config.js";
import { UIManager } from "../managers/ui-manager.js";
import { createCardContainer, createScaledBitmap } from "../utilities/cards.js";

/** Constants for layout */
const ROW_HEIGHT = 35;
const CARD_ROW_START_Y = 60;
const CURSOR_X_OFFSET = -40;
const CURSOR_Y_OFFSET = 48;
const PREVIEW_X_OFFSET = 440;
const PREVIEW_Y_OFFSET = 200;
const ICON_SIZE = 30;
const BACKGROUND_FILL = "#666666";
const ZERO_COUNT_COLOR = "#909497";
const NORMAL_COUNT_COLOR = "#ffffff";

/**
 * Renders the selection board using UIManager.selectionBoard
 */
export const SelectionBoardRenderer = {
  /**
   * Populate the visible card list for the given controller
   * @param {SelectionBoardController} controller
   */
  populate(controller) {
    const sb = UIManager.selectionBoard;
    sb.displayedCards = [];

    this._ensureContainerOnStage(sb);
    this._ensureBackgroundOnContainer(sb);

    // Clamp selection to valid page
    controller.clampSelectionToPage();

    // Sync page info
    sb.page = controller.currentPage;
    sb.totalPages = controller.totalPages;
    sb.remainingCards = controller.displayedCards.length;

    // Prepare shownCards container
    if (sb.shownCards) {
      sb.shownCards.removeAllChildren();
    } else {
      sb.shownCards = new createjs.Container();
    }

    // Update preview and cursor
    sb.selectedHandCard = controller.selectedCard;
    this.updateDisplay(controller);
    this.updateCursor(controller);

    // Update page text
    if (sb.pageDisplay) {
      sb.pageDisplay.text = sb.page;
    }
    if (sb.totalPagesDisplay) {
      sb.totalPagesDisplay.text = sb.totalPages;
    }

    Game.stage.update();
  },

  /** Ensure selectionBoard container exists and is on stage */
  _ensureContainerOnStage(sb) {
    if (!sb.container) {
      sb.container = new createjs.Container();
    }
    if (!Game.stage.contains(sb.container)) {
      Game.stage.addChild(sb.container);
      console.log("Reattached selectionBoard container to stage.");
    }
  },

  /** Ensure selectionBoard background exists and is on container */
  _ensureBackgroundOnContainer(sb) {
    if (!sb.background) {
      sb.background = new createjs.Shape();
      sb.background.graphics
        .beginFill(BACKGROUND_FILL)
        .drawRect(100, 100, 500, 500);
      sb.background.x = 100;
      sb.background.y = 100;
      sb.container.addChildAt(sb.background, 0);
    } else if (sb.container.children.includes(sb.background)) {
      sb.container.setChildIndex(sb.background, 0);
    } else {
      sb.container.addChildAt(sb.background, 0);
    }
  },

  /**
   * Add visual elements for a single card and link them to cardData
   * @param {object} sb - selectionBoard
   * @param {object} cardData
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} index
   */
  _addCardVisual(sb, cardData, baseX, baseY, index) {
    const rowY = baseY + ROW_HEIGHT * index + CARD_ROW_START_Y;

    console.log(cardData);

    // Name text
    const nameText = new createjs.Text(
      cardData.displayName,
      "26px Arial",
      NORMAL_COUNT_COLOR,
    );
    nameText.x = baseX + 50;
    nameText.y = rowY;
    nameText.textBaseline = "alphabetic";

    // Count text
    const countText = new createjs.Text(
      String(cardData.count),
      "26px Arial",
      NORMAL_COUNT_COLOR,
    );
    countText.x = baseX + 380;
    countText.y = rowY;
    countText.textBaseline = "alphabetic";
    if (cardData.count === 0) {
      countText.color = ZERO_COUNT_COLOR;
    }

    // Extract ID from image
    const match = cardData.image.match(/\d+$/);
    cardData.id = match ? Number.parseInt(match[0], 10) : index;

    // Link text objects to cardData
    cardData.nameText = nameText;
    cardData.countText = countText;

    // Add to displayedCards array
    if (!sb.displayedCards.some((c) => c.id === cardData.id)) {
      sb.displayedCards.push(cardData);
    }

    // Icon
    const icon = createScaledBitmap(
      "front_end/images/selection_card.png",
      ICON_SIZE,
      ICON_SIZE,
      (bmp) => {
        if (bmp.image?.complete) {
          bmp.scaleX = ICON_SIZE / bmp.image.width;
          bmp.scaleY = ICON_SIZE / bmp.image.height;
          bmp.visible = true;
        }
      },
    );
    icon.visible = false;
    icon.x = baseX + 15;
    icon.y = baseY + ROW_HEIGHT * index + 35;

    sb.shownCards.addChild(nameText, countText, icon);
  },

  /** Ensure shownCards container is above background */
  _ensureShownCardsOnTop(sb) {
    if (sb.container.children.includes(sb.shownCards)) {
      const bgIndex = sb.container.getChildIndex(sb.background);
      const shownIndex = sb.container.getChildIndex(sb.shownCards);
      if (shownIndex <= bgIndex) {
        sb.container.setChildIndex(sb.shownCards, bgIndex + 1);
      }
    } else {
      sb.container.addChild(sb.shownCards);
    }
  },

  /**
   * Update the board count of a given card.
   * Adjusts both the logical model (if delta provided) and the visible count text.
   *
   * @param {number} cardId - The unique ID of the card to update
   * @param {number} [delta] - Optional delta to apply (positive or negative)
   */
  updateBoardCount(cardId, delta) {
    console.log("SelectionBoardRenderer.updateBoardCount", cardId);
    const sb = UIManager.selectionBoard;
    if (!sb?.displayedCards) {
      console.warn("updateBoardCount: no displayedCards or stage missing");
      return;
    }

    const card = sb.displayedCards.find((c) => c.id === cardId);
    if (!card) {
      console.warn("updateBoardCount: card not found for id", cardId);
      return;
    }

    // Adjust logical count if delta is provided
    if (typeof delta === "number") {
      card.count = (card.count || 0) + delta;
    }

    // Refresh visible count
    if (card.countText) {
      card.countText.color =
        card.count === 0 ? ZERO_COUNT_COLOR : NORMAL_COUNT_COLOR;
      card.countText.text = String(card.count);
    } else {
      console.warn("updateBoardCount: card has no countText", card);
    }

    Game.stage.update();
  },

  /**
   * Update the preview display for the currently selected card.
   * Creates or updates sb.displayedCard container.
   *
   * @param {SelectionBoardController} controller - Controller holding selection state
   * @param {object} [opts]
   * @param {boolean} [opts.skipTween=false] - If true, place instantly without tween
   */
  updateDisplay(controller, { skipTween = false } = {}) {
    const sb = UIManager.selectionBoard;
    const selectedCard = controller.selectedCard;
    if (!selectedCard) {
      return;
    }
    console.log(
      "SelectionBoardRenderer.updateDisplay",
      selectedCard,
      "Displayed Card:",
      sb.displayedCard,
      "Board:",
      sb,
    );
    const targetX = sb.background.x + PREVIEW_X_OFFSET;
    const targetY = sb.background.y + PREVIEW_Y_OFFSET;
    const offscreenY = Game.stage.canvas.height + 50;

    // If a displayedCard already exists, update its image and colour
    if (sb.displayedCard) {
      console.log("Displaying the card for a navigation load:", selectedCard);

      // Update face and colour bitmaps if already exists
      if (sb.displayedCardColour) {
        sb.displayedCardColour.image.src = config.cardPath + "blue.png";
      }

      if (sb.displayedCardImage) {
        sb.displayedCardImage.image.src =
          config.cardPath + selectedCard.data.imagePath;
      }

      // Reset position offscreen for tween
      sb.displayedCard.x = targetX;
      sb.displayedCard.y = offscreenY;
    } else {
      // Create and store the visual container
      console.log("Displaying the card for the first time:", selectedCard);
      sb.displayedCard = selectedCard.visuals.container;
      sb.displayedCard.x = targetX;
      sb.displayedCard.y = offscreenY;
      Game.stage.addChild(sb.displayedCard);
    }

    // Tween or place instantly
    if (skipTween) {
      console.log("Placing displayed card instantly at", targetY);
      sb.displayedCard.y = targetY;
    } else {
      createjs.Tween.get(sb.displayedCard, { override: true }).to(
        { y: targetY },
        300,
        createjs.Ease.quadOut,
      );
    }
  },

  /**
   * Move the selection cursor to visually match controller.selectedIndexOnPage.
   *
   * @param {SelectionBoardController} controller - Controller holding selection state
   */
  updateCursor(controller) {
    const sb = UIManager.selectionBoard;
    const cursor = Game.managers.playerManager.playerHandSelectionCursor;
    if (!cursor) {
      return;
    }

    // Compute cursor position based on background + row offsets
    const relativeIndex = controller.selectedIndexOnPage;
    cursor.x = sb.background.x + CURSOR_X_OFFSET;
    cursor.y = sb.background.y + CURSOR_Y_OFFSET + ROW_HEIGHT * relativeIndex;

    // Place cursor above shownCards container
    const shownIndex = sb.container.getChildIndex(sb.shownCards);
    if (sb.container.children.includes(cursor)) {
      sb.container.setChildIndex(cursor, shownIndex + 1);
    } else {
      sb.container.addChild(cursor);
    }
  },
};
