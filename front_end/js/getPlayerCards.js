// -----------------------------
// PlayerCardManager
// -----------------------------
class PlayerCardManager {
  constructor() {
    // Use existing global objects if present; otherwise create sensible defaults.
    // Many variables in the original code were globals set up by game.php - we do not override them if present.
    //this.stage = window.stage || null;

    // // Containers referenced by other code; if absent, create them here.
    // window.selectionBoard = window.selectionBoard || new createjs.Container();
    // window.selectionBoardBackground =
    //   window.selectionBoardBackground || new createjs.Shape();
    // window.shownCards = window.shownCards || new createjs.Container();
    // window.displayedCard = window.displayedCard || null;
    // window.displayedCardImage = window.displayedCardImage || null;
    // window.displayedCardColour = window.displayedCardColour || null;

    // // Variables used by pagination & selection
    // window.page = window.page || 1;
    // window.pageDisplay = window.pageDisplay || null;
    // window.totalPages = window.totalPages || 0;
    // window.displayedCards = window.displayedCards || [];
    // window.remainingCards = window.remainingCards || 0;
    // window.selectedHandCardNumber = window.selectedHandCardNumber || 0;
    // window.selectedHandCard = window.selectedHandCard || null;

    // // Player/AI/hand globals - preserve (or create) so other code can rely on them.
    // window.playerCards = window.playerCards || [];
    // window.ownedCards = window.ownedCards || [];
    // window.cardsInAIHand = window.cardsInAIHand || [];
    // window.cardsInPlayerHand = window.cardsInPlayerHand || [];

    // Cursor containers (global in original code)
    // window.playerHandSelectionCursor =
    //   window.playerHandSelectionCursor ||
    //   new createjs.Bitmap(
    //     window.Game && Game.config && Game.config.imagePath
    //       ? Game.config.imagePath + "cursor.png"
    //       : "front_end/images/cursor.png"
    //   );
    // window.confirmation = window.confirmation || new createjs.Container();
    // window.confirmationBackground =
    //   window.confirmationBackground || new createjs.Shape();
    // window.confirmationCursor =
    //   window.confirmationCursor ||
    //   new createjs.Bitmap(
    //     window.Game && Game.config && Game.config.imagePath
    //       ? Game.config.imagePath + "cursor.png"
    //       : "front_end/images/cursor.png"
    //   );

    // fallback card image path base
    this.cardFolder =
      window.Game && Game.config && Game.config.cardPath
        ? Game.config.cardPath
        : "front_end/images/cards/";
  }

  // -----------------------------
  // Ajax wrapper (keeps original signature)
  // -----------------------------
  // Original code used a function named `ajaxCall(whenDone)` — we preserve that name globally.
  ajaxCall(whenDone) {
    var ownedCardsJSON;
    // Keep the original ajax call present so future endpoint works unchanged.
    // If the AJAX request succeeds, pass the response to the callback.
    // If it fails, the original code used alerts; we keep that behaviour.
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

  // -----------------------------
  // Main entry-point used by other code
  // pickPlayerCards(ownedCardsJSON)
  // -----------------------------
  pickPlayerCards(ownedCardsJSONParam) {
    // The original code intentionally overwrote the incoming parameter with
    // a large placeholder JSON string (used for dev/testing).
    // We preserve that behaviour exactly so the code is identical to original.
    var ownedCardsJSON =
      '[{"card": 1, "image": "card0", "count": 6}, {"card": 2, "image": "card1", "count": 4}, {"card": 3, "image": "card2", "count": 8}, {"card": 4, "image": "card3", "count": 2}, {"card": 5, "image": "card4", "count": 4}, {"card": 6, "image": "card5", "count": 4}, {"card": 7, "image": "card6", "count": 7}, {"card": 8, "image": "card7", "count": 4}, {"card": 9, "image": "card8", "count": 4}, {"card": 10, "image": "card9", "count": 7}, {"card": 11, "image": "card10", "count": 2}, {"card": 12, "image": "card11", "count": 4}, {"card": 13, "image": "card12", "count": 9}, {"card": 14, "image": "card13", "count": 8}, {"card": 15, "image": "card14", "count": 1}, {"card": 16, "image": "card15", "count": 3}, {"card": 17, "image": "card16", "count": 7}, {"card": 18, "image": "card17", "count": 7}, {"card": 19, "image": "card18", "count": 9}, {"card": 20, "image": "card19", "count": 4}, {"card": 21, "image": "card20", "count": 6}, {"card": 22, "image": "card21", "count": 6}, {"card": 23, "image": "card22", "count": 1}, {"card": 24, "image": "card23", "count": 7}, {"card": 25, "image": "card24", "count": 2}, {"card": 26, "image": "card25", "count": 0}, {"card": 27, "image": "card26", "count": 6}, {"card": 28, "image": "card27", "count": 1}, {"card": 29, "image": "card28", "count": 5}, {"card": 30, "image": "card29", "count": 5}, {"card": 31, "image": "card30", "count": 0}, {"card": 32, "image": "card31", "count": 0}, {"card": 33, "image": "card32", "count": 1}, {"card": 34, "image": "card33", "count": 5}, {"card": 35, "image": "card34", "count": 8}, {"card": 36, "image": "card35", "count": 8}, {"card": 37, "image": "card36", "count": 4}, {"card": 38, "image": "card37", "count": 3}, {"card": 39, "image": "card38", "count": 7}, {"card": 40, "image": "card39", "count": 4}, {"card": 41, "image": "card40", "count": 1}, {"card": 42, "image": "card41", "count": 4}, {"card": 43, "image": "card42", "count": 2}, {"card": 44, "image": "card43", "count": 9}, {"card": 45, "image": "card44", "count": 3}, {"card": 46, "image": "card45", "count": 7}, {"card": 47, "image": "card46", "count": 7}, {"card": 48, "image": "card47", "count": 2}, {"card": 49, "image": "card48", "count": 9}, {"card": 50, "image": "card49", "count": 9}, {"card": 51, "image": "card50", "count": 4}, {"card": 52, "image": "card51", "count": 5}, {"card": 53, "image": "card52", "count": 2}, {"card": 54, "image": "card53", "count": 1}, {"card": 55, "image": "card54", "count": 2}, {"card": 56, "image": "card55", "count": 9}, {"card": 57, "image": "card56", "count": 3}, {"card": 58, "image": "card57", "count": 6}, {"card": 59, "image": "card58", "count": 1}, {"card": 60, "image": "card59", "count": 7}, {"card": 61, "image": "card60", "count": 5}, {"card": 62, "image": "card61", "count": 8}, {"card": 63, "image": "card62", "count": 2}, {"card": 64, "image": "card63", "count": 5}, {"card": 65, "image": "card64", "count": 5}, {"card": 66, "image": "card65", "count": 0}, {"card": 67, "image": "card66", "count": 7}, {"card": 68, "image": "card67", "count": 2}, {"card": 69, "image": "card68", "count": 4}, {"card": 70, "image": "card69", "count": 1}, {"card": 71, "image": "card70", "count": 5}, {"card": 72, "image": "card71", "count": 6}, {"card": 73, "image": "card72", "count": 9}, {"card": 74, "image": "card73", "count": 1}, {"card": 75, "image": "card74", "count": 8}, {"card": 76, "image": "card75", "count": 5}, {"card": 77, "image": "card76", "count": 8}, {"card": 78, "image": "card77", "count": 1}, {"card": 79, "image": "card78", "count": 1}, {"card": 80, "image": "card79", "count": 7}, {"card": 81, "image": "card80", "count": 6}, {"card": 82, "image": "card81", "count": 1}, {"card": 83, "image": "card82", "count": 6}, {"card": 84, "image": "card83", "count": 9}, {"card": 85, "image": "card84", "count": 6}, {"card": 86, "image": "card85", "count": 8}, {"card": 87, "image": "card86", "count": 1}, {"card": 88, "image": "card87", "count": 6}, {"card": 89, "image": "card88", "count": 4}, {"card": 90, "image": "card89", "count": 0}, {"card": 91, "image": "card90", "count": 3}, {"card": 92, "image": "card91", "count": 6}, {"card": 93, "image": "card92", "count": 9}, {"card": 94, "image": "card93", "count": 8}, {"card": 95, "image": "card94", "count": 6}, {"card": 96, "image": "card95", "count": 7}, {"card": 97, "image": "card96", "count": 8}, {"card": 98, "image": "card97", "count": 9}, {"card": 99, "image": "card98", "count": 7}, {"card": 100, "image": "card99", "count": 8}, {"card": 101, "image": "card100", "count": 9}, {"card": 102, "image": "card101", "count": 8}, {"card": 103, "image": "card102", "count": 7}, {"card": 104, "image": "card103", "count": 0}, {"card": 105, "image": "card104", "count": 2}, {"card": 106, "image": "card105", "count": 8}, {"card": 107, "image": "card106", "count": 2}, {"card": 108, "image": "card107", "count": 4}, {"card": 109, "image": "card108", "count": 7}, {"card": 110, "image": "card109", "count": 5}]';

    // convert database objects to the corresponding card objects from 'cards' array
    var cardsCopy = $.extend({}, window.cards || []); // uses global cards variable
    var parsedCards;
    try {
      parsedCards = JSON.parse(ownedCardsJSON);
    } catch (err) {
      // If JSON.parse fails, preserve original behaviour by alerting and returning gracefully.
      alert("Error parsing owned cards JSON: " + err.message);
      return;
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
      window.playerCards = this.shuffle(window.ownedCards);
      window.playerCards = $.extend({}, window.ownedCards);
      // populate AI cards and start game (match original flow)
      this.populateAICards();
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
      selectionBoard.addChild(selectionBoardBackground);

      // Draw the selection board text
      var cardListText = new createjs.Text("CARDS", "20px Arial", "#ffffff");
      cardListText.x = selectionBoardBackground.x + 10;
      cardListText.y = selectionBoardBackground.y + 20;
      cardListText.textBaseline = "alphabetic";

      var pageText = new createjs.Text("P.", "20px Arial", "#ffffff");
      pageText.x = selectionBoardBackground.x + 110;
      pageText.y = selectionBoardBackground.y + 20;
      pageText.textBaseline = "alphabetic";

      // pageDisplay should be a createjs.Text object as in original code
      pageDisplay = new createjs.Text("1", "20px Arial", "#ffffff");
      pageDisplay.x = selectionBoardBackground.x + 150;
      pageDisplay.y = selectionBoardBackground.y + 20;
      pageDisplay.textBaseline = "alphabetic";

      var numText = new createjs.Text("NUM.", "20px Arial", "#ffffff");
      numText.x = selectionBoardBackground.x + 350;
      numText.y = selectionBoardBackground.y + 20;
      numText.textBaseline = "alphabetic";

      selectionBoard.addChild(cardListText, pageText, pageDisplay, numText);

      // default page and populate
      page = 1;

      // Add AI cards (original behaviour)
      this.populateAICards();

      // Add selection board cards
      this.populateSelectionBoardCards();

      // Add container to stage and set up selection cursor
      if (this.stage) {
        this.stage.addChild(selectionBoard);
      } else if (window.stage) {
        window.stage.addChild(selectionBoard);
      }

      // place selection cursor and allow user to pick
      this.placePlayerHandSelectionCursor();
      window.playerSelectingHand = true;
    }
  }

  // -----------------------------
  // Helper: shuffle array in-place (original logic preserved)
  // -----------------------------
  shuffle(array) {
    var counter = array.length;
    var temp;
    var index;
    while (counter--) {
      index = (Math.random() * counter) | 0;
      temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  // -----------------------------
  // populateAICards - unchanged behaviour (just organised into method)
  // -----------------------------
  populateAICards() {
    // Setup AI hand (match original behaviour)
    var aiHand = this.shuffle(window.cards || []);
    aiHand = $.extend({}, window.cards || []);
    aiHand.length = 5;

    for (var i = 0; i < aiHand.length; i++) {
      var chosen_card = aiHand[i];

      // Default to a face-down card
      var cardImage = new createjs.Bitmap(this.cardFolder + "back.png");

      // Card background colour (owner)
      var cardColour = new createjs.Bitmap(
        this.cardFolder +
          (typeof window.getPlayerTurn === "function"
            ? getPlayerTurn()
            : "blue") +
          ".png"
      );

      // Card container
      var card = new createjs.Container();
      card.addChild(cardColour, cardImage);

      // Adjust card scale (guard against missing images by checking width/height values)
      if (
        card.children[0] &&
        card.children[0].image &&
        card.children[0].image.width
      ) {
        card.scaleX =
          (window.cardWidth ||
            window.cellWidth - (window.cardOffsetX || 3) * 2) /
          card.children[0].image.width;
        card.scaleY =
          (window.cardHeight ||
            window.cellHeight - (window.cardOffsetY || 3) * 2) /
          card.children[0].image.height;
      } else {
        card.scaleX = card.scaleY = 1;
      }

      // Card imagery
      card.frontImage = this.cardFolder + chosen_card.image + ".png";
      card.backImage = this.cardFolder + "back.png";

      // Card stats (preserve original property names)
      card.name = chosen_card.displayName;
      card.strengthUp = chosen_card.strengthUp;
      card.strengthRight = chosen_card.strengthRight;
      card.strengthDown = chosen_card.strengthDown;
      card.strengthLeft = chosen_card.strengthLeft;
      card.element = chosen_card.element;
      card.owner = card.background =
        typeof window.getPlayerTurn === "function" ? getPlayerTurn() : "blue";

      // Place the card off to the AI hand area
      card.x =
        window.aiHandOffsetX ||
        (window.gameOffsetX ? window.gameOffsetX / 2 : 100);
      card.y = (window.handOffsetY || 50) + i * (window.handCardOffset || 95);

      window.cardsInAIHand.push(card);
      if (this.stage) {
        this.stage.addChild(card);
      } else if (window.stage) {
        window.stage.addChild(card);
      }

      if (this.stage || window.stage) {
        (this.stage || window.stage).update();
      }
    }

    // Select the top card by default (preserve original globals)
    window.selectedCardNumber = 0;
    window.selectedCard = window.cardsInAIHand[window.selectedCardNumber];
    window.cardsAboveSelection = 0;
    window.previouslySelectedCard = [];

    // Handle the "open" rule flip all AI hand behaviour
    if (
      (window.rules && window.rules.indexOf("open") != -1) ||
      (window.Game && Game.rules && Game.rules.indexOf("open") != -1)
    ) {
      if (typeof window.flipAIHand === "function") {
        flipAIHand();
      }
    }
  }

  // -----------------------------
  // populateSelectionBoardCards - draw the selectable owned cards (preserve original behaviour)
  // -----------------------------
  populateSelectionBoardCards() {
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
      if (
        selectionBoardCardImage.image &&
        selectionBoardCardImage.image.width
      ) {
        selectionBoardCardImage.scaleX =
          30 / selectionBoardCardImage.image.width;
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
      this.cardFolder + selectedHandCard.image + ".png"
    );
    displayedCardColour = new createjs.Bitmap(this.cardFolder + "blue.png");
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
        (window.cardHeight ||
          window.cellHeight - (window.cardOffsetY || 3) * 2) /
        displayedCard.children[0].image.height;
    }

    selectionBoard.addChild(displayedCard);
  }

  // -----------------------------
  // placePlayerHandSelectionCursor - show the small cursor next to the list
  // -----------------------------
  placePlayerHandSelectionCursor() {
    playerHandSelectionCursor.x = selectionBoardBackground.x - 40;
    playerHandSelectionCursor.y = selectionBoardBackground.y + 48;
    selectionBoard.addChild(playerHandSelectionCursor);
    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  // -----------------------------
  // moveSelectionCursor - move selection cursor and update displayed card
  // -----------------------------
  moveSelectionCursor(direction) {
    if (direction == "up" && selectedHandCardNumber % 11 != 0) {
      playerHandSelectionCursor.y -= 35;
      selectedHandCardNumber -= 1;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateDisplayedCard();
    } else if (
      direction == "down" &&
      ((page != totalPages && selectedHandCardNumber % 11 != 10) ||
        (page == totalPages &&
          selectedHandCardNumber % 11 < remainingCards - 1))
    ) {
      playerHandSelectionCursor.y += 35;
      selectedHandCardNumber += 1;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateDisplayedCard();
    } else if (direction == "left" && page != 1) {
      page--;
      selectedHandCardNumber -= 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateHandCards();
      this.updateDisplayedCard();
    } else if (direction == "right" && page != totalPages - 1) {
      if (page != totalPages) {
        page++;
        selectedHandCardNumber += 11;
        selectedHandCard = window.ownedCards[selectedHandCardNumber];
        this.updateHandCards();
        this.updateDisplayedCard();
      }
    } else if (direction == "right" && page == totalPages - 1) {
      page++;
      if (selectedHandCardNumber > window.ownedCards.length - 12) {
        var selectedHandCardNumberForPage = Math.floor(
          (selectedHandCardNumber % 11) + 1
        );
        playerHandSelectionCursor.y -=
          35 * (selectedHandCardNumberForPage - remainingCards);
        selectedHandCardNumber = window.ownedCards.length - 1;
        selectedHandCard = window.ownedCards[selectedHandCardNumber];
      } else {
        selectedHandCardNumber += 11;
        selectedHandCard = window.ownedCards[selectedHandCardNumber];
      }
      this.updateHandCards();
      this.updateDisplayedCard();
    }

    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  // -----------------------------
  // displayConfirmationBox - original UI for "Are you sure?" dialog
  // -----------------------------
  displayConfirmationBox() {
    window.playerConfirming = true;

    // Background rectangle
    confirmationBackground.width = 300;
    confirmationBackground.height = 120;
    confirmationBackground.graphics
      .beginFill("#666666")
      .drawRect(
        0,
        0,
        confirmationBackground.width,
        confirmationBackground.height
      );
    confirmationBackground.x = 380;
    confirmationBackground.y = 285;

    // Border (black)
    var confirmationBorder = new createjs.Shape();
    confirmationBorder.width = confirmationBackground.width + 2;
    confirmationBorder.height = confirmationBackground.height + 2;
    confirmationBorder.graphics
      .beginFill("#000000")
      .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
    confirmationBorder.x = confirmationBackground.x - 1;
    confirmationBorder.y = confirmationBackground.y - 1;

    // Text elements
    var confirmationChoice = new createjs.Text(
      "CHOICE",
      "18px Arial",
      "#ffffff"
    );
    confirmationChoice.x = confirmationBackground.x + 10;
    confirmationChoice.y = confirmationBackground.y + 15;
    confirmationChoice.textBaseline = "alphabetic";
    confirmationChoice.alpha = 1;

    var confirmationSure = new createjs.Text(
      "Are you sure?",
      "28px Arial",
      "#ffffff"
    );
    confirmationSure.x = confirmationBackground.x + 60;
    confirmationSure.y = confirmationBackground.y + 40;
    confirmationSure.textBaseline = "alphabetic";
    confirmationSure.alpha = 1;

    var confirmationYes = new createjs.Text("Yes", "28px Arial", "#ffffff");
    confirmationYes.x = confirmationBackground.x + 120;
    confirmationYes.y = confirmationBackground.y + 75;
    confirmationYes.textBaseline = "alphabetic";
    confirmationYes.alpha = 1;

    var confirmationNo = new createjs.Text("No", "28px Arial", "#ffffff");
    confirmationNo.x = confirmationBackground.x + 120;
    confirmationNo.y = confirmationBackground.y + 105;
    confirmationNo.textBaseline = "alphabetic";
    confirmationNo.alpha = 1;

    confirmation.addChild(
      confirmationBorder,
      confirmationBackground,
      confirmationChoice,
      confirmationSure,
      confirmationYes,
      confirmationNo
    );

    if (this.stage) {
      this.stage.addChild(confirmation);
    } else if (window.stage) {
      window.stage.addChild(confirmation);
    }

    this.placeConfirmationCursor();
    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  placeConfirmationCursor() {
    confirmationCursor.x = confirmationBackground.x + 50;
    confirmationCursor.y = confirmationBackground.y + 60;
    if (this.stage) {
      this.stage.addChild(confirmationCursor);
    } else if (window.stage) {
      window.stage.addChild(confirmationCursor);
    }
    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  removeConfirmationCursor() {
    window.playerConfirming = false;
    if (this.stage) {
      this.stage.removeChild(confirmationCursor);
    } else if (window.stage) {
      window.stage.removeChild(confirmationCursor);
    }
    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  moveConfirmationCursor(direction) {
    if (direction == "up" && window.selectedConfirmationChoice != 0) {
      confirmationCursor.y -= 30;
      window.selectedConfirmationChoice -= 1;
    } else if (direction == "down" && window.selectedConfirmationChoice != 1) {
      confirmationCursor.y += 30;
      window.selectedConfirmationChoice += 1;
    }
    if (this.stage) {
      this.stage.update();
    } else if (window.stage) {
      window.stage.update();
    }
  }

  hideConfirmationBox() {
    window.playerConfirming = false;
    if (this.stage) {
      this.stage.removeChild(confirmation);
    } else if (window.stage) {
      window.stage.removeChild(confirmation);
    }
    window.playerSelectingHand = true;
  }

  // -----------------------------
  // updateHandCards - updates the text/icon list on the selection board
  // -----------------------------
  updateHandCards() {
    var offset = (page - 1) * 11;

    // calculate how many cards are displayed (exact original flow)
    if (window.ownedCards.length >= 11) {
      if (page != totalPages) {
        displayedCards.length = 11;
      } else if (page == totalPages) {
        displayedCards.length = remainingCards;
      }
    } else {
      displayedCards.length = Object.keys(window.ownedCards).length;
    }

    // change card colour for none left
    if (displayedCards[selectedHandCardNumber].count == 0) {
      displayedCards[selectedHandCardNumber].colour = "#909497";
    }
    if (window.playerCards.length > 0) {
      if (window.playerCards[window.playerCards.length - 1].count > 0) {
        window.playerCards[window.playerCards.length - 1].colour = "#ffffff";
      }
    }

    // display the card texts and icons - we must operate on shownCards.children
    var j = 0;
    for (var i = 0; i < displayedCards.length; i++) {
      if (shownCards.children[j]) {
        shownCards.children[j].text = window.ownedCards[i + offset].displayName;
        shownCards.children[j].color = window.ownedCards[i + offset].colour;
        shownCards.children[j].visible = true;
      }
      j += 3;
    }
    var k = 1;
    for (var i = 0; i < displayedCards.length; i++) {
      if (shownCards.children[k]) {
        shownCards.children[k].text = window.ownedCards[i + offset].count;
        shownCards.children[k].color = window.ownedCards[i + offset].colour;
        shownCards.children[k].visible = true;
      }
      k += 3;
    }
    var l = 2;
    for (var i = 0; i < displayedCards.length; i++) {
      if (shownCards.children[l]) {
        shownCards.children[l].visible = true;
      }
      l += 3;
    }

    // hide excess lines if any
    for (var m = displayedCards.length * 3; m < 31; m++) {
      if (shownCards.children[j]) {
        shownCards.children[j].text = "";
      }
      if (shownCards.children[k]) {
        shownCards.children[k].text = "";
      }
      if (shownCards.children[l]) {
        shownCards.children[l].visible = false;
      }
      j++;
      k++;
      l++;
    }

    if (pageDisplay) {
      pageDisplay.text = page;
    }
  }

  // -----------------------------
  // updateDisplayedCard - update the preview image on the selection board
  // -----------------------------
  updateDisplayedCard() {
    if (!displayedCard) {
      return;
    }
    displayedCard.y = 700;
    if (
      displayedCard.children &&
      displayedCard.children[1] &&
      displayedCard.children[1].image
    ) {
      displayedCard.children[1].image.src =
        this.cardFolder + selectedHandCard.image + ".png";
    }
    createjs.Tween.get(displayedCard).to(
      {
        x: displayedCard.x,
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
function populateAICards() {
  return __playerCardManager.populateAICards();
}
function populateSelectionBoardCards() {
  return __playerCardManager.populateSelectionBoardCards();
}
function placePlayerHandSelectionCursor() {
  return __playerCardManager.placePlayerHandSelectionCursor();
}
function moveSelectionCursor(direction) {
  return __playerCardManager.moveSelectionCursor(direction);
}
function displayConfirmationBox() {
  return __playerCardManager.displayConfirmationBox();
}
function placeConfirmationCursor() {
  return __playerCardManager.placeConfirmationCursor();
}
function removeConfirmationCursor() {
  return __playerCardManager.removeConfirmationCursor();
}
function moveConfirmationCursor(direction) {
  return __playerCardManager.moveConfirmationCursor(direction);
}
function hideConfirmationBox() {
  return __playerCardManager.hideConfirmationBox();
}
function updateHandCards() {
  return __playerCardManager.updateHandCards();
}
function updateDisplayedCard() {
  return __playerCardManager.updateDisplayedCard();
}

// Also expose the instance for future debugging if required
window.__playerCardManager = __playerCardManager;
