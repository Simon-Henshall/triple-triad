// -----------------------------
// populateSelectionBoardCards - draw the selectable owned cards
// -----------------------------
function populateSelectionBoardCards() {
  // Determine paging and which cards to display
  totalPages = Math.floor(window.ownedCards.length / 11) + 1;
  remainingCards = Object.keys(window.ownedCards).length % 11;
  displayedCards = $.extend({}, window.ownedCards);
  var offset = (page - 1) * 11;

  // Determine displayedCards length exactly like original
  if (window.ownedCards.length >= 11) {
    if (page != totalPages) {
      displayedCards.length = 11;
    } else if (page == totalPages) {
      displayedCards.length = remainingCards;
    }
  } else {
    displayedCards.length = Object.keys(window.ownedCards).length;
  }

  // Draw the data entries onto shownCards (createjs.Text and bitmaps)
  var j = 0;
  for (var i = offset; i < offset + displayedCards.length; i++) {
    var cardName = new createjs.Text(
      displayedCards[i].displayName,
      "26px Arial",
      "#ffffff"
    );
    cardName.x = selectionBoardBackground.x + 50;
    cardName.y = selectionBoardBackground.y + 35 * j + 60;
    cardName.textBaseline = "alphabetic";

    var cardCount = new createjs.Text(
      displayedCards[i].count,
      "26px Arial",
      "#ffffff"
    );
    cardCount.x = selectionBoardBackground.x + 380;
    cardCount.y = selectionBoardBackground.y + 35 * j + 60;
    cardCount.textBaseline = "alphabetic";

    shownCards.addChild(cardName, cardCount);

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

    shownCards.addChild(selectionBoardCardImage);
    j++;
  }

  selectionBoard.addChild(shownCards);

  // Select the top card by default
  selectedHandCardNumber = 0;
  selectedHandCard = window.ownedCards[selectedHandCardNumber];

  // Draw the displayed card on the right of the selection board
  displayedCardImage = new createjs.Bitmap(
    Game.config.cardPath + selectedHandCard.image + ".png"
  );
  displayedCardColour = new createjs.Bitmap(Game.config.cardPath + "blue.png");
  displayedCard = new createjs.Container();
  displayedCard.addChild(displayedCardColour, displayedCardImage);
  displayedCard.x = selectionBoardBackground.x + 440;
  displayedCard.y = selectionBoardBackground.y + 200;

  // Scale accordingly (guard for missing image size)
  if (
    displayedCard.children[0] &&
    displayedCard.children[0].image &&
    displayedCard.children[0].image.width
  ) {
    displayedCard.scaleX =
      (window.cardWidth || window.cellWidth - (window.cardOffsetX || 3) * 2) /
      displayedCard.children[0].image.width;
    displayedCard.scaleY =
      (window.cardHeight || window.cellHeight - (window.cardOffsetY || 3) * 2) /
      displayedCard.children[0].image.height;
  }

  selectionBoard.addChild(displayedCard);
}
