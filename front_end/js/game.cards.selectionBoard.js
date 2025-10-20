// -----------------------------
// populateSelectionBoardCards - draw the selectable owned cards
// -----------------------------
function populateSelectionBoardCards() {
  // Determine paging and which cards to display
  Game.ui.selectionBoard.totalPages = Math.floor(Game.player.ownedCards.length / 11) + 1;
  Game.ui.selectionBoard.remainingCards = Object.keys(Game.player.ownedCards).length % 11;
  Game.ui.selectionBoard.displayedCards = $.extend({}, Game.player.ownedCards);
  var offset = (Game.ui.selectionBoard.page - 1) * 11;

  // Determine Game.ui.selectionBoard.displayedCards length exactly like original
  if (Game.player.ownedCards.length >= 11) {
    if (Game.ui.selectionBoard.page != Game.ui.selectionBoard.totalPages) {
      Game.ui.selectionBoard.displayedCards.length = 11;
    } else if (Game.ui.selectionBoard.page == Game.ui.selectionBoard.totalPages) {
      // Safeguard for having a count perfectly divisble by 11
      if (Game.ui.selectionBoard.remainingCards == 0) {
        Game.ui.selectionBoard.remainingCards = 11;
      }
      Game.ui.selectionBoard.displayedCards.length = Game.ui.selectionBoard.remainingCards;
    }
  } else {
    Game.ui.selectionBoard.displayedCards.length = Object.keys(Game.player.ownedCards).length;
  }

  // Draw the data entries onto Game.ui.selectionBoard.shownCards (createjs.Text and bitmaps)
  var j = 0;
  for (var i = offset; i < offset + Game.ui.selectionBoard.displayedCards.length; i++) {
    Game.ui.cardName = new createjs.Text(
      Game.ui.selectionBoard.displayedCards[i].displayName,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardName.x = Game.ui.selectionBoard.background.x + 50;
    Game.ui.cardName.y = Game.ui.selectionBoard.background.y + 35 * j + 60;
    Game.ui.cardName.textBaseline = "alphabetic";

    Game.ui.cardCount = new createjs.Text(
      Game.ui.selectionBoard.displayedCards[i].count,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardCount.x = Game.ui.selectionBoard.background.x + 380;
    Game.ui.cardCount.y = Game.ui.selectionBoard.background.y + 35 * j + 60;
    Game.ui.cardCount.textBaseline = "alphabetic";

    // Guard THAT BREAKS THE UI
    //Game.ui.selectionBoard.shownCards = Game.ui.selectionBoard.shownCards || new createjs.Container();
    //Game.ui.selectionBoard.shownCards.removeAllChildren(); // Clear previous entries

    Game.ui.selectionBoard.shownCards.addChild(Game.ui.cardName, Game.ui.cardCount);

    // Small image icon for the row
    var selectionBoardCardImage = new createjs.Bitmap(
      "front_end/images/selection_card.png"
    );
    selectionBoardCardImage.x = Game.ui.selectionBoard.background.x + 15;
    selectionBoardCardImage.y = Game.ui.selectionBoard.background.y + 35 * j + 35;

    // Protect scale calculation if image not loaded yet
    if (selectionBoardCardImage.image && selectionBoardCardImage.image.width) {
      selectionBoardCardImage.scaleX = 30 / selectionBoardCardImage.image.width;
      selectionBoardCardImage.scaleY =
        30 / selectionBoardCardImage.image.height;
    }

    Game.ui.selectionBoard.shownCards.addChild(selectionBoardCardImage);
    j++;
  }

  Game.ui.selectionBoard.container.addChild(Game.ui.selectionBoard.shownCards);

  // Select the top card by default
  Game.ui.selectionBoard.selectedHandCardNumber = 0;
  Game.ui.selectionBoard.selectedHandCard = Game.player.ownedCards[Game.ui.selectionBoard.selectedHandCardNumber] || null;

  // Draw the displayed card on the right of the selection board
  Game.ui.selectionBoard.displayedCardImage = new createjs.Bitmap(
    Game.ui.selectionBoard.selectedHandCard ? Game.config.cardPath + Game.ui.selectionBoard.selectedHandCard.image + ".png" : ""
  );
  Game.ui.selectionBoard.displayedCardColour = new createjs.Bitmap(Game.config.cardPath + "blue.png");
  Game.ui.selectionBoard.displayedCard = new createjs.Container();
  Game.ui.selectionBoard.displayedCard.addChild(Game.ui.selectionBoard.displayedCardColour, Game.ui.selectionBoard.displayedCardImage);
  Game.ui.selectionBoard.displayedCard.x = Game.ui.selectionBoard.background.x + 440;
  Game.ui.selectionBoard.displayedCard.y = Game.ui.selectionBoard.background.y + 200;

  // Scale accordingly (guard for missing image size)
  if (
    Game.ui.selectionBoard.displayedCard.children[0] &&
    Game.ui.selectionBoard.displayedCard.children[0].image &&
    Game.ui.selectionBoard.displayedCard.children[0].image.width
  ) {
    Game.ui.selectionBoard.displayedCard.scaleX =
      (Game.offsets.cardWidth || Game.offsets.cellWidth - (Game.offsets.cardOffsetX || 3) * 2) /
      Game.ui.selectionBoard.displayedCard.children[0].image.width;
    Game.ui.selectionBoard.displayedCard.scaleY =
      (Game.offsets.cardHeight || Game.offsets.cellHeight - (wGame.offsets.cardOffsetY || 3) * 2) /
      Game.ui.selectionBoard.displayedCard.children[0].image.height;
  }

  Game.ui.selectionBoard.container.addChild(Game.ui.selectionBoard.displayedCard);
}
