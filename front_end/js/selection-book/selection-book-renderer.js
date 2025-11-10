import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";

const ROW_HEIGHT = 35;
const CARD_ROW_START_Y = 40;
const CURSOR_X_OFFSET = -40;
const CURSOR_Y_OFFSET = 60;
const NORMAL_COLOR = "#ffffff";

export const SelectionBookRenderer = {
  populate(controller) {
    const sb = UIManager.selectionBook;
    if (!sb.container) {
      return;
    }

    // Ensure base containers
    if (!sb.shownCards) {
      sb.shownCards = new createjs.Container();
      sb.cardIcons = []; // <-- cache for icons
    }
    sb.shownCards.removeAllChildren();

    // Flatten remaining cards
    const remainingCards = controller.cards
      .map((c) => ({ ...c, remaining: (c.count ?? 0) - (c.selected ?? 0) }))
      .filter((c) => c.remaining > 0);

    const CARDS_PER_PAGE = controller.cardsPerPage ?? 11;
    const pageStart = (controller.currentPage - 1) * CARDS_PER_PAGE;
    const pageEnd = pageStart + CARDS_PER_PAGE;
    const visibleCards = remainingCards.slice(pageStart, pageEnd);

    // Draw card rows
    for (const [rowIndex, card] of visibleCards.entries()) {
      this._addCardRow(sb, card, rowIndex, card.remaining);
    }

    // Update cursor
    this._updateCursor(controller);

    // Update page display
    if (sb.pageDisplay) {
      sb.pageDisplay.text = controller.currentPage.toString();
    }

    // Ensure shownCards is added
    if (!sb.container.children.includes(sb.shownCards)) {
      sb.container.addChild(sb.shownCards);
    }

    Game.stage.update();
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
    const nameText = new createjs.Text(
      card.data.name,
      "26px Arial",
      NORMAL_COLOR,
    );
    nameText.x = baseX + 60;
    nameText.y = rowY + 10;

    // Count
    const countText = new createjs.Text(
      remaining.toString(),
      "26px Arial",
      remaining > 0 ? NORMAL_COLOR : ZERO_COLOR,
    );
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

    const relIndex = controller.selectedIndexOnPage;

    cursor.x = sb.background.x + CURSOR_X_OFFSET;
    cursor.y = sb.background.y + CURSOR_Y_OFFSET + ROW_HEIGHT * relIndex;

    if (!sb.container.children.includes(cursor)) {
      sb.container.addChild(cursor);
    }

    // Ensure cursor is on top
    const shownIndex = sb.container.getChildIndex(sb.shownCards);
    sb.container.setChildIndex(cursor, shownIndex + 1);

    cursor.visible = true;
  },
};
