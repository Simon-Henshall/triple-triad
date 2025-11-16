import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";

const ROW_HEIGHT = 35;
const CARD_ROW_START_Y = 40;
const CURSOR_X_OFFSET = -40;
const CURSOR_Y_OFFSET = 60;
const NORMAL_COLOR = "#ffffff";
const ZERO_COLOR = "#888"; // grey for zero counts

export const SelectionBookRenderer = {
  populate(controller) {
    const sb = UIManager.selectionBook;
    if (!sb.container) {
      return;
    }

    // Ensure base containers
    if (!sb.shownCards) {
      sb.shownCards = new createjs.Container();
      sb.cardIcons = []; // cache for icons
      sb.cardNameTexts = []; // cache for name texts
      sb.cardCountTexts = []; // cache for count texts
    }
    sb.shownCards.removeAllChildren();

    const visibleCards = controller.visibleCards;

    // Draw each card row
    for (const [rowIndex, card] of visibleCards.entries()) {
      const color = card.remaining > 0 ? "#ffffff" : "#888"; // NORMAL_COLOR / ZERO_COLOR
      this._addCardRow(sb, card, rowIndex, card.remaining, color);
    }

    // Update cursor — make sure it considers all visible rows, even zero stock
    this._updateCursor(controller, visibleCards.length);

    // Update page display
    if (sb.pageDisplay) {
      sb.pageDisplay.text = controller.currentPage.toString();
    }

    // Ensure container
    if (!sb.container.children.includes(sb.shownCards)) {
      sb.container.addChild(sb.shownCards);
    }
  },

  _addCardRow(sb, card, rowIndex, remaining) {
    const baseX = sb.background.x;
    const baseY = sb.background.y + CARD_ROW_START_Y;
    const rowY = baseY + rowIndex * ROW_HEIGHT;

    // Reuse icon if exists
    let icon = sb.cardIcons[rowIndex];
    if (!icon) {
      icon = new createjs.Bitmap("front_end/images/selection_card.png");
      icon.scaleX = icon.scaleY = 0.6;
      sb.cardIcons[rowIndex] = icon;
    }

    icon.x = baseX + 15;
    icon.y = rowY + 10;

    // Card name
    if (!sb.cardNameTexts) {
      sb.cardNameTexts = [];
    }
    if (!sb.cardCountTexts) {
      sb.cardCountTexts = [];
    }

    let nameText = sb.cardNameTexts[rowIndex];
    if (nameText) {
      nameText.text = card.data.name; // update existing
    } else {
      nameText = new createjs.Text(card.data.name, "26px Arial", NORMAL_COLOR);
      sb.cardNameTexts[rowIndex] = nameText;
    }
    nameText.x = baseX + 60;
    nameText.y = rowY + 10;

    // Count
    let countText = sb.cardCountTexts[rowIndex];
    if (countText) {
      countText.text = remaining.toString(); // update existing
    } else {
      countText = new createjs.Text(
        remaining.toString(),
        "26px Arial",
        remaining > 0 ? NORMAL_COLOR : ZERO_COLOR,
      );
      sb.cardCountTexts[rowIndex] = countText;
    }

    // Update color for existing text as well
    countText.color = remaining > 0 ? NORMAL_COLOR : ZERO_COLOR;
    countText.x = baseX + 380;
    countText.y = rowY + 10;

    sb.shownCards.addChild(icon, nameText, countText);
  },

  _updateCursor(controller) {
    const sb = UIManager.selectionBook;
    const cursor = Game.managers.playerManager.playerHandSelectionCursor;
    if (!cursor) {
      return;
    }

    const relativeIndex = controller.selectedIndexOnPage;

    cursor.x = sb.background.x + CURSOR_X_OFFSET;
    cursor.y = sb.background.y + CURSOR_Y_OFFSET + ROW_HEIGHT * relativeIndex;

    if (!sb.container.children.includes(cursor)) {
      sb.container.addChild(cursor);
    }

    // Ensure cursor is on top
    const shownIndex = sb.container.getChildIndex(sb.shownCards);
    sb.container.setChildIndex(cursor, shownIndex + 1);

    cursor.visible = true;
  },
};
