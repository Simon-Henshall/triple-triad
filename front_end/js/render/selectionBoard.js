import { config } from "../config.js";
import { ui } from "./ui.js";
import { Game } from "../game/game.js";
import { utils } from "../game/utils.js";
import { SelectionBoardController } from "../game/selectionBoardController.js";
import { player } from "./player.js";

// ------------------------------------
// selectionBoard
// Handles population, pagination, and display of the deck selection screen
// ------------------------------------
export const selectionBoard = {
  controller: null, // will be SelectionBoardController instance

  initialise(cards) {
    this.controller = new SelectionBoardController(cards);
    this.populate();
  },

  populate() {
    const sb = ui.selectionBoard;

    // Keep controller selection valid for the current page
    this.controller.clampSelectionToPage();

    // Sync page info to UI object so other callers (e.g. pageDisplay) can read it
    sb.page = this.controller.currentPage;
    sb.totalPages = this.controller.totalPages;
    // remainingCards = number of cards on THIS page (useful for last page)
    sb.remainingCards = this.controller.displayedCards.length;

    const cards = this.controller.displayedCards; // safe slice

    if (!sb.shownCards) sb.shownCards = new createjs.Container();
    else sb.shownCards.removeAllChildren();

    cards.forEach((cardData, i) => {
      // Name
      const nameText = new createjs.Text(
        cardData.displayName,
        "26px Arial",
        "#ffffff"
      );
      nameText.x = sb.background.x + 50;
      nameText.y = sb.background.y + 35 * i + 60;
      nameText.textBaseline = "alphabetic";

      // Count
      const countText = new createjs.Text(
        String(cardData.count),
        "26px Arial",
        "#ffffff"
      );
      countText.x = sb.background.x + 380;
      countText.y = sb.background.y + 35 * i + 60;
      countText.textBaseline = "alphabetic";

      // Icon (hide until loaded to avoid flash)
      const icon = utils._createScaledBitmap(
        "front_end/images/selection_card.png",
        30, // Target width
        30, // Target height
        (bmp) => {
          // When ready ensure correct scale & visibility and update stage
          if (bmp.image && bmp.image.width && bmp.image.height) {
            const targetSize = 30;
            const scaleX = targetSize / bmp.image.width;
            const scaleY = targetSize / bmp.image.height;
            bmp.scaleX = scaleX;
            bmp.scaleY = scaleY;
          }
          bmp.visible = true;
          Game.stage.update();
        }
      );

      // Initially hide until callback sets visibility/scale
      icon.visible = false;
      icon.x = sb.background.x + 15;
      icon.y = sb.background.y + 35 * i + 35;

      sb.shownCards.addChild(nameText, countText, icon);
    });

    if (sb.container && sb.shownCards.parent == null) {
      sb.container.addChild(sb.shownCards);
    }

    // --- Update the preview card based on absolute selection ---
    sb.selectedHandCard = this.controller.selectedCard;
    this.updateDisplay();

    // Move selection cursor to match the controller's selection on this page
    if (player.playerHandSelectionCursor && sb.background) {
      const relativeIndex = this.controller.selectedIndexOnPage;
      const rowStep = 35;
      player.playerHandSelectionCursor.x = sb.background.x - 40;
      player.playerHandSelectionCursor.y =
        sb.background.y + 48 + rowStep * relativeIndex;
      // ensure cursor is a child of the container
      if (!sb.container.children.includes(player.playerHandSelectionCursor)) {
        sb.container.addChild(player.playerHandSelectionCursor);
      }
    }

    // Update any page display text if present
    if (sb.pageDisplay) sb.pageDisplay.text = sb.page;
    if (sb.totalPagesDisplay) sb.totalPagesDisplay.text = sb.totalPages;

    Game.stage.update();
  },
  updateDisplay({ skipTween = false } = {}) {
    const sb = ui.selectionBoard;
    const selectedCard = this.controller.selectedCard;
    if (!selectedCard) return;

    const targetX = sb.background.x + 440;
    const targetY = sb.background.y + 200;
    const offscreenY = Game.stage.canvas.height + 50;

    if (!sb.displayedCard) {
      sb.displayedCard = utils.createCardContainer(
        selectedCard,
        "blue",
        targetX,
        offscreenY
      );
      Game.stage.addChild(sb.displayedCard);
      sb.displayedCardColour = sb.displayedCard.getChildAt(0);
      sb.displayedCardImage = sb.displayedCard.getChildAt(1);
    } else {
      // Update existing card
      if (sb.displayedCardColour)
        sb.displayedCardColour.image.src = config.cardPath + "blue.png";
      if (sb.displayedCardImage)
        sb.displayedCardImage.image.src =
          config.cardPath + selectedCard.image + ".png";
      sb.displayedCard.x = targetX;
      sb.displayedCard.y = offscreenY;
    }

    // Update preview card visuals
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

  paginate(direction) {
    this.controller.paginate(direction);
    this.populate();
  },

  moveSelection(next = true) {
    if (next) this.controller.selectNext();
    else this.controller.selectPrevious();
    this.populate();
  },
};
