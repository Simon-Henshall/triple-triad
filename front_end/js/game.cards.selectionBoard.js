// ------------------------------------
// game.cards.selectionBoard.js
// Handles population, pagination, and display of the deck selection screen
// ------------------------------------

Game.cards = Game.cards || {};

Game.cards.selectionBoard = {
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

    // Determine how many cards to show on this page
    if (owned.length >= 11) {
      if (ui.page !== ui.totalPages) {
        ui.displayedCards.length = 11;
      } else {
        if (ui.remainingCards === 0) ui.remainingCards = 11;
        ui.displayedCards.length = ui.remainingCards;
      }
    } else {
      ui.displayedCards.length = owned.length;
    }

    // --- Clear previous entries before redrawing ---
    if (ui.shownCards) {
      ui.shownCards.removeAllChildren();
    } else {
      ui.shownCards = new createjs.Container();
    }

    // --- Draw each card entry ---
    for (
      let j = 0, i = offset;
      i < offset + ui.displayedCards.length;
      i++, j++
    ) {
      const cardData = ui.displayedCards[i];
      if (!cardData) continue;

      // Card name
      const cardName = new createjs.Text(
        cardData.displayName,
        "26px Arial",
        "#ffffff"
      );
      cardName.x = ui.background.x + 50;
      cardName.y = ui.background.y + 35 * j + 60;
      cardName.textBaseline = "alphabetic";

      // Card count
      const cardCount = new createjs.Text(
        cardData.count,
        "26px Arial",
        "#ffffff"
      );
      cardCount.x = ui.background.x + 380;
      cardCount.y = ui.background.y + 35 * j + 60;
      cardCount.textBaseline = "alphabetic";

      // Card image icon (small thumbnail)
      const icon = new createjs.Bitmap("front_end/images/selection_card.png");
      icon.x = ui.background.x + 15;
      icon.y = ui.background.y + 35 * j + 35;

      // Safe scaling for icon
      if (icon.image && icon.image.width) {
        const scale = 30 / icon.image.width;
        icon.scaleX = scale;
        icon.scaleY = scale;
      }

      ui.shownCards.addChild(cardName, cardCount, icon);
    }

    // Attach updated card list to container
    ui.container.addChild(ui.shownCards);

    // --- Default selection ---
    ui.selectedHandCardNumber = 0;
    ui.selectedHandCard = owned[ui.selectedHandCardNumber] || null;

    // --- Draw displayed card preview ---
    this.updateDisplay();

    Game.stage.update();
  },

  /**
   * Update the large preview card on the right-hand side.
   */
  updateDisplay() {
    const ui = Game.ui.selectionBoard;
    const selectedCard = ui.selectedHandCard;

    // Clear previous preview
    if (ui.displayedCard) ui.container.removeChild(ui.displayedCard);

    // Build new preview
    const cardImagePath = selectedCard
      ? Game.config.cardPath + selectedCard.image + ".png"
      : "";
    const cardColourPath = Game.config.cardPath + "blue.png";

    ui.displayedCardImage = new createjs.Bitmap(cardImagePath);
    ui.displayedCardColour = new createjs.Bitmap(cardColourPath);
    ui.displayedCard = new createjs.Container();
    ui.displayedCard.addChild(ui.displayedCardColour, ui.displayedCardImage);
    ui.displayedCard.x = ui.background.x + 440;
    ui.displayedCard.y = ui.background.y + 200;

    // Scale safely
    const baseImage = ui.displayedCard.children[0]?.image;
    if (baseImage && baseImage.width) {
      const targetW =
        Game.offsets.cardWidth ||
        Game.offsets.cellWidth - (Game.offsets.cardOffsetX || 3) * 2;
      const targetH =
        Game.offsets.cardHeight ||
        Game.offsets.cellHeight - (Game.offsets.cardOffsetY || 3) * 2;

      ui.displayedCard.scaleX = targetW / baseImage.width;
      ui.displayedCard.scaleY = targetH / baseImage.height;
    }

    ui.container.addChild(ui.displayedCard);
  },

  /**
   * Switch between pages of cards.
   * @param {"left"|"right"} direction
   */
  paginate(direction) {
    const sb = Game.ui.selectionBoard;

    if (direction === "left" && sb.page > 1) {
      sb.page--;
    } else if (direction === "right" && sb.page < sb.totalPages) {
      sb.page++;
    } else {
      return; // nothing to do
    }

    // Reset the selected card to the top of the new page
    sb.selectedHandCardNumber = (sb.page - 1) * 11;
    sb.selectedHandCard =
      Game.player.ownedCards[sb.selectedHandCardNumber] || null;

    // Update the displayed cards
    Game.cards.selectionBoard.populate();

    // Update the page number text
    if (sb.pageDisplay) {
      sb.pageDisplay.text = sb.page;
    }

    // Optionally, also move the hand cursor to the top row
    Game.player.playerHandSelectionCursor.y = sb.background.y + 48;

    Game.stage.update();
  },
};
