// -----------------------------
// PlayerCardManager
// -----------------------------
class PlayerCardManager {
  ajaxCall(whenDone) {
    var ownedCardsJSON;
    $.ajax({
      url: "back_end/includes/get_player_cards.php",
      async: "false",
      cache: "false",
      type: "GET",
      success: function (response) {
        ownedCardsJSON = response;
        whenDone(ownedCardsJSON);
      },
      error: function (jqXHR, exception) {
        if (jqXHR.status === 0) {
          alert("Not connect.\n Verify Network.");
        } else if (jqXHR.status == 404) {
          alert("Requested page not found. [404]");
        } else if (jqXHR.status == 500) {
          alert("Internal Server Error [500].");
        } else if (exception === "parsererror") {
          alert("Requested JSON parse failed.");
        } else if (exception === "timeout") {
          alert("Time out error.");
        } else if (exception === "abort") {
          alert("Ajax request aborted.");
        } else {
          alert("Uncaught Error.\n" + jqXHR.responseText);
        }
      },
    });
  }

  pickPlayerCards(ownedCardsJSON) {
    window.ownedCards = [];
    Game.ui.page = 1;
    selectedHandCardNumber = 0;
    Game.ui.displayedCards = [];
    Game.ui.displayedCard = null;
    const fallBackCardsForTesting =
      '[{"card": 1, "image": "card0", "count": 6}, {"card": 2, "image": "card1", "count": 4}, {"card": 3, "image": "card2", "count": 8}, {"card": 4, "image": "card3", "count": 2}, {"card": 5, "image": "card4", "count": 4}, {"card": 6, "image": "card5", "count": 4}, {"card": 7, "image": "card6", "count": 7}, {"card": 8, "image": "card7", "count": 4}, {"card": 9, "image": "card8", "count": 4}, {"card": 10, "image": "card9", "count": 7}, {"card": 11, "image": "card10", "count": 2}, {"card": 12, "image": "card11", "count": 4}, {"card": 13, "image": "card12", "count": 9}, {"card": 14, "image": "card13", "count": 8}, {"card": 15, "image": "card14", "count": 1}, {"card": 16, "image": "card15", "count": 3}, {"card": 17, "image": "card16", "count": 7}, {"card": 18, "image": "card17", "count": 7}, {"card": 19, "image": "card18", "count": 9}, {"card": 20, "image": "card19", "count": 4}, {"card": 21, "image": "card20", "count": 6}, {"card": 22, "image": "card21", "count": 6}, {"card": 23, "image": "card22", "count": 1}, {"card": 24, "image": "card23", "count": 7}, {"card": 25, "image": "card24", "count": 2}, {"card": 26, "image": "card25", "count": 0}, {"card": 27, "image": "card26", "count": 6}, {"card": 28, "image": "card27", "count": 1}, {"card": 29, "image": "card28", "count": 5}, {"card": 30, "image": "card29", "count": 5}, {"card": 31, "image": "card30", "count": 0}, {"card": 32, "image": "card31", "count": 0}, {"card": 33, "image": "card32", "count": 1}, {"card": 34, "image": "card33", "count": 5}, {"card": 35, "image": "card34", "count": 8}, {"card": 36, "image": "card35", "count": 8}, {"card": 37, "image": "card36", "count": 4}, {"card": 38, "image": "card37", "count": 3}, {"card": 39, "image": "card38", "count": 7}, {"card": 40, "image": "card39", "count": 4}, {"card": 41, "image": "card40", "count": 1}, {"card": 42, "image": "card41", "count": 4}, {"card": 43, "image": "card42", "count": 2}, {"card": 44, "image": "card43", "count": 9}, {"card": 45, "image": "card44", "count": 3}, {"card": 46, "image": "card45", "count": 7}, {"card": 47, "image": "card46", "count": 7}, {"card": 48, "image": "card47", "count": 2}, {"card": 49, "image": "card48", "count": 9}, {"card": 50, "image": "card49", "count": 9}, {"card": 51, "image": "card50", "count": 4}, {"card": 52, "image": "card51", "count": 5}, {"card": 53, "image": "card52", "count": 2}, {"card": 54, "image": "card53", "count": 1}, {"card": 55, "image": "card54", "count": 2}, {"card": 56, "image": "card55", "count": 9}, {"card": 57, "image": "card56", "count": 3}, {"card": 58, "image": "card57", "count": 6}, {"card": 59, "image": "card58", "count": 1}, {"card": 60, "image": "card59", "count": 7}, {"card": 61, "image": "card60", "count": 5}, {"card": 62, "image": "card61", "count": 8}, {"card": 63, "image": "card62", "count": 2}, {"card": 64, "image": "card63", "count": 5}, {"card": 65, "image": "card64", "count": 5}, {"card": 66, "image": "card65", "count": 0}, {"card": 67, "image": "card66", "count": 7}, {"card": 68, "image": "card67", "count": 2}, {"card": 69, "image": "card68", "count": 4}, {"card": 70, "image": "card69", "count": 1}, {"card": 71, "image": "card70", "count": 5}, {"card": 72, "image": "card71", "count": 6}, {"card": 73, "image": "card72", "count": 9}, {"card": 74, "image": "card73", "count": 1}, {"card": 75, "image": "card74", "count": 8}, {"card": 76, "image": "card75", "count": 5}, {"card": 77, "image": "card76", "count": 8}, {"card": 78, "image": "card77", "count": 1}, {"card": 79, "image": "card78", "count": 1}, {"card": 80, "image": "card79", "count": 7}, {"card": 81, "image": "card80", "count": 6}, {"card": 82, "image": "card81", "count": 1}, {"card": 83, "image": "card82", "count": 6}, {"card": 84, "image": "card83", "count": 9}, {"card": 85, "image": "card84", "count": 6}, {"card": 86, "image": "card85", "count": 8}, {"card": 87, "image": "card86", "count": 1}, {"card": 88, "image": "card87", "count": 6}, {"card": 89, "image": "card88", "count": 4}, {"card": 90, "image": "card89", "count": 0}, {"card": 91, "image": "card90", "count": 3}, {"card": 92, "image": "card91", "count": 6}, {"card": 93, "image": "card92", "count": 9}, {"card": 94, "image": "card93", "count": 8}, {"card": 95, "image": "card94", "count": 6}, {"card": 96, "image": "card95", "count": 7}, {"card": 97, "image": "card96", "count": 8}, {"card": 98, "image": "card97", "count": 9}, {"card": 99, "image": "card98", "count": 7}, {"card": 100, "image": "card99", "count": 8}, {"card": 101, "image": "card100", "count": 9}, {"card": 102, "image": "card101", "count": 8}, {"card": 103, "image": "card102", "count": 7}, {"card": 104, "image": "card103", "count": 0}, {"card": 105, "image": "card104", "count": 2}, {"card": 106, "image": "card105", "count": 8}, {"card": 107, "image": "card106", "count": 2}, {"card": 108, "image": "card107", "count": 4}, {"card": 109, "image": "card108", "count": 7}, {"card": 110, "image": "card109", "count": 5}]';

    // convert database objects to the corresponding card objects from 'cards' array
    var cardsCopy = $.extend({}, window.cards || []); // uses global cards variable
    var parsedCards;
    try {
      parsedCards = JSON.parse(ownedCardsJSON);
    } catch (err) {
      console.warn(
        "Failed to parse ownedCardsJSON, falling back to hardcoded deck"
      );
      parsedCards = JSON.parse(fallBackCardsForTesting);
    }

    for (var i = 0; i < parsedCards.length; i++) {
      if (parsedCards[i].count > 0) {
        var cardCount = parsedCards[i].count;
        if (cardsCopy[i]) {
          cardsCopy[i].count = cardCount;
          cardsCopy[i].colour = "#ffffff";
          window.ownedCards.push(cardsCopy[i]);
        }
      }
    }

    // Either pick random cards or show selection board
    window.rules = window.rules || (window.Game && Game.rules) || ["elemental"];
    if (window.rules.indexOf("random") != -1) {
      window.playerCards = this.shuffle($.extend(true, [], window.ownedCards));
      // populate AI cards and start game
      if (!window.cardsInAIHand || window.cardsInAIHand.length === 0) {
        populateAICards();
      }
      if (typeof window.startGame === "function") {
        window.startGame();
      }
    } else {
      // Draw the selection board background exactly as original
      selectionBoardBackground = new createjs.Shape();
      selectionBoardBackground.graphics
        .beginFill("#666666")
        .drawRect(0, 0, 420, 450);
      selectionBoardBackground.x = 170;
      selectionBoardBackground.y = 100;
      Game.ui.selectionBoard.addChild(selectionBoardBackground);

      // Draw the selection board text
      var cardListText = new createjs.Text("CARDS", "20px Arial", "#ffffff");
      cardListText.x = selectionBoardBackground.x + 10;
      cardListText.y = selectionBoardBackground.y + 20;
      cardListText.textBaseline = "alphabetic";

      var pageText = new createjs.Text("P.", "20px Arial", "#ffffff");
      pageText.x = selectionBoardBackground.x + 110;
      pageText.y = selectionBoardBackground.y + 20;
      pageText.textBaseline = "alphabetic";

      // Game.ui.pageDisplay should be a createjs.Text object
      Game.ui.pageDisplay = new createjs.Text("1", "20px Arial", "#ffffff");
      Game.ui.pageDisplay.x = selectionBoardBackground.x + 150;
      Game.ui.pageDisplay.y = selectionBoardBackground.y + 20;
      Game.ui.pageDisplay.textBaseline = "alphabetic";

      var numText = new createjs.Text("NUM.", "20px Arial", "#ffffff");
      numText.x = selectionBoardBackground.x + 350;
      numText.y = selectionBoardBackground.y + 20;
      numText.textBaseline = "alphabetic";

      Game.ui.selectionBoard.addChild(cardListText, pageText, Game.ui.pageDisplay, numText);

      // default page and populate
      Game.ui.page = 1;

      // Add AI cards (original behaviour)
      populateAICards();

      // Add selection board cards
      populateSelectionBoardCards();

      // Add container to stage and set up selection cursor
      if (Game.ui.selectionBoard.parent) {
        Game.ui.selectionBoard.parent.removeChild(Game.ui.selectionBoard);
      }
      Game.stage.addChild(Game.ui.selectionBoard);

      // place selection cursor and allow user to pick
      placePlayerHandSelectionCursor();
      Game.ui.playerSelectingHand = true;
    }
  }

  // -----------------------------
  // updateHandCards - updates the text/icon list on the selection board
  // -----------------------------
  updateHandCards() {
    var offset = (Game.ui.page - 1) * 11;

    // calculate how many cards are displayed
    if (window.ownedCards.length >= 11) {
      if (Game.ui.page != Game.ui.totalPages) {
        Game.ui.displayedCards.length = 11;
      } else if (Game.ui.page == Game.ui.totalPages) {
        Game.ui.displayedCards.length = remainingCards;
      }
    } else {
      Game.ui.displayedCards.length = Object.keys(window.ownedCards).length;
    }

    // change card colour for none left
    if (Game.ui.displayedCards[selectedHandCardNumber].count == 0) {
      Game.ui.displayedCards[selectedHandCardNumber].colour = "#909497";
    }
    if (window.playerCards.length > 0) {
      if (window.playerCards[window.playerCards.length - 1].count > 0) {
        window.playerCards[window.playerCards.length - 1].colour = "#ffffff";
      }
    }

    // display the card texts and icons - we must operate on Game.ui.shownCards.children
    var j = 0;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[j]) {
        Game.ui.shownCards.children[j].text = window.ownedCards[i + offset].displayName;
        Game.ui.shownCards.children[j].color = window.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[j].visible = true;
      }
      j += 3;
    }
    var k = 1;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[k]) {
        Game.ui.shownCards.children[k].text = window.ownedCards[i + offset].count;
        Game.ui.shownCards.children[k].color = window.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[k].visible = true;
      }
      k += 3;
    }
    var l = 2;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[l]) {
        Game.ui.shownCards.children[l].visible = true;
      }
      l += 3;
    }

    // hide excess lines if any
    for (var m = Game.ui.displayedCards.length * 3; m < 31; m++) {
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

  // -----------------------------
  // updateDisplayedCard - update the preview image on the selection board
  // -----------------------------
  updateDisplayedCard() {
    if (!Game.ui.displayedCard) {
      return;
    }
    Game.ui.displayedCard.y = 700;
    if (
      Game.ui.displayedCard.children &&
      Game.ui.displayedCard.children[1] &&
      Game.ui.displayedCard.children[1].image
    ) {
      if (selectedHandCard) {
        Game.ui.displayedCard.children[1].image.src =
          Game.config.cardPath + selectedHandCard.image + ".png";
      }
    }
    createjs.Tween.get(Game.ui.displayedCard).to(
      {
        x: Game.ui.displayedCard.x,
        y: selectionBoardBackground.y + 200,
      },
      100
    );
  }
}

// -----------------------------
// Backwards-compatible function bindings
// -----------------------------
// Create manager instance (single instance to preserve previous single-file behaviour)
var __playerCardManager = window.__playerCardManager || new PlayerCardManager();

// Maintain original function names so other scripts continue to call them unchanged.
function ajaxCall(whenDone) {
  return __playerCardManager.ajaxCall(whenDone);
}

function pickPlayerCards(ownedCardsJSON) {
  return __playerCardManager.pickPlayerCards(ownedCardsJSON);
}

// Expose other functions that external files may call (same names as original)
function updateHandCards() {
  return __playerCardManager.updateHandCards();
}
function updateDisplayedCard() {
  return __playerCardManager.updateDisplayedCard();
}

// Also expose the instance for future debugging if required
window.__playerCardManager = __playerCardManager;
