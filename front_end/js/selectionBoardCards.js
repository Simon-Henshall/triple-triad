// -----------------------------
// populateSelectionBoardCards - draw the selectable owned cards
// -----------------------------
function populateSelectionBoardCards() {
  // Determine paging and which cards to display
  Game.ui.totalPages = Math.floor(Game.player.ownedCards.length / 11) + 1;
  Game.ui.remainingCards = Object.keys(Game.player.ownedCards).length % 11;
  Game.ui.displayedCards = $.extend({}, Game.player.ownedCards);
  var offset = (Game.ui.page - 1) * 11;

  // Determine Game.ui.displayedCards length exactly like original
  if (Game.player.ownedCards.length >= 11) {
    if (Game.ui.page != Game.ui.totalPages) {
      Game.ui.displayedCards.length = 11;
    } else if (Game.ui.page == Game.ui.totalPages) {
      // Safeguard for having a count perfectly divisble by 11
      if (Game.ui.remainingCards == 0) {
        Game.ui.remainingCards = 11;
      }
      Game.ui.displayedCards.length = Game.ui.remainingCards;
    }
  } else {
    Game.ui.displayedCards.length = Object.keys(Game.player.ownedCards).length;
  }

  // Draw the data entries onto Game.ui.shownCards (createjs.Text and bitmaps)
  var j = 0;
  for (var i = offset; i < offset + Game.ui.displayedCards.length; i++) {
    Game.ui.cardName = new createjs.Text(
      Game.ui.displayedCards[i].displayName,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardName.x = Game.ui.selectionBoardBackground.x + 50;
    Game.ui.cardName.y = Game.ui.selectionBoardBackground.y + 35 * j + 60;
    Game.ui.cardName.textBaseline = "alphabetic";

    Game.ui.cardCount = new createjs.Text(
      Game.ui.displayedCards[i].count,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardCount.x = Game.ui.selectionBoardBackground.x + 380;
    Game.ui.cardCount.y = Game.ui.selectionBoardBackground.y + 35 * j + 60;
    Game.ui.cardCount.textBaseline = "alphabetic";

    // Guard THAT BREAKS THE UI
    //Game.ui.shownCards = Game.ui.shownCards || new createjs.Container();
    //Game.ui.shownCards.removeAllChildren(); // Clear previous entries

    Game.ui.shownCards.addChild(Game.ui.cardName, Game.ui.cardCount);

    // Small image icon for the row
    var selectionBoardCardImage = new createjs.Bitmap(
      "front_end/images/selection_card.png"
    );
    selectionBoardCardImage.x = Game.ui.selectionBoardBackground.x + 15;
    selectionBoardCardImage.y = Game.ui.selectionBoardBackground.y + 35 * j + 35;

    // Protect scale calculation if image not loaded yet
    if (selectionBoardCardImage.image && selectionBoardCardImage.image.width) {
      selectionBoardCardImage.scaleX = 30 / selectionBoardCardImage.image.width;
      selectionBoardCardImage.scaleY =
        30 / selectionBoardCardImage.image.height;
    }

    Game.ui.shownCards.addChild(selectionBoardCardImage);
    j++;
  }

  Game.ui.selectionBoard.addChild(Game.ui.shownCards);

  // Select the top card by default
  Game.ui.selectedHandCardNumber = 0;
  Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber] || null;

  // Draw the displayed card on the right of the selection board
  Game.ui.displayedCardImage = new createjs.Bitmap(
    Game.ui.selectedHandCard ? Game.config.cardPath + Game.ui.selectedHandCard.image + ".png" : ""
  );
  Game.ui.displayedCardColour = new createjs.Bitmap(Game.config.cardPath + "blue.png");
  Game.ui.displayedCard = new createjs.Container();
  Game.ui.displayedCard.addChild(Game.ui.displayedCardColour, Game.ui.displayedCardImage);
  Game.ui.displayedCard.x = Game.ui.selectionBoardBackground.x + 440;
  Game.ui.displayedCard.y = Game.ui.selectionBoardBackground.y + 200;

  // Scale accordingly (guard for missing image size)
  if (
    Game.ui.displayedCard.children[0] &&
    Game.ui.displayedCard.children[0].image &&
    Game.ui.displayedCard.children[0].image.width
  ) {
    Game.ui.displayedCard.scaleX =
      (Game.offsets.cardWidth || Game.offsets.cellWidth - (Game.offsets.cardOffsetX || 3) * 2) /
      Game.ui.displayedCard.children[0].image.width;
    Game.ui.displayedCard.scaleY =
      (Game.offsets.cardHeight || Game.offsets.cellHeight - (wGame.offsets.cardOffsetY || 3) * 2) /
      Game.ui.displayedCard.children[0].image.height;
  }

  Game.ui.selectionBoard.addChild(Game.ui.displayedCard);
}
