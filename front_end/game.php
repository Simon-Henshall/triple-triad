<div id="game">
  <canvas id="gameArea" width="950" height="650"></canvas>
</div>

<!-- Triple Triad -->

<!-- Cards -->
<script type="text/javascript" src="front_end/js/cards.js"></script>

<script>
  // Grab The Player Cards From The Database
  function ajaxCall(whenDone) {
    var ownedCardsJSON;
    $.ajax({
      url: 'back_end/includes/get_player_cards.php',
      async: 'false',
      cache: 'false',
      type: 'GET',
      success: function(response) {
        ownedCardsJSON = response;
        whenDone(ownedCardsJSON);
      },
      error: function(jqXHR, exception) {
        if (jqXHR.status === 0) {
          alert('Not connect.\n Verify Network.');
        } else if (jqXHR.status == 404) {
          alert('Requested page not found. [404]');
        } else if (jqXHR.status == 500) {
          alert('Internal Server Error [500].');
        } else if (exception === 'parsererror') {
          alert('Requested JSON parse failed.');
        } else if (exception === 'timeout') {
          alert('Time out error.');
        } else if (exception === 'abort') {
          alert('Ajax request aborted.');
        } else {
          alert('Uncaught Error.\n' + jqXHR.responseText);
        }
      }
    });
  }

  // Initialisation Variables
  var stage = new createjs.Stage("gameArea");
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", handleTick);
  var stageWidth = stage.canvas.width;
  var stageHeight = stage.canvas.height;

  // Visual Offset Variables
  var gameOffsetX = 236;
  var gameOffsetY = 50;
  var handOffsetY = gameOffsetY;
  var handCardOffset = 95;
  var cellWidth = 159;
  var cellHeight = 184;
  var cardOffsetX = 3;
  var cardOffsetY = 3;
  var cardWidth = (cellWidth - (cardOffsetX * 2));
  var cardHeight = (cellHeight - (cardOffsetY * 2));

  // Player Variables
  var playerHandOffsetX = gameOffsetX + (cellWidth * 3) + (cardWidth / 4);
  var playerCards = [];
  var ownedCards = [];
  var selectedCards = [];
  var cardsInPlayerHand = [];
  var playerHand = [];
  var cardsAboveSelection;
  var playerCardCount;
  var playedPlayerCardCount = 0;
  var totalBlueCards = 5;
  var playerHandCursor = new createjs.Bitmap('front_end/images/cursor.png');
  var playerHandSelectionCursor = new createjs.Bitmap('front_end/images/cursor.png');

  // AI Variables
  var aiHandOffsetX = (gameOffsetX / 2) - (cardWidth / 2);
  var cardsInAIHand = [];
  var aiCardsAboveSelection;
  var aiCardCount;
  var aiDelay = 1000;
  var totalRedCards = 5;
  var aiHandCursor = new createjs.Bitmap('front_end/images/cursor.png');

  // Cell Information Variables
  var squares = [];
  var square;
  var selectedRow = 2;
  var selectedColumn = 2;
  var selectedSquare = 5;
  var selectedAISquare;
  var squareLeft;
  var squareUp;
  var squareRight;
  var squareDown;
  var gridCursor = new createjs.Bitmap('front_end/images/cursor.png');

  // Card Selection Logic Variables
  var selectionBoard = new createjs.Container();
  var selectionBoardBackground;
  var shownCards = new createjs.Container();
  var page;
  var pageDisplay;
  var totalPages;
  var displayedCards;
  var displayedCard;
  var displayedCardImage;
  var displayedCardColour;
  var remainingCards;
  var selectedHandCardNumber;
  var selectedHandCard;

  // Confirmation Box Logic Variables
  var confirmation = new createjs.Container();
  var confirmationBackground = new createjs.Shape();
  var confirmationCursor = new createjs.Bitmap('front_end/images/cursor.png');
  var selectedConfirmationChoice = 0;
  var playerConfirming = false;

  // Game Logic Variables
  var infoBox = new createjs.Container();
  var infoBoxCardName;
  var cardName;
  var cardCount;
  var selectedCardNumber;
  var selectedCard;
  var card;
  var cardImage;
  var previouslySelectedCard;
  var playerSelectingHand = false;
  var playerChoosingCard = false;
  var playerSelectingPlacement = false;
  var playerTurn = "red";
  var opponent;

  // Card Flipping Logic
  var sliceContainer = new createjs.Container();
  var sliceWidth;
  var sliceHeight;
  var degToRad = Math.PI / 180;

  // Debug Visiblity Variable
  var alpha = 0.01;

  // Rules Variable
  var rules = [
    //"open",
    //"random",
    "elemental",
    //"sudden_death"
  ];

  // Board Data Variables
  var board = ["Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty"];
  var freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Base Keypress Logic
  document.onkeydown = checkKey;

  // Ticker Functionality
  function handleTick() {
    stage.update();
  }

  // Base Code
  function init() {
    addBackground();
    ajaxCall(pickPlayerCards);
  }

  // Add The Background Image
  function addBackground() {
    var background = new createjs.Bitmap('front_end/images/board.png');
    background.x = 0;
    background.y = 0;
    stage.addChild(background);
    stage.update();
  }

  // Pick The Player Cards (Not Called If 'Random' Is In Play)
  function pickPlayerCards(ownedCardsJSON) {

    // Anti-CORS Testing / Only Pull Through Five Cards
    var ownedCardsJSON = '[{"card": 1, "image": "card0", "count": 6}, {"card": 2, "image": "card1", "count": 4}, {"card": 3, "image": "card2", "count": 8}, {"card": 4, "image": "card3", "count": 2}, {"card": 5, "image": "card4", "count": 4}, {"card": 6, "image": "card5", "count": 4}, {"card": 7, "image": "card6", "count": 7}, {"card": 8, "image": "card7", "count": 4}, {"card": 9, "image": "card8", "count": 4}, {"card": 10, "image": "card9", "count": 7}, {"card": 11, "image": "card10", "count": 2}, {"card": 12, "image": "card11", "count": 4}, {"card": 13, "image": "card12", "count": 9}, {"card": 14, "image": "card13", "count": 8}, {"card": 15, "image": "card14", "count": 1}, {"card": 16, "image": "card15", "count": 3}, {"card": 17, "image": "card16", "count": 7}, {"card": 18, "image": "card17", "count": 7}, {"card": 19, "image": "card18", "count": 9}, {"card": 20, "image": "card19", "count": 4}, {"card": 21, "image": "card20", "count": 6}, {"card": 22, "image": "card21", "count": 6}, {"card": 23, "image": "card22", "count": 1}, {"card": 24, "image": "card23", "count": 7}, {"card": 25, "image": "card24", "count": 2}, {"card": 26, "image": "card25", "count": 0}, {"card": 27, "image": "card26", "count": 6}, {"card": 28, "image": "card27", "count": 1}, {"card": 29, "image": "card28", "count": 5}, {"card": 30, "image": "card29", "count": 5}, {"card": 31, "image": "card30", "count": 0}, {"card": 32, "image": "card31", "count": 0}, {"card": 33, "image": "card32", "count": 1}, {"card": 34, "image": "card33", "count": 5}, {"card": 35, "image": "card34", "count": 8}, {"card": 36, "image": "card35", "count": 8}, {"card": 37, "image": "card36", "count": 4}, {"card": 38, "image": "card37", "count": 3}, {"card": 39, "image": "card38", "count": 7}, {"card": 40, "image": "card39", "count": 4}, {"card": 41, "image": "card40", "count": 1}, {"card": 42, "image": "card41", "count": 4}, {"card": 43, "image": "card42", "count": 2}, {"card": 44, "image": "card43", "count": 9}, {"card": 45, "image": "card44", "count": 3}, {"card": 46, "image": "card45", "count": 7}, {"card": 47, "image": "card46", "count": 7}, {"card": 48, "image": "card47", "count": 2}, {"card": 49, "image": "card48", "count": 9}, {"card": 50, "image": "card49", "count": 9}, {"card": 51, "image": "card50", "count": 4}, {"card": 52, "image": "card51", "count": 5}, {"card": 53, "image": "card52", "count": 2}, {"card": 54, "image": "card53", "count": 1}, {"card": 55, "image": "card54", "count": 2}, {"card": 56, "image": "card55", "count": 9}, {"card": 57, "image": "card56", "count": 3}, {"card": 58, "image": "card57", "count": 6}, {"card": 59, "image": "card58", "count": 1}, {"card": 60, "image": "card59", "count": 7}, {"card": 61, "image": "card60", "count": 5}, {"card": 62, "image": "card61", "count": 8}, {"card": 63, "image": "card62", "count": 2}, {"card": 64, "image": "card63", "count": 5}, {"card": 65, "image": "card64", "count": 5}, {"card": 66, "image": "card65", "count": 0}, {"card": 67, "image": "card66", "count": 7}, {"card": 68, "image": "card67", "count": 2}, {"card": 69, "image": "card68", "count": 4}, {"card": 70, "image": "card69", "count": 1}, {"card": 71, "image": "card70", "count": 5}, {"card": 72, "image": "card71", "count": 6}, {"card": 73, "image": "card72", "count": 9}, {"card": 74, "image": "card73", "count": 1}, {"card": 75, "image": "card74", "count": 8}, {"card": 76, "image": "card75", "count": 5}, {"card": 77, "image": "card76", "count": 8}, {"card": 78, "image": "card77", "count": 1}, {"card": 79, "image": "card78", "count": 1}, {"card": 80, "image": "card79", "count": 7}, {"card": 81, "image": "card80", "count": 6}, {"card": 82, "image": "card81", "count": 1}, {"card": 83, "image": "card82", "count": 6}, {"card": 84, "image": "card83", "count": 9}, {"card": 85, "image": "card84", "count": 6}, {"card": 86, "image": "card85", "count": 8}, {"card": 87, "image": "card86", "count": 1}, {"card": 88, "image": "card87", "count": 6}, {"card": 89, "image": "card88", "count": 4}, {"card": 90, "image": "card89", "count": 0}, {"card": 91, "image": "card90", "count": 3}, {"card": 92, "image": "card91", "count": 6}, {"card": 93, "image": "card92", "count": 9}, {"card": 94, "image": "card93", "count": 8}, {"card": 95, "image": "card94", "count": 6}, {"card": 96, "image": "card95", "count": 7}, {"card": 97, "image": "card96", "count": 8}, {"card": 98, "image": "card97", "count": 9}, {"card": 99, "image": "card98", "count": 7}, {"card": 100, "image": "card99", "count": 8}, {"card": 101, "image": "card100", "count": 9}, {"card": 102, "image": "card101", "count": 8}, {"card": 103, "image": "card102", "count": 7}, {"card": 104, "image": "card103", "count": 0}, {"card": 105, "image": "card104", "count": 2}, {"card": 106, "image": "card105", "count": 8}, {"card": 107, "image": "card106", "count": 2}, {"card": 108, "image": "card107", "count": 4}, {"card": 109, "image": "card108", "count": 7}, {"card": 110, "image": "card109", "count": 5}]';

    // Convert Database Data To The Corresponding Card Objects
    var cardsCopy = $.extend({}, cards);
    var parsedCards = JSON.parse(ownedCardsJSON);
    for (var i = 0; i < parsedCards.length; i++) {
      if (parsedCards[i].count > 0) {
        var cardCount = parsedCards[i].count;
        cardsCopy[i].count = cardCount;
        cardsCopy[i].colour = '#ffffff';
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
      selectionBoardBackground.graphics.beginFill("#666666").drawRect(0, 0, 420, 450);
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
      cardImage = new createjs.Bitmap('front_end/images/cards/back.png');

      // Card Background Colour
      cardColour = new createjs.Bitmap('front_end/images/cards/' + playerTurn + '.png');

      // Card Container
      card = new createjs.Container();
      card.addChild(cardColour, cardImage);

      // Adjust The Card For The Board
      card.scaleX = cardWidth / card.children[0].image.width;
      card.scaleY = cardHeight / card.children[0].image.height;

      // Card Imagery
      card.frontImage = 'front_end/images/cards/' + chosen_card.image + '.png';
      card.backImage = 'front_end/images/cards/back.png';

      // Card Stats
      card.name = chosen_card.displayName;
      card.strengthUp = chosen_card.strengthUp;
      card.strengthRight = chosen_card.strengthRight;
      card.strengthDown = chosen_card.strengthDown;
      card.strengthLeft = chosen_card.strengthLeft;
      card.element = chosen_card.element;
      card.owner = card.background = playerTurn;
      //card.owner = card.owner[0].toUpperCase() + card.owner.slice(1);

      // Place The Card
      card.x = aiHandOffsetX;
      card.y = handOffsetY + (i * handCardOffset);

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

  // Flip The Entire AI Hand Over At The Start Of A Game
  function flipAIHand() {
    setTimeout(function() {
      flipCard(cardsInAIHand[4], 'right');
      setTimeout(function() {
        flipCard(cardsInAIHand[3], 'right');
        setTimeout(function() {
          flipCard(cardsInAIHand[2], 'right');
          setTimeout(function() {
            flipCard(cardsInAIHand[1], 'right');
            setTimeout(function() {
              flipCard(cardsInAIHand[0], 'right');
            }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
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
    for (var i = offset; i < (offset + displayedCards.length); i++) {
      cardName = new createjs.Text(displayedCards[i].displayName, "26px Arial", "#ffffff");
      cardName.x = selectionBoardBackground.x + 50;
      cardName.y = selectionBoardBackground.y + (35 * j) + 60;
      cardName.textBaseline = "alphabetic";
      cardCount = new createjs.Text(displayedCards[i].count, "26px Arial", "#ffffff");
      cardCount.x = selectionBoardBackground.x + 380;
      cardCount.y = selectionBoardBackground.y + (35 * j) + 60;
      cardCount.textBaseline = "alphabetic";
      shownCards.addChild(cardName, cardCount);

      // Draw The Selection Board Card Image
      var selectionBoardCardImage = new createjs.Bitmap('front_end/images/selection_card.png');
      selectionBoardCardImage.x = selectionBoardBackground.x + 15;
      selectionBoardCardImage.y = selectionBoardBackground.y + (35 * j) + 35;
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
    displayedCardImage = new createjs.Bitmap('front_end/images/cards/' + selectedHandCard.image + '.png');
    displayedCardColour = new createjs.Bitmap('front_end/images/cards/blue.png');
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
    if (direction == 'up' && selectedHandCardNumber % 11 != 0) {
      playerHandSelectionCursor.y -= 35;
      selectedHandCardNumber -= 1;
      selectedHandCard = ownedCards[selectedHandCardNumber];
      updateDisplayedCard();
    } else if (direction == 'down' && (
        (page != totalPages && selectedHandCardNumber % 11 != 10) ||
        (page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1)
      )) {
      playerHandSelectionCursor.y += 35;
      selectedHandCardNumber += 1;
      selectedHandCard = ownedCards[selectedHandCardNumber];
      updateDisplayedCard();
    }

    // Handle Changing Pages
    else if (direction == 'left' && page != 1) {
      page--;
      selectedHandCardNumber -= 11;
      selectedHandCard = ownedCards[selectedHandCardNumber];
      updateHandCards();
      updateDisplayedCard();
    } else if (direction == 'right' && page != totalPages - 1) {
      if (page != totalPages) {
        page++;
        selectedHandCardNumber += 11;
        selectedHandCard = ownedCards[selectedHandCardNumber];
        updateHandCards();
        updateDisplayedCard();
      }
    } else if (direction == 'right' && page == totalPages - 1) {
      page++;
      if (selectedHandCardNumber > ownedCards.length - 12) {
        var selectedHandCardNumberForPage = Math.floor(selectedHandCardNumber % 11 + 1);
        playerHandSelectionCursor.y -= 35 * (selectedHandCardNumberForPage - remainingCards);
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
    confirmationBackground.graphics.beginFill("#666666").drawRect(0, 0, confirmationBackground.width, confirmationBackground.height);
    confirmationBackground.x = 380;
    confirmationBackground.y = 285;

    // Border
    var confirmationBorder = new createjs.Shape();
    confirmationBorder.width = confirmationBackground.width + 2;
    confirmationBorder.height = confirmationBackground.height + 2;
    confirmationBorder.graphics.beginFill("#000000").drawRect(0, 0, confirmationBorder.width, confirmationBorder.height);
    confirmationBorder.x = confirmationBackground.x - 1;
    confirmationBorder.y = confirmationBackground.y - 1;

    // Text
    var confirmationChoice = new createjs.Text("CHOICE", "18px Arial", "#ffffff");
    confirmationChoice.x = confirmationBackground.x + 10;
    confirmationChoice.y = confirmationBackground.y + 15;
    confirmationChoice.textBaseline = "alphabetic";
    confirmationChoice.alpha = 1;
    var confirmationSure = new createjs.Text("Are you sure?", "28px Arial", "#ffffff");
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

    confirmation.addChild(confirmationBorder, confirmationBackground, confirmationChoice, confirmationSure, confirmationYes, confirmationNo);

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
    if (direction == 'up' && selectedConfirmationChoice != 0) {
      confirmationCursor.y -= 30;
      selectedConfirmationChoice -= 1;
    } else if (direction == 'down' && selectedConfirmationChoice != 1) {
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
      displayedCards[selectedHandCardNumber].colour = '#909497';
    }
    if (playerCards.length > 0) {
      if (playerCards[playerCards.length - 1].count > 0) {
        playerCards[playerCards.length - 1].colour = '#ffffff';
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
    for (var i = (displayedCards.length * 3); i < 31; i++) {
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
    displayedCard.children[1].image.src = 'front_end/images/cards/' + selectedHandCard.image + '.png';
    createjs.Tween.get(displayedCard).to({
      "x": displayedCard.x,
      "y": selectionBoardBackground.y + 200
    }, 100);
  }

  // Generate The Main Grid For The Game
  function generateGrid() {

    // Square Variables
    var squareID = 0;
    var squareElement;

    // Element Calculation
    var possibleElements = [1, 2, 3, 4, 5, 6, 7, 8];
    var elements = [];
    var numElements = Math.floor(Math.random() * 3) + 1;
    for (var i = 0; i < numElements; i++) {
      var chosenElement = possibleElements[Math.floor(Math.random() * possibleElements.length)];
      elements.push(chosenElement);
    }
    for (var i = numElements; i < 9; i++) {
      elements.push(0);
    }
    shuffle(elements);

    // Add The Squares
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        var color = "White";
        square = new createjs.Shape();
        square.graphics.beginStroke("#000");
        square.graphics.setStrokeStyle(1);
        square.graphics.beginFill(color);
        square.graphics.drawRect(gameOffsetX, gameOffsetY, cellWidth, cellHeight);
        square.x = x * cellWidth;
        square.y = y * cellHeight;
        squareID += 1;
        square.alpha = alpha;

        // Handle Elements
        if (rules.indexOf("elemental") != -1) {
          square.element = elements[squareID - 1];
          if (square.element != 0) {
            squareElement = new createjs.Bitmap('front_end/images/elements/' + square.element + '.png');
            squareElement.x = gameOffsetX + square.x + 60;
            squareElement.y = gameOffsetY + square.y + 70;
            stage.addChild(squareElement);
          }
        } else {
          square.element = 0;
        }

        square.addEventListener("click", clickHandler);
        stage.addChild(square);
        var id = square.x + "_" + square.y;
        square.name = squareID;
        squares.push(square);
        stage.update();
      }
    }

  }

  // Draw Numbers Onto The Grid For Reference
  function drawGridNumbers() {
    var count = 1;
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        var text = new createjs.Text(count, "40px Arial", "#ff7700");
        text.x = gameOffsetX + (cellWidth * x) + 10;
        text.y = gameOffsetY + (cellHeight * y) + 40;
        text.textBaseline = "alphabetic";
        text.alpha = alpha;
        stage.addChild(text);
        count++;
      }
    }
  }

  // Draw The Card Count For Each Player
  function drawCardCounts() {

    // AI Count
    aiCardCount = new createjs.Text(totalRedCards, "90px Arial", "#ffffff");
    aiCardCount.x = aiHandOffsetX + (cardWidth / 3);
    aiCardCount.y = stageHeight - 15;
    aiCardCount.textBaseline = "alphabetic";
    aiCardCount.alpha = 1;
    stage.addChild(aiCardCount);

    // Player Count
    playerCardCount = new createjs.Text(totalBlueCards, "90px Arial", "#ffffff");
    playerCardCount.x = playerHandOffsetX + (cardWidth / 3);
    playerCardCount.y = stageHeight - 15;
    playerCardCount.textBaseline = "alphabetic";
    playerCardCount.alpha = 1;
    stage.addChild(playerCardCount);

    // Refresh The Visual Numbers
    stage.update();

  }

  // Update The Card Count For Each Player
  function updateCardCounts() {
    aiCardCount.text = totalRedCards;
    playerCardCount.text = totalBlueCards;
    stage.update();
  }

  // Draw The Info Box
  function drawInfoBox() {

    // Background
    var infoBoxBackground = new createjs.Shape();
    infoBoxBackground.width = 420;
    infoBoxBackground.height = 65;
    infoBoxBackground.graphics.beginFill("#666666").drawRect(0, 0, infoBoxBackground.width, infoBoxBackground.height);
    infoBoxBackground.x = 260;
    infoBoxBackground.y = 540;
    infoBox.addChild(infoBoxBackground);

    // Text
    var infoBoxText = new createjs.Text("INFO.", "18px Arial", "#ffffff");
    infoBoxText.x = infoBoxBackground.x + 10;
    infoBoxText.y = infoBoxBackground.y + 15;
    infoBoxText.textBaseline = "alphabetic";
    infoBoxText.alpha = 1;
    infoBox.addChild(infoBoxText);

    // Player Count
    infoBoxCardName = new createjs.Text(selectedCard.name, "30px Arial", "#ffffff");
    infoBoxCardName.x = infoBoxBackground.x + (infoBoxBackground.width / 3);
    infoBoxCardName.y = infoBoxBackground.y + (infoBoxBackground.height / 2) + 10;
    infoBoxCardName.textBaseline = "alphabetic";
    infoBoxCardName.alpha = 1;
    infoBox.addChild(infoBoxCardName);

    stage.addChild(infoBox);
    stage.update();

  }

  // Update The Info Box
  function updateInfoBox() {
    infoBoxCardName.text = selectedCard.name;
    stage.update();
  }

  // Start The Game
  function startGame() {
    generateGrid();
    drawGridNumbers();
    populatePlayerCards(playerCards);
    drawCardCounts();
    drawInfoBox();
    placePlayerHandCursor();
  }

  // Shuffle An Array -- Used For Ensuring No Duplicate Cards In Hand
  function shuffle(array) {
    var counter = array.length,
      temp, index;
    while (counter--) {
      index = (Math.random() * counter) | 0;
      temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  // Choose Which Cards To Play With (Currently Random Cards)
  function populatePlayerCards(playerCards) {

    // Calculate The Current Player
    player();

    // Setup Player Hand
    playerHand = shuffle(playerCards);
    playerHand = $.extend({}, playerCards);
    playerHand.length = 5;

    for (var i = 0; i < playerHand.length; i++) {

      // Grab The Correct Card Graphically
      var chosen_card = playerHand[i];
      cardImage = new createjs.Bitmap('front_end/images/cards/' + chosen_card.image + '.png');

      // Card Background Colour
      cardColour = new createjs.Bitmap('front_end/images/cards/' + playerTurn + '.png');

      // Card Container
      card = new createjs.Container();
      card.addChild(cardColour, cardImage);

      // Adjust The Card For The Board
      card.scaleX = cardWidth / card.children[0].image.width;
      card.scaleY = cardHeight / card.children[0].image.height;

      // Card Stats
      card.name = chosen_card.displayName;
      card.strengthUp = chosen_card.strengthUp;
      card.strengthRight = chosen_card.strengthRight;
      card.strengthDown = chosen_card.strengthDown;
      card.strengthLeft = chosen_card.strengthLeft;
      card.element = chosen_card.element;
      card.owner = card.background = playerTurn;
      //card.owner = card.owner[0].toUpperCase() + card.owner.slice(1);

      // Place The Card
      card.x = playerHandOffsetX;
      card.y = handOffsetY + (i * handCardOffset);
      cardsInPlayerHand.push(card);
      stage.addChild(card);
      stage.update();

    }

    // Select The Top Card By Default
    selectedCardNumber = 0;
    selectedCard = cardsInPlayerHand[selectedCardNumber];
    previouslySelectedCard = [];

    // Indent The Chosen Card
    indentSelectedCard();

    // Ready For The Player To Choose Which Card To Play
    playerChoosingCard = true;

  }

  // Indent The Selected Card
  function indentSelectedCard() {
    if (playerTurn == "red") {
      selectedCard.x = selectedCard.x + 30;
      previouslySelectedCard.x = previouslySelectedCard.x - 30;
    } else if (playerTurn == "blue") {
      selectedCard.x = selectedCard.x - 30;
      previouslySelectedCard.x = previouslySelectedCard.x + 30;
    }
    stage.update();
  }

  // Place The Player Hand Cursor
  function placePlayerHandCursor() {
    playerChoosingCard = true;
    playerHandCursor.x = playerHandOffsetX - 50;
    playerHandCursor.y = handOffsetY + ((selectedCardNumber + 1 + playedPlayerCardCount) * (cardHeight / 2));
    stage.addChild(playerHandCursor);
    stage.update();
  }

  // Remove The Player Hand Cursor
  function removePlayerHandCursor() {
    playerChoosingCard = false;
    stage.removeChild(playerHandCursor);
    stage.update();
  }

  // Move The Player Hand Cursor
  function movePlayerHandCursor(direction) {
    if (direction == 'up' && selectedCardNumber != 0) {
      playerHandCursor.y -= handCardOffset;
      selectedCardNumber -= 1;
      cardsAboveSelection -= 1;
      selectedCard = cardsInPlayerHand[selectedCardNumber];
      previouslySelectedCard = cardsInPlayerHand[selectedCardNumber + 1];
      updateInfoBox();
      indentSelectedCard();
    } else if (direction == 'down' && selectedCardNumber != cardsInPlayerHand.length - 1) {
      playerHandCursor.y += handCardOffset;
      selectedCardNumber += 1;
      cardsAboveSelection += 1;
      selectedCard = cardsInPlayerHand[selectedCardNumber];
      previouslySelectedCard = cardsInPlayerHand[selectedCardNumber - 1];
      updateInfoBox();
      indentSelectedCard();
    }

    stage.update();
  }

  // Place The Selection Cursor Onto The Grid
  function placeGridCursor() {
    playerSelectingPlacement = true;
    gridCursor.x = gameOffsetX + (cellWidth * 1) + 16;
    gridCursor.y = gameOffsetY + (cellHeight * 1) + 80;
    stage.addChild(gridCursor);
    stage.update();
  }

  // Remove The Selection Cursor From The Grid
  function removeGridCursor() {
    playerSelectingPlacement = false;
    stage.removeChild(gridCursor);
    stage.update();
  }

  // Move The Selection Cursor
  function moveGridCursor(direction) {
    if (direction == 'left' && gridCursor.x != gameOffsetX + 16) {
      gridCursor.x -= cellWidth;
      selectedColumn -= 1;
    } else if (direction == 'up' && gridCursor.y != gameOffsetY + 80) {
      gridCursor.y -= cellHeight;
      selectedRow -= 1;
    } else if (direction == 'right' && gridCursor.x != gameOffsetX + (cellWidth * 2) + 16) {
      gridCursor.x += cellWidth;
      selectedColumn += 1;
    } else if (direction == 'down' && gridCursor.y != gameOffsetY + (cellHeight * 2) + 80) {
      gridCursor.y += cellHeight;
      selectedRow += 1;
    }

    checkSelectedSquare();
    stage.update();
  }

  // Calculate Which Square Is Currently Selected And The Adjacent Squares
  function checkSelectedSquare() {
    if (selectedRow == 1 && selectedColumn == 1) {
      selectedSquare = 1;
      squareLeft = "none";
      squareUp = "none";
      squareRight = 2;
      squareDown = 4;
    } else if (selectedRow == 1 && selectedColumn == 2) {
      selectedSquare = 2;
      squareLeft = 1;
      squareUp = "none";
      squareRight = 3;
      squareDown = 5;
    } else if (selectedRow == 1 && selectedColumn == 3) {
      selectedSquare = 3;
      squareLeft = 2;
      squareUp = "none";
      squareRight = "none";
      squareDown = 6;
    } else if (selectedRow == 2 && selectedColumn == 1) {
      selectedSquare = 4;
      squareLeft = "none";
      squareUp = 1;
      squareRight = 5;
      squareDown = 7;
    } else if (selectedRow == 2 && selectedColumn == 2) {
      selectedSquare = 5;
      squareLeft = 4;
      squareUp = 2;
      squareRight = 5;
      squareDown = 8;
    } else if (selectedRow == 2 && selectedColumn == 3) {
      selectedSquare = 6;
      squareLeft = 5;
      squareUp = 3;
      squareRight = "none";
      squareDown = 9;
    } else if (selectedRow == 3 && selectedColumn == 1) {
      selectedSquare = 7;
      squareLeft = "none";
      squareUp = 4;
      squareRight = 8;
      squareDown = "none";
    } else if (selectedRow == 3 && selectedColumn == 2) {
      selectedSquare = 8;
      squareLeft = 7;
      squareUp = 5;
      squareRight = 9;
      squareDown = "none";
    } else if (selectedRow == 3 && selectedColumn == 3) {
      selectedSquare = 9;
      squareLeft = 8;
      squareUp = 6;
      squareRight = "none";
      squareDown = "none";
    }
  }

  // Inverse Of checkSelectedSquare()
  // Calculate Which Row And Column Is Currently Selected And The Adjacent Squares
  function checkSelectedRowColumn() {
    if (selectedAISquare == 1) {
      selectedRow = 1;
      selectedColumn = 1;
      squareLeft = "none";
      squareUp = "none";
      squareRight = 2;
      squareDown = 4;
    } else if (selectedAISquare == 2) {
      selectedRow = 1;
      selectedColumn = 2;
      squareLeft = 1;
      squareUp = "none";
      squareRight = 3;
      squareDown = 5;
    } else if (selectedAISquare == 3) {
      selectedRow = 1;
      selectedColumn = 3;
      squareLeft = 2;
      squareUp = "none";
      squareRight = "none";
      squareDown = 6;
    } else if (selectedAISquare == 4) {
      selectedRow = 2;
      selectedColumn = 1;
      squareLeft = "none";
      squareUp = 1;
      squareRight = 5;
      squareDown = 7;
    } else if (selectedAISquare == 5) {
      selectedRow = 2;
      selectedColumn = 2;
      squareLeft = 4;
      squareUp = 2;
      squareRight = 5;
      squareDown = 8;
    } else if (selectedAISquare == 6) {
      selectedRow = 2;
      selectedColumn = 3;
      squareLeft = 5;
      squareUp = 3;
      squareRight = "none";
      squareDown = 9;
    } else if (selectedAISquare == 7) {
      selectedRow = 3;
      selectedColumn = 1;
      squareLeft = "none";
      squareUp = 4;
      squareRight = 8;
      squareDown = "none";
    } else if (selectedAISquare == 8) {
      selectedRow = 3;
      selectedColumn = 2;
      squareLeft = 7;
      squareUp = 5;
      squareRight = 9;
      squareDown = "none";
    } else if (selectedAISquare == 9) {
      selectedRow = 3;
      selectedColumn = 3;
      squareLeft = 8;
      squareUp = 6;
      squareRight = "none";
      squareDown = "none";
    }
  }

  // Handler For Key Presses
  function checkKey(e) {
    "use strict";
    e = e || window.event;
    if (playerSelectingHand) {
      // Left
      if (e.keyCode === 37) {
        moveSelectionCursor('left');
        // Up
      } else if (e.keyCode === 38) {
        moveSelectionCursor('up');
        // Right
      } else if (e.keyCode === 39) {
        moveSelectionCursor('right');
        // Down
      } else if (e.keyCode === 40) {
        moveSelectionCursor('down');
        // Enter
      } else if (e.keyCode === 13) {
        if (displayedCards[selectedHandCardNumber].count > 0) {
          displayedCards[selectedHandCardNumber].count -= 1;
          playerCards.push(selectedHandCard);
          updateHandCards();
        }
        if (playerCards.length == 5) {
          playerSelectingHand = false;
          displayConfirmationBox();
        }
        // Backspace And Esc
      } else if (e.keyCode === 27 || e.keyCode === 8) {
        if (playerCards.length > 0) {
          playerCards[playerCards.length - 1].count += 1;
          updateHandCards();
          playerCards.pop();
        }
      }
    } else if (playerConfirming) {
      // Up
      if (e.keyCode === 38) {
        moveConfirmationCursor('up');
        // Down
      } else if (e.keyCode === 40) {
        moveConfirmationCursor('down');
        // Enter
      } else if (e.keyCode === 13 && selectedConfirmationChoice == 0) {
        stage.removeChild(selectionBoard);
        stage.removeChild(confirmation);
        removeConfirmationCursor();
        startGame();
        // Backspace, Esc, And 'No'
      } else if ((e.keyCode === 27 || e.keyCode === 8) || (e.keyCode === 13 && selectedConfirmationChoice == 1)) {
        for (var i = 0; i < 5; i++) {
          playerCards[playerCards.length - 1].count += 1;
          updateHandCards();
          playerCards.pop();
        }
        stage.removeChild(confirmation);
        moveConfirmationCursor('up');
        removeConfirmationCursor();
        playerSelectingHand = true;
      }
    } else if (playerChoosingCard) {
      // Up
      if (e.keyCode === 38) {
        movePlayerHandCursor('up');
        // Down
      } else if (e.keyCode === 40) {
        movePlayerHandCursor('down');
        // Enter
      } else if (e.keyCode === 13) {
        removePlayerHandCursor();
        placeGridCursor();
        selectedRow = 2;
        selectedColumn = 2;
        stage.removeChild(playerHandCursor);
      }
    } else if (playerSelectingPlacement) {
      infoBox.visible = false;
      // Left
      if (e.keyCode === 37) {
        moveGridCursor('left');
        // Up
      } else if (e.keyCode === 38) {
        moveGridCursor('up');
        // Right
      } else if (e.keyCode === 39) {
        moveGridCursor('right');
        // Down
      } else if (e.keyCode === 40) {
        moveGridCursor('down');
        // Enter
      } else if (e.keyCode === 13) {
        if (!cellOccupied()) {
          cardsInPlayerHand.splice(selectedCardNumber, 1);
          removeGridCursor();
          placeCard(
            selectedCard,
            (gameOffsetX + (cellWidth * (selectedColumn - 1)) + cardOffsetX),
            (gameOffsetY + (cellHeight * (selectedRow - 1)) + cardOffsetY)
          );
        }
        // Backspace And Esc
      } else if (e.keyCode === 27 || e.keyCode === 8) {
        removeGridCursor();
        placePlayerHandCursor();
      }
    }
  }

  // AI Turn
  function aiTurn() {

    // Pick A Card To Play (Currently Random)
    var aiSelectedCard = cardsInAIHand[Math.floor(Math.random() * cardsInAIHand.length)];
    var aiSelectedCardNumber = cardsInAIHand.indexOf(aiSelectedCard);

    // Pick A Cell To Play In (Currently Random)
    selectedAISquare = freeCells[Math.floor(Math.random() * freeCells.length)];
    checkSelectedRowColumn();

    // Place The Card
    aiCardsAboveSelection = aiSelectedCardNumber;
    cardsInAIHand.splice(aiSelectedCardNumber, 1);
    setTimeout(function() {
      placeCard(
        aiSelectedCard,
        (gameOffsetX + (cellWidth * (selectedColumn - 1)) + cardOffsetX),
        (gameOffsetY + (cellHeight * (selectedRow - 1)) + cardOffsetY)
      );
    }, aiDelay);

  }

  // Player Turn
  function playerTurn() {
    //aiTurn();
  }

  // Check If A Cell Is Occupied
  function cellOccupied() {
    if (board[selectedSquare - 1] == "Empty") {
      return false;
    } else {
      return board[selectedSquare - 1];
    }
  }

  // Calculate Player Turn
  function player() {
    if (playerTurn == "blue") {
      opponent = "red";
      playerTurn = "red";
    } else if (playerTurn == "red") {
      opponent = "blue";
      playerTurn = "blue";
    }
    //return playerTurn;
  }

  // Place A Card Onto The Board
  function placeCard(cardToPlace, placement_x, placement_y) {

    // Grab Info About The Card
    card = cardToPlace;
    checkSelectedSquare();

    if (playerTurn == 'red') {
      var offscreen_x = card.x + 40;

    } else if (playerTurn == 'blue') {
      var offscreen_x = card.x - 40;
    }
    var offscreen_y = -200;

    // Animate The Transition
    createjs.Tween.get(card)
      .to({
        "x": offscreen_x,
        "y": offscreen_y
      }, 500)
      .call(handleComplete);

    function handleComplete() {
      stage.setChildIndex(card, stage.getNumChildren() - 1); // Bring The Card To The Front Of The Z-Index
      if (playerTurn == 'red') {
        card.children[1].image.src = card.frontImage;
      }
      createjs.Tween.get(card)
        .to({
          "x": placement_x,
          "y": placement_y
        }, 500)
        .call(handleComplete);

      function handleComplete() {
        card.inCell = selectedSquare;

        // Invalid Card References
        if (squareLeft != "none") {
          card.cardLeft = board[squareLeft - 1];
        } else {
          card.cardLeft = "[INVALID]";
        }

        if (squareUp != "none") {
          card.cardUp = board[squareUp - 1];
        } else {
          card.cardUp = "[INVALID]";
        }

        if (squareRight != "none") {
          card.cardRight = board[squareRight - 1];
        } else {
          card.cardRight = "[INVALID]";
        }

        if (squareDown != "none") {
          card.cardDown = board[squareDown - 1];
        } else {
          card.cardDown = "[INVALID]";
        }

        // Add The Card To The Board
        board[selectedSquare - 1] = card;

        var selectedSquareFreeCellsIndex = freeCells.indexOf(selectedSquare);
        freeCells.splice(selectedSquareFreeCellsIndex, 1);

        // Calculate Elements
        if (squares[selectedSquare - 1].element != 0 && card.element == squares[selectedSquare - 1].element) {
          card.strengthLeft += 1;
          card.strengthUp += 1;
          card.strengthRight += 1;
          card.strengthDown += 1;
          var plus_one = new createjs.Bitmap('front_end/images/plus_one.png');
          plus_one.x = card.x + (cardWidth / 4);
          plus_one.y = card.y + (cardHeight / 3);
          stage.addChild(plus_one);
          stage.setChildIndex(plus_one, stage.getNumChildren() - 1);
        } else if (squares[selectedSquare - 1].element != 0 && card.element != squares[selectedSquare - 1].element) {
          card.strengthLeft -= 1;
          card.strengthUp -= 1;
          card.strengthRight -= 1;
          card.strengthDown -= 1;
          var minus_one = new createjs.Bitmap('front_end/images/minus_one.png');
          minus_one.x = card.x + (cardWidth / 4);
          minus_one.y = card.y + (cardHeight / 3);
          stage.addChild(minus_one);
          stage.setChildIndex(minus_one, stage.getNumChildren() - 1);
        }

        // Check If The Card Flipped Any Existing Cards
        flipCardsCheck();

        // Apply Logic
        stage.update();

        // Check If The Game Is Now Over
        if (board.indexOf("Empty") == -1) {
          endGame();
        } else {
          // Swap The Players
          player();
          // Re-select The Correct Card In The Hand
          if (playerTurn == "blue") {
            playedPlayerCardCount++;
            selectedCard = cardsInPlayerHand[selectedCardNumber];
            stage.addChild(playerHandCursor);
            selectedCard.x = selectedCard.x - 30;
            stage.setChildIndex(infoBox, stage.getNumChildren() - 1);
            infoBox.visible = true;
            playerChoosingCard = true;
          } else if (playerTurn == "red") {
            aiSelectedCard = cardsInAIHand[selectedCardNumber];
            aiTurn();
          }
        }
      }
    }

    // Shift Remaining Cards In Hand Down
    if (playerTurn == "blue") {
      for (var i = 0; i < cardsAboveSelection; i++) {
        // Animate The Transition
        createjs.Tween.get(cardsInPlayerHand[i]).to({
          "y": cardsInPlayerHand[i].y + handCardOffset
        }, 200);
      }
      if (selectedCardNumber == 0) {
        playerHandCursor.y += handCardOffset;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
      } else {
        selectedCardNumber -= 1;
        selectedCard = cardsInPlayerHand[selectedCardNumber];
        cardsAboveSelection -= 1;
      }

    } else if (playerTurn == "red") {
      for (var i = 0; i < aiCardsAboveSelection; i++) {
        // Animate The Transition
        createjs.Tween.get(cardsInAIHand[i]).to({
          "y": cardsInAIHand[i].y + handCardOffset
        }, 200);
      }
    }

  }

  // Check If A Card Needs To Be Flipped Over
  function flipCardsCheck() {
    if ((card.owner != card.cardLeft.owner) && (card.strengthLeft > card.cardLeft.strengthRight)) {
      flipCardOver('left');
    }
    if ((card.owner != card.cardUp.owner) && (card.strengthUp > card.cardUp.strengthDown)) {
      flipCardOver('up');
    }
    if ((card.owner != card.cardRight.owner) && (card.strengthRight > card.cardRight.strengthLeft)) {
      flipCardOver('right');
    }
    if ((card.owner != card.cardDown.owner) && (card.strengthDown > card.cardDown.strengthUp)) {
      flipCardOver('down');
    }
  }

  // Flip A Card Over
  function flipCardOver(direction) {

    // Default The Number Of Flipped Cards To 0 On Each Check
    var cardsFlipped = 0;

    // Invoke Flips
    if (direction == 'left') {
      card.cardLeft.owner = opponent;
      replaceCard(card.cardLeft, direction);
      cardsFlipped++;
    }
    if (direction == 'up') {
      card.cardUp.owner = opponent;
      replaceCard(card.cardUp, direction);
      cardsFlipped++;
    }
    if (direction == 'down') {
      card.cardDown.owner = opponent;
      replaceCard(card.cardDown, direction);
      cardsFlipped++;
    }
    if (direction == 'right') {
      card.cardRight.owner = opponent;
      replaceCard(card.cardRight, direction);
      cardsFlipped++;
    }

    // Update Card Counts
    if (playerTurn == "blue") {
      for (var i = 0; i < cardsFlipped; i++) {
        totalBlueCards++;
        totalRedCards--;
      }
    } else if (playerTurn == "red") {
      for (var i = 0; i < cardsFlipped; i++) {
        totalBlueCards--;
        totalRedCards++;
      }
    }
    updateCardCounts();

  }

  // Replace The Card Upon Flip
  function replaceCard(cardToReplace, direction) {
    // TODO: use 'direction' to flip that way
    cardToReplace.children[0].image.src = 'front_end/images/cards/' + opponent + '.png';
  }

  // Initiate A Card Flip
  function flipCard(card, direction) {
    sliceWidth = card.children[1].image.width * card.scaleX;
    sliceHeight = card.children[1].image.height * card.scaleY;
    sliceContainer.x = card.x + (sliceWidth / 2);
    sliceContainer.y = card.y;
    var slice = card;
    slice.sourceRect = new createjs.Rectangle(0, 0, 0, sliceWidth);
    slice.cache(0, 0, sliceWidth, sliceHeight);
    sliceContainer.addChild(slice);
    stage.addChild(sliceContainer);
    flipCard2(card, direction, 0);
  }

  // Handle Card Flip Main Logic
  function flipCard2(card, direction, counter) {
    if (counter < 180) {
      setTimeout(function() {
        counter++;
        if (counter == 90) {
          if (card.children[1].image.src.indexOf(card.backImage) !== -1) {
            var replacementImage = card.frontImage;
          } else {
            var replacementImage = card.backImage;
          }
          card.children[1].image.src = replacementImage;
          card.children[1].x += card.children[1].image.width;
          card.children[1].scaleX = -1;
        }
        if (direction == 'left') {
          flipLeft(counter);
        } else if (direction == 'right') {
          flipRight(counter);
        }
        flipCard2(card, direction, counter);
      }, 2);
    } else if (counter == 180) {
      // Finished Flipping
      // This Gets Called Only AFTER Animation, Regardless Of Animation Length!
      // Thus, It's A Great Place For Time Logic!
      var cardToAdd = sliceContainer.getChildAt(0);
      console.log(card.x); // 76.5
      console.log(sliceContainer.x); // 118
      cardToAdd.x = sliceContainer.x + card.x;
      cardToAdd.y = sliceContainer.y;
      stage.addChild(cardToAdd); // Probably Not The Most Elegant Solution
      sliceContainer.children.pop();
    }
  }

  // Flip A Card Left
  function flipLeft(value) {
    var l = sliceContainer.getNumChildren();
    for (var i = 0; i < l; i++) {
      var slice = sliceContainer.getChildAt(i);
      slice.y = Math.sin(value * degToRad) * -sliceWidth / 2;
      if (i % 2) {
        slice.skewY = value;
      } else {
        slice.skewY = -value;
        slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
      }
      slice.x = sliceWidth * (i - l / 2) * Math.cos(slice.skewY * degToRad);
      slice.updateCache();
    }
    stage.update();
  }

  // Flip A Card Right
  function flipRight(value) {
    var l = sliceContainer.getNumChildren();
    for (var i = 0; i < l; i++) {
      var slice = sliceContainer.getChildAt(i);
      slice.y = Math.sin(value * degToRad) * sliceWidth / 2;
      if (i % 2) {
        slice.skewY = -value;
      } else {
        slice.skewY = value;
        slice.y -= sliceWidth * Math.sin(slice.skewY * degToRad);
      }
      slice.x = sliceWidth * (i + l / -2) * Math.cos(slice.skewY * degToRad);
      slice.updateCache();
    }
    stage.update();
  }

  // End The Game
  function endGame() {

    // Calculate The Winner
    var winner;
    if (totalRedCards > totalBlueCards) {
      alert('lose');
    } else if (totalBlueCards > totalRedCards) {
      alert('win');
    } else {
      alert('draw');
      if (rules.indexOf("sudden_death") != -1) {
        startGame();
      }
    }

  }

  function clickHandler(event) {
    // Debug
    //console.log(board);
    console.log("++++++++++++++++++++++++++++++++++++");
    console.log("Cell ID: " + event.target.name);
    console.log("Cell Element: " + event.target.element);
    cardHere = board[event.target.name - 1];
    if (cardHere != "Empty") {
      console.log("Card In This Cell: " + cardHere.name);
      console.log("Card Owner: " + cardHere.owner);
      console.log("Card Strength Left: " + cardHere.strengthLeft);
      console.log("Card Strength Up: " + cardHere.strengthUp);
      console.log("Card Strength Right: " + cardHere.strengthRight);
      console.log("Card Strength Down: " + cardHere.strengthDown);
      console.log("Card Element: " + cardHere.element);
      console.log("(WHEN PLAYED) Card To The Left: " + cardHere.cardLeft.name);
      console.log("(WHEN PLAYED) Card Above: " + cardHere.cardUp.name);
      console.log("(WHEN PLAYED) Card To The Right: " + cardHere.cardRight.name);
      console.log("(WHEN PLAYED) Card Below: " + cardHere.cardDown.name);
    } else {
      console.log("Card In This Cell: NONE");

    }
    console.log("++++++++++++++++++++++++++++++++++++");
  }

  $(document).ready(function() {
    init();
  });
</script>