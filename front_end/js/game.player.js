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
    const offset = (Game.ui.page - 1) * 11;

    if (Game.player.ownedCards.length >= 11) {
      if (Game.ui.page !== Game.ui.totalPages) {
        Game.ui.displayedCards.length = 11;
      } else {
        Game.ui.displayedCards.length = Game.ui.remainingCards;
      }
    } else {
      Game.ui.displayedCards.length = Object.keys(Game.player.ownedCards).length;
    }

    // Update card colors
    if (Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count === 0) {
      Game.ui.displayedCards[Game.ui.selectedHandCardNumber].colour = "#909497";
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

    for (let i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[j]) {
        Game.ui.shownCards.children[j].text = Game.player.ownedCards[i + offset].displayName;
        Game.ui.shownCards.children[j].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[j].visible = true;
      }
      if (Game.ui.shownCards.children[k]) {
        Game.ui.shownCards.children[k].text = Game.player.ownedCards[i + offset].count;
        Game.ui.shownCards.children[k].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[k].visible = true;
      }
      if (Game.ui.shownCards.children[l]) {
        Game.ui.shownCards.children[l].visible = true;
      }
      j += 3;
      k += 3;
      l += 3;
    }

    // Hide excess lines
    for (let m = Game.ui.displayedCards.length * 3; m < 31; m++) {
      if (Game.ui.shownCards.children[j]) {
        Game.ui.shownCards.children[j].text = "";
      }
      if (Game.ui.shownCards.children[k]) {
        Game.ui.shownCards.children[k].text = "";
      }
      if (Game.ui.shownCards.children[l]) {
        Game.ui.shownCards.children[l].visible = false;
      }
      j++;
      k++;
      l++;
    }

    if (Game.ui.pageDisplay) {
      Game.ui.pageDisplay.text = Game.ui.page;
    }
  }

  /**
   * Update the preview image for the currently selected card.
   */
  updateDisplayedCard() {
    if (!Game.ui.displayedCard) {
      return;
    }

    Game.ui.displayedCard.y = 700;

    if (Game.ui.displayedCard.children && Game.ui.displayedCard.children[1] &&
        Game.ui.displayedCard.children[1].image && Game.ui.selectedHandCard) {
      Game.ui.displayedCard.children[1].image.src =
        Game.config.cardPath + Game.ui.selectedHandCard.image + ".png";
    }

    createjs.Tween.get(Game.ui.displayedCard).to(
      {
        x: Game.ui.displayedCard.x,
        y: Game.ui.selectionBoardBackground.y + 200
      },
      100
    );
  }
};

// Create single instance of card manager
Game.player.cardManagerInstance = new Game.player.CardManager();
