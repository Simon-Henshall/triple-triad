// ------------------------------------
// game.cards.selectionBoard.js
// Handles population, pagination, and display of the deck selection screen
// ------------------------------------

Game.cards = Game.cards || {};

Game.cards.selectionBoard = {
  /**
   * Helper: create a bitmap and ensure it is scaled before adding to container.
   * @param {string} src - image path
   * @param {number} targetWidth
   * @param {number} targetHeight
   * @param {function} onReady - callback with bitmap once scaled
   */
  _createScaledBitmap(src, targetWidth, targetHeight, onReady) {
    const bmp = new createjs.Bitmap(src);

    const applyScale = () => {
      bmp.scaleX = targetWidth / bmp.image.width;
      bmp.scaleY = targetHeight / bmp.image.height;
      if (onReady) onReady(bmp);
    };

    if (!bmp.image.complete) {
      bmp.image.onload = applyScale;
    } else {
      applyScale();
    }

    return bmp;
  },

  /**
   * Build and display the selectable owned cards on the board.
   */
  populate() {
    const ui = Game.ui.selectionBoard;
    const owned = Game.player.ownedCards;

    // Determine pagination info
    ui.totalPages = Math.ceil(owned.length / 11);
    ui.remainingCards = owned.length % 11;
    ui.displayedCards = $.extend({}, owned);

    const offset = (ui.page - 1) * 11;
    ui.displayedCards.length =
      ui.page < ui.totalPages ? 11 : ui.remainingCards;

    // Clear previous entries

    if (ui.shownCards) {
      ui.shownCards.removeAllChildren();
    } else {
      ui.shownCards = new createjs.Container();
    }
    // Draw each card entry
    for (let j = 0, i = offset; i < offset + ui.displayedCards.length; i++, j++) {
      const cardData = ui.displayedCards[i];
      if (!cardData) continue;

      // Card name
      const cardName = new createjs.Text(cardData.displayName, "26px Arial", "#ffffff");
      cardName.x = ui.background.x + 50;
      cardName.y = ui.background.y + 35 * j + 60;
      cardName.textBaseline = "alphabetic";

      // Card count
      const cardCount = new createjs.Text(cardData.count, "26px Arial", "#ffffff");
      cardCount.x = ui.background.x + 380;
      cardCount.y = ui.background.y + 35 * j + 60;
      cardCount.textBaseline = "alphabetic";

      // Card icon
      const icon = this._createScaledBitmap(
        "front_end/images/selection_card.png",
        30, // target width
        30, // target height
        (bmp) => Game.stage.update() // update stage when ready
      );
      icon.x = ui.background.x + 15;
      icon.y = ui.background.y + 35 * j + 35;

      ui.shownCards.addChild(cardName, cardCount, icon);
    }

    ui.container.addChild(ui.shownCards);

    // Default selection
    ui.selectedHandCardNumber = 0;
    ui.selectedHandCard = owned[0] || null;

    // Draw large preview
    this.updateDisplay();
  },

  /**
   * Update the large preview card on the right-hand side.
   */
  updateDisplay() {
    const ui = Game.ui.selectionBoard;
    const selectedCard = ui.selectedHandCard;

    if (ui.displayedCard) ui.container.removeChild(ui.displayedCard);

    ui.displayedCard = new createjs.Container();

    const targetW = Game.offsets.cardWidth || Game.offsets.cellWidth - (Game.offsets.cardOffsetX || 3) * 2;
    const targetH = Game.offsets.cardHeight || Game.offsets.cellHeight - (Game.offsets.cardOffsetY || 3) * 2;

    // Card colour
    const colourBmp = this._createScaledBitmap(
      Game.config.cardPath + "blue.png",
      targetW,
      targetH
    );
    ui.displayedCardColour = colourBmp;

    // Card image
    const cardBmp = this._createScaledBitmap(
      selectedCard ? Game.config.cardPath + selectedCard.image + ".png" : "",
      targetW,
      targetH,
      () => Game.stage.update() // update stage after loaded
    );
    ui.displayedCardImage = cardBmp;

    ui.displayedCard.addChild(ui.displayedCardColour, ui.displayedCardImage);
    ui.displayedCard.x = ui.background.x + 440;
    ui.displayedCard.y = ui.background.y + 200;

    ui.container.addChild(ui.displayedCard);

    // Stage update
    Game.stage.update();
  },

  /**
   * Switch between pages of cards.
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    const sb = Game.ui.selectionBoard;

    if (direction === "left" && sb.page > 1) sb.page--;
    else if (direction === "right" && sb.page < sb.totalPages) sb.page++;
    else return;

    sb.selectedHandCardNumber = (sb.page - 1) * 11;
    sb.selectedHandCard = Game.player.ownedCards[sb.selectedHandCardNumber] || null;

    // Populate page
    this.populate();

    // Update page display text
    if (sb.pageDisplay) sb.pageDisplay.text = sb.page;

    // Reset hand cursor to top
    Game.player.playerHandSelectionCursor.y = sb.background.y + 48;

    Game.stage.update();
  },
};
