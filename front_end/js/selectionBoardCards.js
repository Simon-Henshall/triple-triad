// -----------------------------
// selectionBoardCards.js
// -----------------------------

// Helper: get bounds of selection board background
function getBackgroundBounds() {
  if (window.selectionBoardBackground) {
    return window.selectionBoardBackground.getBounds() || { width: 480, height: 420 };
  }
  return { width: 480, height: 420 };
}

// -------------------------
// Shim to restore old selection-board behaviour
// -------------------------
function populateSelectionBoardCardsShim() {
  // Ensure stage reference exists
  if (!window.stage && Game && Game.stage) window.stage = Game.stage;
  if (!window.stage) {
    console.warn("⚠️ stage not ready, skipping selection board render");
    return;
  }

  // Ensure globals
  window.selectionBoard = window.selectionBoard || new createjs.Container();
  window.selectionBoardBackground = window.selectionBoardBackground || new createjs.Shape();
  window.shownCards = window.shownCards || new createjs.Container();

  const sb = window.selectionBoard;
  const sbBg = window.selectionBoardBackground;
  const shown = window.shownCards;

  // Draw background once
  if (!sbBg.parent) {
    sbBg.graphics.clear().beginFill("#666666").drawRect(0, 0, 420, 450);
    sbBg.x = 170;
    sbBg.y = 100;
    sb.addChild(sbBg);
  }

  // Clear shown cards
  shown.removeAllChildren();

  const owned = window.ownedCards || [];
  const cardsToDisplay = Math.min(11, owned.length);

  for (let j = 0; j < cardsToDisplay; j++) {
    const cardData = owned[j] || { displayName: "UNKNOWN", count: 0, image: "card0" };

    const cardName = new createjs.Text(cardData.displayName, "26px Arial", "#ffffff");
    cardName.x = sbBg.x + 50;
    cardName.y = sbBg.y + 35 * j + 60;
    cardName.textBaseline = "alphabetic";

    const cardCount = new createjs.Text(String(cardData.count || 0), "26px Arial", "#ffffff");
    cardCount.x = sbBg.x + 380;
    cardCount.y = sbBg.y + 35 * j + 60;
    cardCount.textBaseline = "alphabetic";

    const icon = new createjs.Bitmap("front_end/images/selection_card.png");
    icon.x = sbBg.x + 15;
    icon.y = sbBg.y + 35 * j + 35;

    if (icon.image && icon.image.height) {
      const sc = 30 / icon.image.height;
      icon.scaleX = icon.scaleY = sc;
    } else if (icon.image) {
      icon.image.onload = () => {
        const sc = 30 / icon.image.height;
        icon.scaleX = icon.scaleY = sc;
        window.stage && window.stage.update();
      };
    }

    shown.addChild(cardName, cardCount, icon);
  }

  if (sb.getChildIndex(shown) === -1) {
    sb.addChild(shown);
  }

  // Default selected card
  window.selectedHandCardNumber = window.selectedHandCardNumber || 0;
  const selIndex = Math.max(0, Math.min(window.selectedHandCardNumber, owned.length - 1 || 0));
  window.selectedHandCardNumber = selIndex;
  window.selectedHandCard = owned[selIndex] || null;

  const selected = window.selectedHandCard || owned[0] || null;

  // Preview card
  if (selected) {
    if (window.displayedCard && window.displayedCard.parent) {
      window.displayedCard.parent.removeChild(window.displayedCard);
    }
    window.displayedCard = null;

    const previewContainer = new createjs.Container();
    const backingBmp = new createjs.Bitmap(Game.config.cardPath + "blue.png");
    const frontBmp = new createjs.Bitmap(Game.config.cardPath + (selected.image || "card0") + ".png");

    previewContainer.addChild(backingBmp, frontBmp);

    // Position to the right of selection board
    previewContainer.x = sbBg.x + getBackgroundBounds().width + 40;
    previewContainer.y = sbBg.y + 60;

    sb.addChild(previewContainer);
    window.displayedCard = previewContainer;

    // Scale once images load
    const finalizePreview = () => {
      const targetW = Game.offsets.cellWidth || 60;
      const targetH = Game.offsets.cellHeight || 60;
      const bw = backingBmp.image?.width || targetW;
      const bh = backingBmp.image?.height || targetH;
      const s = Math.min(targetW / bw, targetH / bh);
      backingBmp.scaleX = backingBmp.scaleY = s;
      if (frontBmp.image?.width) frontBmp.scaleX = frontBmp.scaleY = s;
      frontBmp.x = (bw * s - (frontBmp.image?.width || bw) * s) / 2;
      frontBmp.y = (bh * s - (frontBmp.image?.height || bh) * s) / 2;
      window.stage && window.stage.update();
    };

    let pending = 0;
    if (!backingBmp.image || !backingBmp.image.complete) {
      pending++;
      backingBmp.image.onload = () => {
        if (--pending <= 0) finalizePreview();
      };
    }
    if (!frontBmp.image || !frontBmp.image.complete) {
      pending++;
      frontBmp.image.onload = () => {
        if (--pending <= 0) finalizePreview();
      };
    }
    if (pending === 0) finalizePreview();
  }

  // Selection cursor
  if (!window.selectionCursor) {
    window.selectionCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
    const desired = 28;
    if (window.selectionCursor.image && window.selectionCursor.image.height) {
      const sc = desired / window.selectionCursor.image.height;
      window.selectionCursor.scaleX = window.selectionCursor.scaleY = sc;
    } else if (window.selectionCursor.image) {
      window.selectionCursor.image.onload = function () {
        const sc = desired / window.selectionCursor.image.height;
        window.selectionCursor.scaleX = window.selectionCursor.scaleY = sc;
        window.stage && window.stage.update();
      };
    }
    sb.addChild(window.selectionCursor);
  }

  // Add selection board to stage
  if (!window.stage.contains(sb)) {
    window.stage.addChild(sb);
  }
  window.stage && window.stage.update();

  // Legacy noop shim
  if (window.__playerCardManager && !window.__playerCardManager.updateHandCards) {
    window.__playerCardManager.updateHandCards = function () {};
  }

  // Sync Game.ui
  Game.ui = Game.ui || {};
  Game.ui.selectedHandCardNumber = window.selectedHandCardNumber;
  Game.ui.selectedHandCard = window.selectedHandCard;
}

// -----------------------------
// Main entry (kept for compatibility)
function populateSelectionBoardCards(cards = window.ownedCards || []) {
  if (!window.stage && Game && Game.stage) window.stage = Game.stage;
  if (!window.stage) return;

  populateSelectionBoardCardsShim();
}

// -----------------------------
// Cursor helpers
function updateSelectionCursorPosition() {
  if (!window.selectionCursor || !window.selectionBoardBackground) return;
  const rowSpacing = 36;
  const startY = window.selectionBoardBackground.y + 40;
  const indexOnPage = (window.selectedHandCardNumber || 0) % 11;
  window.selectionCursor.x = window.selectionBoardBackground.x + 12;
  window.selectionCursor.y = startY + indexOnPage * rowSpacing - 6;
  window.stage && window.stage.update();

  Game.ui = Game.ui || {};
  Game.ui.selectedHandCardNumber = window.selectedHandCardNumber;
  Game.ui.selectedHandCard = window.ownedCards?.[window.selectedHandCardNumber] || null;
}

function moveSelectionCursor(direction) {
  const owned = window.ownedCards || [];
  if (!owned.length) return;

  const perPage = 11;
  if (!window.page) window.page = 1;
  let oldPage = window.page;
  let oldIndex = window.selectedHandCardNumber || 0;

  if (direction === "up") {
    if (oldIndex % perPage !== 0) window.selectedHandCardNumber = oldIndex - 1;
    else if (oldPage > 1) {
      window.page = oldPage - 1;
      window.selectedHandCardNumber = window.page * perPage - 1;
      populateSelectionBoardCardsShim();
    }
  } else if (direction === "down") {
    const indexOnPage = oldIndex % perPage;
    const pageCount = Math.min(perPage, owned.length - (window.page - 1) * perPage);
    if (indexOnPage < pageCount - 1) window.selectedHandCardNumber = oldIndex + 1;
    else if (window.page < window.totalPages) {
      window.page++;
      window.selectedHandCardNumber = (window.page - 1) * perPage;
      populateSelectionBoardCardsShim();
    }
  } else if (direction === "left") {
    if (window.page > 1) {
      window.page--;
      window.selectedHandCardNumber = Math.max(0, (window.page - 1) * perPage);
      populateSelectionBoardCardsShim();
    }
  } else if (direction === "right") {
    if (window.page < window.totalPages) {
      window.page++;
      window.selectedHandCardNumber = Math.min(owned.length - 1, (window.page - 1) * perPage);
      populateSelectionBoardCardsShim();
    }
  }

  updateSelectionCursorPosition();
}

// -----------------------------
// Expose legacy API
window.populateSelectionBoardCards = populateSelectionBoardCards;
window.populateSelectionBoardCardsShim = populateSelectionBoardCardsShim;
window.updateSelectionCursorPosition = updateSelectionCursorPosition;
window.moveSelectionCursor = moveSelectionCursor;
