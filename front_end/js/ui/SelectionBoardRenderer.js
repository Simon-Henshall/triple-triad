import { Game } from "../game/game.js";
import { utils } from "../game/utils.js";
import { config } from "../config.js";
import { player } from "../render/player.js";
import { UIManager } from "../managers/UIManager.js";
import { SelectionBoardUI } from "./SelectionBoardUI.js";

/**
 * Renders the selection board using the UIManager.selectionBoard object
 * (does NOT create the selection board background - that is created by
 * the calling code (e.g. pickPlayerCards) and stored on UIManager).
 */
export const SelectionBoardRenderer = {
  /**
   * Populate the visible card list for the given controller.
   * Uses UIManager.selectionBoard.background if present for coordinates.
   *
   * @param {SelectionBoardController} controller
   */
  populate(controller) {
    const sb = UIManager.selectionBoard;
    sb.displayedCards = [];

    // Ensure container exists and is the same object the rest of the app expects.
    if (sb.container === undefined || sb.container === null) {
      sb.container = new createjs.Container();
    }
    
    // Ensure container is on stage
    // NB: This is present on hard refresh, but absent on soft refresh
    if (!Game.stage.contains(sb.container)) {
      Game.stage.addChild(sb.container);
      console.log("Reattached selectionBoard container to stage.");
    }

    // Make sure we use the background already created by pickPlayerCards if present.
    // If not present, create a minimal fallback so rendering still works.
    if (sb.background === undefined || sb.background === null) {
      sb.background = new createjs.Shape();
      sb.background.graphics.beginFill("#666666").drawRect(100, 100, 500, 500);
      sb.background.x = 100;
      sb.background.y = 100;
      // Add fallback background only to the container (caller may replace it later).
      if (!sb.container.children.includes(sb.background)) {
        sb.container.addChildAt(sb.background, 0);
      }
    } else {
      // Ensure background is a child of the container and at the bottom.
      if (!sb.container.children.includes(sb.background)) {
        sb.container.addChildAt(sb.background, 0);
      } else {
        // Ensure background stays at index 0
        sb.container.setChildIndex(sb.background, 0);
      }
    }

    // Keep controller selection valid for the current page
    controller.clampSelectionToPage();

    // Sync page info
    sb.page = controller.currentPage;
    sb.totalPages = controller.totalPages;
    sb.remainingCards = controller.displayedCards.length;

    const cards = controller.displayedCards;

    // Recreate or clear the shownCards container (list area)
    if (!sb.shownCards) {
      sb.shownCards = new createjs.Container();
    } else {
      sb.shownCards.removeAllChildren();
    }

    // Build the visible list based on the *existing* background coordinates
    const baseX = sb.background.x;
    const baseY = sb.background.y;

    cards.forEach((cardData, i) => {
      const rowY = baseY + 35 * i + 60;

      // Name
      const nameText = new createjs.Text(cardData.displayName, "26px Arial", "#ffffff");
      nameText.x = baseX + 50;
      nameText.y = rowY;
      nameText.textBaseline = "alphabetic";

      // Count
      const countText = new createjs.Text(String(cardData.count), "26px Arial", "#ffffff");
      countText.x = baseX + 380;
      countText.y = rowY;
      countText.textBaseline = "alphabetic";
      if (cardData.count === 0) {
        countText.color = "#909497";
      }

      // Extract ID number from image string
      const match = cardData.image.match(/\d+$/);
      cardData.id = match ? parseInt(match[0], 10) : i;

      // Link the display text objects back to the data model
      cardData.nameText = nameText;
      cardData.countText = countText;

      // Add cardData to selectionBoard's displayedCards array
      if (!sb.displayedCards.find(c => c.id === cardData.id)) {
        sb.displayedCards.push(cardData);
      }

      // Icon (hide until loaded to avoid flash)
      const icon = utils._createScaledBitmap(
        "front_end/images/selection_card.png",
        30,
        30,
        (bmp) => {
          if (bmp.image && bmp.image.complete) {
            const targetSize = 30;
            const scaleX = targetSize / bmp.image.width;
            const scaleY = targetSize / bmp.image.height;
            bmp.scaleX = scaleX;
            bmp.scaleY = scaleY;
            bmp.visible = true;
            Game.stage.update();
          }
        }
      );

      icon.visible = false;
      icon.x = baseX + 15;
      icon.y = baseY + 35 * i + 35;
      icon.textBaseline = "alphabetic";

      sb.shownCards.addChild(nameText, countText, icon);
    });

    // Ensure shownCards is a child of the container and sits above the background
    if (!sb.container.children.includes(sb.shownCards)) {
      sb.container.addChild(sb.shownCards);
    } else {
      // ensure shownCards is above background
      const bgIndex = sb.container.getChildIndex(sb.background);
      const shownIndex = sb.container.getChildIndex(sb.shownCards);
      if (shownIndex <= bgIndex) {
        sb.container.setChildIndex(sb.shownCards, bgIndex + 1);
      }
    }

    // --- Update the preview card based on absolute selection ---
    sb.selectedHandCard = controller.selectedCard;
    this.updateDisplay(controller);

    // Move selection cursor to match the controller's selection on this page
    this.updateCursor(controller);

    // Update page display text if present
    if (sb.pageDisplay) {
      sb.pageDisplay.text = sb.page;
    }
    if (sb.totalPagesDisplay) {
      sb.totalPagesDisplay.text = sb.totalPages;
    }

    Game.stage.update();
  },

  updateBoardCount(cardId, delta) {
    const sb = UIManager.selectionBoard;
    if (!sb || !sb.displayedCards || !Game.stage) {
      console.warn("updateBoardCount: no displayedCards");
      return;
    }

    const card =
      sb.displayedCards.find((c) => c.id === cardId) ||
      SelectionBoardUI.controller.cards.find((c) => c.id === cardId);

    if (!card) {
      console.warn("updateBoardCount: card not found for id", cardId);
      return;
    }

    // adjust model if caller supplied delta (keeps backward compatibility)
    if (typeof delta === "number" && delta !== 0) {
      card.count = (card.count || 0) + delta;
    }

    // ensure visible text reflects logical count
    if (card.countText) {
      card.countText.text = String(card.count);
      // grey out if count reaches zero, restore white otherwise
      card.colour = card.count === 0 ? "#909497" : "#ffffff";
      card.countText.color = card.colour;
    } else {
      // if no countText (shouldn't happen for visible cards), log for debugging
      console.warn("updateBoardCount: card has no countText", card);
    }

    Game.stage.update();
  },

  /**
   * Update the preview display for the currently selected card.
   * This uses and updates sb.displayedCard (the preview container).
   *
   * @param {SelectionBoardController} controller
   * @param {object} [opts]
   * @param {boolean} [opts.skipTween=false]
   */
  updateDisplay(controller, { skipTween = false } = {}) {
    const sb = UIManager.selectionBoard;
    const selectedCard = controller.selectedCard;

    if (!selectedCard) {
      return;
    }

    const targetX = sb.background.x + 440;
    const targetY = sb.background.y + 200;
    const offscreenY = Game.stage.canvas.height + 50;

    if (!sb.displayedCard) {
      sb.displayedCard = utils.createCardContainer(selectedCard, "blue", targetX, offscreenY);
      Game.stage.addChild(sb.displayedCard);
      sb.displayedCardColour = sb.displayedCard.getChildAt(0);
      sb.displayedCardImage = sb.displayedCard.getChildAt(1);
    } else {
      if (sb.displayedCardColour) {
        sb.displayedCardColour.image.src = config.cardPath + "blue.png";
      }
      if (sb.displayedCardImage) {
        sb.displayedCardImage.image.src = config.cardPath + selectedCard.image + ".png";
      }
      sb.displayedCard.x = targetX;
      sb.displayedCard.y = offscreenY;
    }

    if (!skipTween) {
      createjs.Tween.get(sb.displayedCard, { override: true }).to(
        { y: targetY },
        300,
        createjs.Ease.quadOut
      );
    } else {
      sb.displayedCard.y = targetY;
    }
  },

  /**
   * Update selection cursor visual position so it matches controller.selectedIndexOnPage.
   *
   * @param {SelectionBoardController} controller
   */
  updateCursor(controller) {
    const sb = UIManager.selectionBoard;
    
    if (!player.playerHandSelectionCursor) {
      console.warn("updateCursor() error: no playerHandSelectionCursor");
      return;
    }

    const relativeIndex = controller.selectedIndexOnPage;
    const rowStep = 35;

    player.playerHandSelectionCursor.x = sb.background.x - 40;
    player.playerHandSelectionCursor.y = sb.background.y + 48 + rowStep * relativeIndex;

    // Ensure cursor is a child of the container above shownCards
    if (!sb.container.children.includes(player.playerHandSelectionCursor)) {
      sb.container.addChild(player.playerHandSelectionCursor);
    } else {
      const bgIndex = sb.container.getChildIndex(sb.background);
      sb.container.setChildIndex(player.playerHandSelectionCursor, bgIndex + 2);
    }
  },
};
