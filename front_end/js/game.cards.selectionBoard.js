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
   * Build and display the selectable owned cards on the selection board.
   */
  populate() {
    const sb = Game.ui.selectionBoard;
    const owned = Game.player.ownedCards || [];
    const cardsPerPage = 11;

    sb.totalPages = Math.max(1, Math.ceil(owned.length / cardsPerPage));
    sb.page = sb.page || 1;
    const pageStart = (sb.page - 1) * cardsPerPage;
    sb.pageStart = pageStart; // absolute index of the first item on this page

    // displayedCards is a proper array slice of owned
    sb.displayedCards = owned.slice(pageStart, pageStart + cardsPerPage);
    sb.remainingCards = sb.displayedCards.length;

    // prepare shownCards container
    if (!sb.shownCards) sb.shownCards = new createjs.Container();
    else sb.shownCards.removeAllChildren();

    // draw rows for displayedCards
    sb.displayedCards.forEach((cardData, rowIndex) => {
      // name
      const nameText = new createjs.Text(
        cardData.displayName,
        "26px Arial",
        "#ffffff"
      );
      nameText.x = sb.background.x + 50;
      nameText.y = sb.background.y + 35 * rowIndex + 60;
      nameText.textBaseline = "alphabetic";

      // count
      const countText = new createjs.Text(
        String(cardData.count),
        "26px Arial",
        "#ffffff"
      );
      countText.x = sb.background.x + 380;
      countText.y = sb.background.y + 35 * rowIndex + 60;
      countText.textBaseline = "alphabetic";

      // icon
      const icon = this._createScaledBitmap(
        "front_end/images/selection_card.png",
        30, // target width
        30, // target height
        (bmp) => Game.stage.update() // update stage when ready
      );
      icon.x = sb.background.x + 15;
      icon.y = sb.background.y + 35 * rowIndex + 35;

      // Correct scaling: maintain 30px width, proportional height
      if (icon.image && icon.image.width && icon.image.height) {
        const targetSize = 30;
        const scaleX = targetSize / icon.image.width;
        const scaleY = targetSize / icon.image.height;
        icon.scaleX = scaleX;
        icon.scaleY = scaleY;
      }

      sb.shownCards.addChild(nameText, countText, icon);
    });

    // attach to container (remove previous if present)
    if (sb.container && sb.container.parent == null) {
      sb.container.addChild(sb.shownCards);
    } else {
      // ensure it's present: remove prior and re-add to avoid duplicates
      if (sb.container) {
        try {
          sb.container.removeChild(sb.shownCards);
        } catch (e) {}
        sb.container.addChild(sb.shownCards);
      }
    }

    // default selection: if selectedHandCardNumber is outside this page, clamp to pageStart
    if (
      typeof sb.selectedHandCardNumber !== "number" ||
      sb.selectedHandCardNumber < pageStart ||
      sb.selectedHandCardNumber >= pageStart + sb.displayedCards.length
    ) {
      sb.selectedHandCardNumber = pageStart;
    }

    sb.selectedHandCard =
      Game.player.ownedCards[sb.selectedHandCardNumber] || null;

    // Update the large preview display
    this.updateDisplay();

    // update page display text if present
    if (sb.pageDisplay) sb.pageDisplay.text = sb.page;

    Game.stage.update();
  },

  /**
   * Update the large preview card on the right-hand side.
   */
  updateDisplay() {
    const ui = Game.ui.selectionBoard;
    const selectedCard = ui.selectedHandCard;

    if (ui.displayedCard) ui.container.removeChild(ui.displayedCard);

    ui.displayedCard = new createjs.Container();

    const targetW =
      Game.offsets.cardWidth ||
      Game.offsets.cellWidth - (Game.offsets.cardOffsetX || 3) * 2;
    const targetH =
      Game.offsets.cardHeight ||
      Game.offsets.cellHeight - (Game.offsets.cardOffsetY || 3) * 2;

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
    const cardsPerPage = 11;

    if (direction === "left" && sb.page > 1) {
      sb.page--;
    } else if (direction === "right" && sb.page < sb.totalPages) {
      sb.page++;
    } else {
      return;
    }

    // set pageStart and clamp the absolute selected index to the new page start
    const pageStart = (sb.page - 1) * cardsPerPage;
    sb.pageStart = pageStart;
    // move selection to top of this new page (absolute index)
    sb.selectedHandCardNumber = pageStart;
    sb.selectedHandCard =
      Game.player.ownedCards[sb.selectedHandCardNumber] || null;

    // repopulate UI rows & preview
    this.populate();

    // move cursor visual to top row
    if (Game.player.playerHandSelectionCursor && sb.background) {
      Game.player.playerHandSelectionCursor.y = sb.background.y + 48;
    }

    if (sb.pageDisplay) sb.pageDisplay.text = sb.page;
    Game.stage.update();
  },
};
