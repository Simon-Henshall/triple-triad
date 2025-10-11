// Grab The Player Cards From The Database
function ajaxCall(whenDone) {
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

// Pick The Player Cards (Not Called If 'Random' Is In Play)
function pickPlayerCards(ownedCardsJSON) {
  // Anti-CORS Testing / Only Pull Through Five Cards
  var ownedCardsJSON =
    '[{"card": 1, "image": "card0", "count": 6}, {"card": 2, "image": "card1", "count": 4}, {"card": 3, "image": "card2", "count": 8}, {"card": 4, "image": "card3", "count": 2}, {"card": 5, "image": "card4", "count": 4}, {"card": 6, "image": "card5", "count": 4}, {"card": 7, "image": "card6", "count": 7}, {"card": 8, "image": "card7", "count": 4}, {"card": 9, "image": "card8", "count": 4}, {"card": 10, "image": "card9", "count": 7}, {"card": 11, "image": "card10", "count": 2}, {"card": 12, "image": "card11", "count": 4}, {"card": 13, "image": "card12", "count": 9}, {"card": 14, "image": "card13", "count": 8}, {"card": 15, "image": "card14", "count": 1}, {"card": 16, "image": "card15", "count": 3}, {"card": 17, "image": "card16", "count": 7}, {"card": 18, "image": "card17", "count": 7}, {"card": 19, "image": "card18", "count": 9}, {"card": 20, "image": "card19", "count": 4}, {"card": 21, "image": "card20", "count": 6}, {"card": 22, "image": "card21", "count": 6}, {"card": 23, "image": "card22", "count": 1}, {"card": 24, "image": "card23", "count": 7}, {"card": 25, "image": "card24", "count": 2}, {"card": 26, "image": "card25", "count": 0}, {"card": 27, "image": "card26", "count": 6}, {"card": 28, "image": "card27", "count": 1}, {"card": 29, "image": "card28", "count": 5}, {"card": 30, "image": "card29", "count": 5}, {"card": 31, "image": "card30", "count": 0}, {"card": 32, "image": "card31", "count": 0}, {"card": 33, "image": "card32", "count": 1}, {"card": 34, "image": "card33", "count": 5}, {"card": 35, "image": "card34", "count": 8}, {"card": 36, "image": "card35", "count": 8}, {"card": 37, "image": "card36", "count": 4}, {"card": 38, "image": "card37", "count": 3}, {"card": 39, "image": "card38", "count": 7}, {"card": 40, "image": "card39", "count": 4}, {"card": 41, "image": "card40", "count": 1}, {"card": 42, "image": "card41", "count": 4}, {"card": 43, "image": "card42", "count": 2}, {"card": 44, "image": "card43", "count": 9}, {"card": 45, "image": "card44", "count": 3}, {"card": 46, "image": "card45", "count": 7}, {"card": 47, "image": "card46", "count": 7}, {"card": 48, "image": "card47", "count": 2}, {"card": 49, "image": "card48", "count": 9}, {"card": 50, "image": "card49", "count": 9}, {"card": 51, "image": "card50", "count": 4}, {"card": 52, "image": "card51", "count": 5}, {"card": 53, "image": "card52", "count": 2}, {"card": 54, "image": "card53", "count": 1}, {"card": 55, "image": "card54", "count": 2}, {"card": 56, "image": "card55", "count": 9}, {"card": 57, "image": "card56", "count": 3}, {"card": 58, "image": "card57", "count": 6}, {"card": 59, "image": "card58", "count": 1}, {"card": 60, "image": "card59", "count": 7}, {"card": 61, "image": "card60", "count": 5}, {"card": 62, "image": "card61", "count": 8}, {"card": 63, "image": "card62", "count": 2}, {"card": 64, "image": "card63", "count": 5}, {"card": 65, "image": "card64", "count": 5}, {"card": 66, "image": "card65", "count": 0}, {"card": 67, "image": "card66", "count": 7}, {"card": 68, "image": "card67", "count": 2}, {"card": 69, "image": "card68", "count": 4}, {"card": 70, "image": "card69", "count": 1}, {"card": 71, "image": "card70", "count": 5}, {"card": 72, "image": "card71", "count": 6}, {"card": 73, "image": "card72", "count": 9}, {"card": 74, "image": "card73", "count": 1}, {"card": 75, "image": "card74", "count": 8}, {"card": 76, "image": "card75", "count": 5}, {"card": 77, "image": "card76", "count": 8}, {"card": 78, "image": "card77", "count": 1}, {"card": 79, "image": "card78", "count": 1}, {"card": 80, "image": "card79", "count": 7}, {"card": 81, "image": "card80", "count": 6}, {"card": 82, "image": "card81", "count": 1}, {"card": 83, "image": "card82", "count": 6}, {"card": 84, "image": "card83", "count": 9}, {"card": 85, "image": "card84", "count": 6}, {"card": 86, "image": "card85", "count": 8}, {"card": 87, "image": "card86", "count": 1}, {"card": 88, "image": "card87", "count": 6}, {"card": 89, "image": "card88", "count": 4}, {"card": 90, "image": "card89", "count": 0}, {"card": 91, "image": "card90", "count": 3}, {"card": 92, "image": "card91", "count": 6}, {"card": 93, "image": "card92", "count": 9}, {"card": 94, "image": "card93", "count": 8}, {"card": 95, "image": "card94", "count": 6}, {"card": 96, "image": "card95", "count": 7}, {"card": 97, "image": "card96", "count": 8}, {"card": 98, "image": "card97", "count": 9}, {"card": 99, "image": "card98", "count": 7}, {"card": 100, "image": "card99", "count": 8}, {"card": 101, "image": "card100", "count": 9}, {"card": 102, "image": "card101", "count": 8}, {"card": 103, "image": "card102", "count": 7}, {"card": 104, "image": "card103", "count": 0}, {"card": 105, "image": "card104", "count": 2}, {"card": 106, "image": "card105", "count": 8}, {"card": 107, "image": "card106", "count": 2}, {"card": 108, "image": "card107", "count": 4}, {"card": 109, "image": "card108", "count": 7}, {"card": 110, "image": "card109", "count": 5}]';

  // Convert Database Data To The Corresponding Card Objects
  var cardsCopy = $.extend({}, cards);
  var parsedCards = JSON.parse(ownedCardsJSON);
  for (var i = 0; i < parsedCards.length; i++) {
    if (parsedCards[i].count > 0) {
      var cardCount = parsedCards[i].count;
      cardsCopy[i].count = cardCount;
      cardsCopy[i].colour = "#ffffff";
      ownedCards.push(cardsCopy[i]);
    }
  }

  // Either Pick Random Cards Or Allow A Selection
  if (rules.indexOf("random") != -1) {
    playerCards = shuffle(ownedCards);
    playerCards = $.extend({}, ownedCards);
    populateAICards();
    startGame();
  } else {
    // Draw The Selection Board Background
    selectionBoardBackground = new createjs.Shape();
    selectionBoardBackground.graphics
      .beginFill("#666666")
      .drawRect(0, 0, 420, 450);
    selectionBoardBackground.x = 170;
    selectionBoardBackground.y = 100;
    selectionBoard.addChild(selectionBoardBackground);

    // Draw The Selection Board Text
    var cardListText = new createjs.Text("CARDS", "20px Arial", "#ffffff");
    cardListText.x = selectionBoardBackground.x + 10;
    cardListText.y = selectionBoardBackground.y + 20;
    cardListText.textBaseline = "alphabetic";
    var pageText = new createjs.Text("P.", "20px Arial", "#ffffff");
    pageText.x = selectionBoardBackground.x + 110;
    pageText.y = selectionBoardBackground.y + 20;
    pageText.textBaseline = "alphabetic";
    pageDisplay = new createjs.Text("1", "20px Arial", "#ffffff");
    pageDisplay.x = selectionBoardBackground.x + 150;
    pageDisplay.y = selectionBoardBackground.y + 20;
    pageDisplay.textBaseline = "alphabetic";
    var numText = new createjs.Text("NUM.", "20px Arial", "#ffffff");
    numText.x = selectionBoardBackground.x + 350;
    numText.y = selectionBoardBackground.y + 20;
    numText.textBaseline = "alphabetic";
    selectionBoard.addChild(cardListText, pageText, pageDisplay, numText);

    // Work Out What Cards Are Visually Shown By Default
    page = 1;

    // Add The AI Cards
    populateAICards();

    // Add The Selection Board Cards
    populateSelectionBoardCards();

    // Add It All To The Game
    stage.addChild(selectionBoard);

    // Handle The Player Selecting Cards
    placePlayerHandSelectionCursor();
    playerSelectingHand = true;
  }
}

// Choose AI Cards To Play With
function populateAICards() {
  // Setup AI Hand
  var aiHand = shuffle(cards);
  aiHand = $.extend({}, cards);
  aiHand.length = 5;

  for (var i = 0; i < aiHand.length; i++) {
    // Grab The Correct Card Graphically
    var chosen_card = aiHand[i];

    // Default To A Face-Down Card
    cardImage = new createjs.Bitmap("front_end/images/cards/back.png");

    // Card Background Colour
    cardColour = new createjs.Bitmap(
      "front_end/images/cards/" + getPlayerTurn() + ".png"
    );

    // Card Container
    card = new createjs.Container();
    card.addChild(cardColour, cardImage);

    // Adjust The Card For The Board
    card.scaleX = cardWidth / card.children[0].image.width;
    card.scaleY = cardHeight / card.children[0].image.height;

    // Card Imagery
    card.frontImage = "front_end/images/cards/" + chosen_card.image + ".png";
    card.backImage = "front_end/images/cards/back.png";

    // Card Stats
    card.name = chosen_card.displayName;
    card.strengthUp = chosen_card.strengthUp;
    card.strengthRight = chosen_card.strengthRight;
    card.strengthDown = chosen_card.strengthDown;
    card.strengthLeft = chosen_card.strengthLeft;
    card.element = chosen_card.element;
    card.owner = card.background = getPlayerTurn();
    //card.owner = card.owner[0].toUpperCase() + card.owner.slice(1);

    // Place The Card
    card.x = aiHandOffsetX;
    card.y = handOffsetY + i * handCardOffset;

    cardsInAIHand.push(card);
    stage.addChild(card);
    stage.update();
  }

  // Select The Top Card By Default -- NOT SURE IF REFERENCED
  selectedCardNumber = 0;
  selectedCard = cardsInAIHand[selectedCardNumber];
  cardsAboveSelection = 0;
  previouslySelectedCard = [];

  // Handle The Open Rule
  if (rules.indexOf("open") != -1) {
    flipAIHand();
  }
}

// Populate The Selection Board With The Available Cards
function populateSelectionBoardCards() {
  // Calculate What Cards Are Being Displayed
  totalPages = Math.floor(ownedCards.length / 11) + 1;
  remainingCards = Object.keys(ownedCards).length % 11;
  displayedCards = $.extend({}, ownedCards);
  var offset = (page - 1) * 11;

  // Calculate How Many Cards Are Displayed
  if (ownedCards.length >= 11) {
    if (page != totalPages) {
      displayedCards.length = 11;
    } else if (page == totalPages) {
      displayedCards.length = remainingCards;
    }
  } else {
    displayedCards.length = Object.keys(ownedCards).length;
  }

  // Draw The Data
  var j = 0;
  for (var i = offset; i < offset + displayedCards.length; i++) {
    cardName = new createjs.Text(
      displayedCards[i].displayName,
      "26px Arial",
      "#ffffff"
    );
    cardName.x = selectionBoardBackground.x + 50;
    cardName.y = selectionBoardBackground.y + 35 * j + 60;
    cardName.textBaseline = "alphabetic";
    cardCount = new createjs.Text(
      displayedCards[i].count,
      "26px Arial",
      "#ffffff"
    );
    cardCount.x = selectionBoardBackground.x + 380;
    cardCount.y = selectionBoardBackground.y + 35 * j + 60;
    cardCount.textBaseline = "alphabetic";
    shownCards.addChild(cardName, cardCount);

    // Draw The Selection Board Card Image
    var selectionBoardCardImage = new createjs.Bitmap(
      "front_end/images/selection_card.png"
    );
    selectionBoardCardImage.x = selectionBoardBackground.x + 15;
    selectionBoardCardImage.y = selectionBoardBackground.y + 35 * j + 35;
    selectionBoardCardImage.scaleX = 30 / selectionBoardCardImage.image.width;
    selectionBoardCardImage.scaleY = 30 / selectionBoardCardImage.image.height;
    shownCards.addChild(selectionBoardCardImage);

    j++;
  }
  selectionBoard.addChild(shownCards);

  // Select The Top Card By Default
  selectedHandCardNumber = 0;
  selectedHandCard = ownedCards[selectedHandCardNumber];

  // Draw The Corresponding Card
  displayedCardImage = new createjs.Bitmap(
    "front_end/images/cards/" + selectedHandCard.image + ".png"
  );
  displayedCardColour = new createjs.Bitmap("front_end/images/cards/blue.png");
  displayedCard = new createjs.Container();
  displayedCard.addChild(displayedCardColour, displayedCardImage);
  displayedCard.x = selectionBoardBackground.x + 440;
  displayedCard.y = selectionBoardBackground.y + 200;
  displayedCard.scaleX = cardWidth / displayedCard.children[0].image.width;
  displayedCard.scaleY = cardHeight / displayedCard.children[0].image.height;
  selectionBoard.addChild(displayedCard);
}

// Place The Player Hand Selection Cursor
function placePlayerHandSelectionCursor() {
  playerHandSelectionCursor.x = selectionBoardBackground.x - 40;
  playerHandSelectionCursor.y = selectionBoardBackground.y + 48;
  selectionBoard.addChild(playerHandSelectionCursor);
  stage.update();
}

// Move The Player Hand Selection Cursor
function moveSelectionCursor(direction) {
  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((page != totalPages && selectedHandCardNumber % 11 != 10) ||
      (page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
  }

  // Handle Changing Pages
  else if (direction == "left" && page != 1) {
    page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = ownedCards[selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
  } else if (direction == "right" && page != totalPages - 1) {
    if (page != totalPages) {
      page++;
      selectedHandCardNumber += 11;
      selectedHandCard = ownedCards[selectedHandCardNumber];
      updateHandCards();
      updateDisplayedCard();
    }
  } else if (direction == "right" && page == totalPages - 1) {
    page++;
    if (selectedHandCardNumber > ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (selectedHandCardNumber % 11) + 1
      );
      playerHandSelectionCursor.y -=
        35 * (selectedHandCardNumberForPage - remainingCards);
      selectedHandCardNumber = ownedCards.length - 1;
      selectedHandCard = ownedCards[selectedHandCardNumber];
    } else {
      selectedHandCardNumber += 11;
      selectedHandCard = ownedCards[selectedHandCardNumber];
    }
    updateHandCards();
    updateDisplayedCard();
  }

  // Visually Show The Changes
  stage.update();
}

// Draw The Confirmation Box
function displayConfirmationBox() {
  playerConfirming = true;

  // Background
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

  // Border
  var confirmationBorder = new createjs.Shape();
  confirmationBorder.width = confirmationBackground.width + 2;
  confirmationBorder.height = confirmationBackground.height + 2;
  confirmationBorder.graphics
    .beginFill("#000000")
    .drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
  confirmationBorder.x = confirmationBackground.x - 1;
  confirmationBorder.y = confirmationBackground.y - 1;

  // Text
  var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
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

  stage.addChild(confirmation);
  placeConfirmationCursor();
  stage.update();
}

// Place The Player Hand Cursor
function placeConfirmationCursor() {
  confirmationCursor.x = confirmationBackground.x + 50;
  confirmationCursor.y = confirmationBackground.y + 60;
  stage.addChild(confirmationCursor);
  stage.update();
}

// Remove The Player Hand Cursor
function removeConfirmationCursor() {
  playerConfirming = false;
  stage.removeChild(confirmationCursor);
  stage.update();
}

// Move The Player Hand Cursor
function moveConfirmationCursor(direction) {
  if (direction == "up" && selectedConfirmationChoice != 0) {
    confirmationCursor.y -= 30;
    selectedConfirmationChoice -= 1;
  } else if (direction == "down" && selectedConfirmationChoice != 1) {
    confirmationCursor.y += 30;
    selectedConfirmationChoice += 1;
  }
  stage.update();
}

// Hide The Confirmation Box
function hideConfirmationBox() {
  playerConfirming = false;
  stage.removeChild(confirmation);
  playerSelectingHand = true;
}

// Update The Text Shown For Selecting Hand Cards
// Called When Changing Pages
function updateHandCards() {
  var offset = (page - 1) * 11;

  // Calculate How Many Cards Are Displayed
  if (ownedCards.length >= 11) {
    if (page != totalPages) {
      displayedCards.length = 11;
    } else if (page == totalPages) {
      displayedCards.length = remainingCards;
    }
  } else {
    displayedCards.length = Object.keys(ownedCards).length;
  }

  // Change Card Colour
  if (displayedCards[selectedHandCardNumber].count == 0) {
    displayedCards[selectedHandCardNumber].colour = "#909497";
  }
  if (playerCards.length > 0) {
    if (playerCards[playerCards.length - 1].count > 0) {
      playerCards[playerCards.length - 1].colour = "#ffffff";
    }
  }

  // Display The Card Texts And Icons
  var j = 0;
  for (var i = 0; i < displayedCards.length; i++) {
    shownCards.children[j].text = ownedCards[i + offset].displayName;
    shownCards.children[j].color = ownedCards[i + offset].colour;
    shownCards.children[j].visible = true; // Needed As 'shownCards.children[l]' Can Overwrite
    j += 3;
  }
  var k = 1;
  for (var i = 0; i < displayedCards.length; i++) {
    shownCards.children[k].text = ownedCards[i + offset].count;
    shownCards.children[k].color = ownedCards[i + offset].colour;
    shownCards.children[k].visible = true; // Needed As 'shownCards.children[l]' Can Overwrite
    k += 3;
  }
  var l = 2;
  for (var i = 0; i < displayedCards.length; i++) {
    shownCards.children[l].visible = true;
    l += 3;
  }

  // Hide Excess Card Names, Counts, And Icons
  for (var i = displayedCards.length * 3; i < 31; i++) {
    shownCards.children[j].text = "";
    shownCards.children[k].text = "";
    shownCards.children[l].visible = false;
    j++;
    k++;
    l++;
  }

  pageDisplay.text = page;
}

// Update The Displayed Card
function updateDisplayedCard() {
  displayedCard.y = 700;
  displayedCard.children[1].image.src =
    "front_end/images/cards/" + selectedHandCard.image + ".png";
  createjs.Tween.get(displayedCard).to(
    {
      x: displayedCard.x,
      y: selectionBoardBackground.y + 200,
    },
    100
  );
}
