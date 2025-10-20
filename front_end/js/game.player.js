/**
 * @namespace Game.player
 * @description Contains all player-related data, logic, and card handling.
 */
Game.player = {
  /** @type {number} Horizontal offset for player hand rendering */
  handOffsetX: 0,

  /** @type {Array<Object>} All cards in the game owned by player */
  playerCards: [],

  /** @type {Array<Object>} All owned cards */
  ownedCards: [],

  /** @type {Array<createjs.Container>} Cards currently in player's hand (displayed on stage) */
  cardsInPlayerHand: [],

  /** @type {Array<Object>} Current randomised hand */
  playerHand: [],

  /** @type {number} Number of cards above current selection */
  cardsAboveSelection: 0,

  /** @type {number} Total cards held by player */
  playerCardCount: 0,

  /** @type {number} Number of cards played by player */
  playedPlayerCardCount: 0,

  /** @type {number} Total blue cards (score) */
  totalBlueCards: 5,

  /** @type {createjs.Bitmap|null} Player hand cursor */
  playerHandCursor: null,

  /** @type {createjs.Bitmap|null} Player hand selection cursor */
  playerHandSelectionCursor: null,

  /**
   * Populate the player's hand with cards.
   * Currently selects a randomised hand of up to 5 cards.
   * @param {Array<Object>} playerCardsParam - Array of cards available to the player.
   */
  populatePlayerCards(playerCardsParam) {
    // Calculate the current player turn
    Game.utils.togglePlayerTurn();

    // Shuffle and copy hand
    this.playerHand = Game.utils.shuffle([...playerCardsParam]).slice(0, 5);

    for (let i = 0; i < this.playerHand.length; i++) {
      const chosenCard = this.playerHand[i];

      // Transparent card data
      Game.ui.cardImage = new createjs.Bitmap(
        `${Game.config.cardPath}${chosenCard.image}.png`
      );

      // Card Background Colour
      const cardColour = new createjs.Bitmap(
        `${Game.config.cardPath}${Game.utils.getPlayerTurn()}.png`
      );

      // Card Container
      Game.ui.card = new createjs.Container();
      Game.ui.card.addChild(cardColour, Game.ui.cardImage);

      // Adjust the card for the board
      Game.ui.card.scaleX = Game.offsets.cardWidth / Game.ui.card.children[0].image.width;
      Game.ui.card.scaleY = Game.offsets.cardHeight / Game.ui.card.children[0].image.height;

      // Assign stats
      Game.ui.card.name = chosenCard.displayName;
      Game.ui.card.strengthUp = chosenCard.strengthUp;
      Game.ui.card.strengthRight = chosenCard.strengthRight;
      Game.ui.card.strengthDown = chosenCard.strengthDown;
      Game.ui.card.strengthLeft = chosenCard.strengthLeft;
      Game.ui.card.element = chosenCard.element;
      Game.ui.card.owner = Game.ui.card.background = Game.utils.getPlayerTurn();

      // Place the card
      Game.ui.card.x = this.handOffsetX;
      Game.ui.card.y = Game.offsets.handOffsetY + i * Game.offsets.handCardOffset;

      this.cardsInPlayerHand.push(Game.ui.card);
      Game.stage.addChild(Game.ui.card);
      Game.stage.update();
    }

    // Select the top card by default
    Game.ui.selectedCard = this.cardsInPlayerHand[Game.ui.selectedCardNumber];
    Game.ui.previouslySelectedCard = [];

    // Indent the chosen card
    this.indentSelectedCard();

    // Ready for the player to choose which card to play
    Game.ui.playerConfirming = false;
    Game.ui.playerChoosingCard = true;
  },

  /**
   * Indent the selected card to visually indicate selection.
   */
  indentSelectedCard() {
    if (Game.utils.getPlayerTurn() === "red") {
      if (Game.ui.selectedCard && typeof Game.ui.selectedCard.x !== "undefined") {
        Game.ui.selectedCard.x += 30;
      }
      if (Game.ui.previouslySelectedCard && typeof Game.ui.previouslySelectedCard.x !== "undefined") {
        Game.ui.previouslySelectedCard.x -= 30;
      }
    } else if (Game.utils.getPlayerTurn() === "blue") {
      if (Game.ui.selectedCard && typeof Game.ui.selectedCard.x !== "undefined") {
        Game.ui.selectedCard.x -= 30;
      }
      if (Game.ui.previouslySelectedCard && typeof Game.ui.previouslySelectedCard.x !== "undefined") {
        Game.ui.previouslySelectedCard.x += 30;
      }
    }
    Game.stage.update();
  }
};

/**
 * Class handling selection board card display and updates
 */
Game.player.CardManager = class {
  /**
   * Update the hand cards shown on the selection board.
   */
  updateHandCards() {
    const offset = (Game.ui.selectionBoard.page - 1) * 11;

    if (Game.player.ownedCards.length >= 11) {
      if (Game.ui.selectionBoard.page !== Game.ui.selectionBoard.totalPages) {
        Game.ui.selectionBoard.displayedCards.length = 11;
      } else {
        Game.ui.selectionBoard.displayedCards.length = Game.ui.selectionBoard.remainingCards;
      }
    } else {
      Game.ui.selectionBoard.displayedCards.length = Object.keys(Game.player.ownedCards).length;
    }

    // Update card colors
    if (Game.ui.selectionBoard.displayedCards[Game.ui.selectionBoard.selectedHandCardNumber].count === 0) {
      Game.ui.selectionBoard.displayedCards[Game.ui.selectionBoard.selectedHandCardNumber].colour = "#909497";
    }

    if (Game.player.playerCards.length > 0) {
      const lastCard = Game.player.playerCards[Game.player.playerCards.length - 1];
      if (lastCard.count > 0) {
        lastCard.colour = "#ffffff";
      }
    }

    // Display card text/icons
    let j = 0;
    let k = 1;
    let l = 2;

    for (let i = 0; i < Game.ui.selectionBoard.displayedCards.length; i++) {
      if (Game.ui.selectionBoard.shownCards.children[j]) {
        Game.ui.selectionBoard.shownCards.children[j].text = Game.player.ownedCards[i + offset].displayName;
        Game.ui.selectionBoard.shownCards.children[j].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.selectionBoard.shownCards.children[j].visible = true;
      }
      if (Game.ui.selectionBoard.shownCards.children[k]) {
        Game.ui.selectionBoard.shownCards.children[k].text = Game.player.ownedCards[i + offset].count;
        Game.ui.selectionBoard.shownCards.children[k].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.selectionBoard.shownCards.children[k].visible = true;
      }
      if (Game.ui.selectionBoard.shownCards.children[l]) {
        Game.ui.selectionBoard.shownCards.children[l].visible = true;
      }
      j += 3;
      k += 3;
      l += 3;
    }

    // Hide excess lines
    for (let m = Game.ui.selectionBoard.displayedCards.length * 3; m < 31; m++) {
      if (Game.ui.selectionBoard.shownCards.children[j]) {
        Game.ui.selectionBoard.shownCards.children[j].text = "";
      }
      if (Game.ui.selectionBoard.shownCards.children[k]) {
        Game.ui.selectionBoard.shownCards.children[k].text = "";
      }
      if (Game.ui.selectionBoard.shownCards.children[l]) {
        Game.ui.selectionBoard.shownCards.children[l].visible = false;
      }
      j++;
      k++;
      l++;
    }

    if (Game.ui.selectionBoard.pageDisplay) {
      Game.ui.selectionBoard.pageDisplay.text = Game.ui.selectionBoard.page;
    }
  }

  /**
   * Update the preview image for the currently selected card.
   */
  updateDisplayedCard() {
    if (!Game.ui.selectionBoard.displayedCard) {
      return;
    }

    Game.ui.selectionBoard.displayedCard.y = 700;

    if (Game.ui.selectionBoard.displayedCard.children && Game.ui.selectionBoard.displayedCard.children[1] &&
        Game.ui.selectionBoard.displayedCard.children[1].image && Game.ui.selectionBoard.selectedHandCard) {
      Game.ui.selectionBoard.displayedCard.children[1].image.src =
        Game.config.cardPath + Game.ui.selectionBoard.selectedHandCard.image + ".png";
    }

    createjs.Tween.get(Game.ui.selectionBoard.displayedCard).to(
      {
        x: Game.ui.selectionBoard.displayedCard.x,
        y: Game.ui.selectionBoard.background.y + 200
      },
      100
    );
  }
};

// Create single instance of card manager
Game.player.cardManagerInstance = new Game.player.CardManager();

Game.cards = Game.cards || {};

Game.cards.playerHand = {
  /**
   * Helper: create a bitmap and scale once loaded.
   */
  _createScaledBitmap(src, targetW, targetH, onReady) {
    const bmp = new createjs.Bitmap(src);
    const applyScale = () => {
      bmp.scaleX = targetW / bmp.image.width;
      bmp.scaleY = targetH / bmp.image.height;
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
   * Populate the player's hand with cards.
   * @param {Array<Object>} playerCardsParam - Array of player-owned cards.
   */
  populate(playerCardsParam) {
    // Toggle player turn
    Game.utils.togglePlayerTurn();

    // Random hand of up to 5 cards
    const hand = Game.utils.shuffle([...playerCardsParam]).slice(0, 5);
    Game.player.cardsInPlayerHand = [];

    hand.forEach((chosenCard, i) => {
      const offsets = Game.offsets;
      const targetW = offsets.cardWidth || offsets.cellWidth - (offsets.cardOffsetX || 3) * 2;
      const targetH = offsets.cardHeight || offsets.cellHeight - (offsets.cardOffsetY || 3) * 2;

      // Card images
      const cardImage = this._createScaledBitmap(
        `${Game.config.cardPath}${chosenCard.image}.png`,
        targetW,
        targetH,
        () => Game.stage.update()
      );
      const cardColour = this._createScaledBitmap(
        `${Game.config.cardPath}${Game.utils.getPlayerTurn()}.png`,
        targetW,
        targetH,
        () => Game.stage.update()
      );

      // Card container
      const cardContainer = new createjs.Container();
      cardContainer.addChild(cardColour, cardImage);

      // Card stats
      cardContainer.name = chosenCard.displayName;
      cardContainer.strengthUp = chosenCard.strengthUp;
      cardContainer.strengthRight = chosenCard.strengthRight;
      cardContainer.strengthDown = chosenCard.strengthDown;
      cardContainer.strengthLeft = chosenCard.strengthLeft;
      cardContainer.element = chosenCard.element;
      cardContainer.owner = Game.utils.getPlayerTurn();
      cardContainer.background = Game.utils.getPlayerTurn();

      // Position in hand
      cardContainer.x = Game.player.handOffsetX;
      cardContainer.y = offsets.handOffsetY + i * (offsets.handCardOffset || 95);

      Game.player.cardsInPlayerHand.push(cardContainer);
      Game.stage.addChild(cardContainer);
    });

    // Default selection
    Game.ui.selectedCard = Game.player.cardsInPlayerHand[0];
    Game.ui.previouslySelectedCard = [];

    // Indent chosen card
    Game.player.indentSelectedCard();

    // Ready for player to choose
    Game.ui.playerConfirming = false;
    Game.ui.playerChoosingCard = true;

    Game.stage.update();
  },
};
