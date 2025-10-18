// -----------------------------
// populateSelectionBoardCards - draw the selectable owned cards
// -----------------------------
function populateSelectionBoardCards() {
  // Determine paging and which cards to display
  Game.ui.totalPages = Math.floor(window.ownedCards.length / 11) + 1;
  remainingCards = Object.keys(window.ownedCards).length % 11;
  Game.ui.displayedCards = $.extend({}, window.ownedCards);
  var offset = (Game.ui.page - 1) * 11;

  // Determine Game.ui.displayedCards length exactly like original
  if (window.ownedCards.length >= 11) {
    if (Game.ui.page != Game.ui.totalPages) {
      Game.ui.displayedCards.length = 11;
    } else if (Game.ui.page == Game.ui.totalPages) {
      // Safeguard for having a count perfectly divisble by 11
      if (remainingCards == 0) {
        remainingCards = 11;
      }
      Game.ui.displayedCards.length = remainingCards;
    }
  } else {
    Game.ui.displayedCards.length = Object.keys(window.ownedCards).length;
  }

  // Draw the data entries onto Game.ui.shownCards (createjs.Text and bitmaps)
  var j = 0;
  for (var i = offset; i < offset + Game.ui.displayedCards.length; i++) {
    Game.ui.cardName = new createjs.Text(
      Game.ui.displayedCards[i].displayName,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardName.x = selectionBoardBackground.x + 50;
    Game.ui.cardName.y = selectionBoardBackground.y + 35 * j + 60;
    Game.ui.cardName.textBaseline = "alphabetic";

    Game.ui.cardCount = new createjs.Text(
      Game.ui.displayedCards[i].count,
      "26px Arial",
      "#ffffff"
    );
    Game.ui.cardCount.x = selectionBoardBackground.x + 380;
    Game.ui.cardCount.y = selectionBoardBackground.y + 35 * j + 60;
    Game.ui.cardCount.textBaseline = "alphabetic";

    // Guard THAT BREAKS THE UI
    //Game.ui.shownCards = Game.ui.shownCards || new createjs.Container();
    //Game.ui.shownCards.removeAllChildren(); // Clear previous entries

    Game.ui.shownCards.addChild(Game.ui.cardName, Game.ui.cardCount);

    // Small image icon for the row
    var selectionBoardCardImage = new createjs.Bitmap(
      "front_end/images/selection_card.png"
    );
    selectionBoardCardImage.x = selectionBoardBackground.x + 15;
    selectionBoardCardImage.y = selectionBoardBackground.y + 35 * j + 35;

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
  selectedHandCardNumber = 0;
  selectedHandCard = window.ownedCards[selectedHandCardNumber] || null;

  // Draw the displayed card on the right of the selection board
  Game.ui.displayedCardImage = new createjs.Bitmap(
    selectedHandCard ? Game.config.cardPath + selectedHandCard.image + ".png" : ""
  );
  Game.ui.displayedCardColour = new createjs.Bitmap(Game.config.cardPath + "blue.png");
  Game.ui.displayedCard = new createjs.Container();
  Game.ui.displayedCard.addChild(Game.ui.displayedCardColour, Game.ui.displayedCardImage);
  Game.ui.displayedCard.x = selectionBoardBackground.x + 440;
  Game.ui.displayedCard.y = selectionBoardBackground.y + 200;

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
