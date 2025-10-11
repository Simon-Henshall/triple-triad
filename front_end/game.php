<div id="game">
  <canvas id="gameArea" width="950" height="650"></canvas>
</div>

<!-- Cards -->
<script type="text/javascript" src="front_end/js/cards.js"></script>
<script type="text/javascript" src="front_end/js/getPlayerCards.js"></script>
<script type="text/javascript" src="front_end/js/grid.js"></script>
<script type="text/javascript" src="front_end/js/cardFlipping.js"></script>
<script type="text/javascript" src="front_end/js/cardPlacement.js"></script>

<script>
/*
  Refactored with a Game namespace for maintainability.
  All original top-level var names are preserved as aliases pointing at Game.* members
  — so external files that reference those globals will continue to work.
*/

var Game = Game || {};

// CONFIG + CONSTANTS
Game.config = {
  imagePath: 'front_end/images/',
  cardPath: 'front_end/images/cards/',
  fps: 60
};

// OFFSETS & DIMENSIONS
Game.offsets = {
  gameOffsetX: 236,
  gameOffsetY: 50,
  handOffsetY: 50, // set to gameOffsetY below in init aliasing
  handCardOffset: 95,
  cellWidth: 159,
  cellHeight: 184,
  cardOffsetX: 3,
  cardOffsetY: 3
};

// GAME STATE - players, ui, board
Game.player = {
  handOffsetX: 0, // calculated in init
  playerCards: [],
  ownedCards: [],
  selectedCards: [],
  cardsInPlayerHand: [],
  playerHand: [],
  cardsAboveSelection: undefined,
  playerCardCount: undefined,
  playedPlayerCardCount: 0,
  totalBlueCards: 5,
  playerHandCursor: null,
  playerHandSelectionCursor: null
};

Game.ai = {
  handOffsetX: 0, // calculated in init
  cardsInAIHand: [],
  aiCardsAboveSelection: undefined,
  aiCardCount: undefined,
  aiDelay: 1000,
  totalRedCards: 5,
  aiHandCursor: null
};

Game.ui = {
  squares: [],
  square: undefined,
  selectedRow: 2,
  selectedColumn: 2,
  selectedSquare: 5,
  selectedAISquare: undefined,
  squareLeft: undefined,
  squareUp: undefined,
  squareRight: undefined,
  squareDown: undefined,
  gridCursor: null,
  selectionBoard: null,
  selectionBoardBackground: undefined,
  shownCards: null,
  page: undefined,
  pageDisplay: undefined,
  totalPages: undefined,
  displayedCards: undefined,
  displayedCard: undefined,
  displayedCardImage: undefined,
  displayedCardColour: undefined,
  remainingCards: undefined,
  selectedHandCardNumber: undefined,
  selectedHandCard: undefined,

  confirmation: null,
  confirmationBackground: null,
  confirmationCursor: null,
  selectedConfirmationChoice: 0,
  playerConfirming: false,

  infoBox: null,
  infoBoxCardName: undefined,
  cardName: undefined,
  cardCount: undefined,
  selectedCardNumber: undefined,
  selectedCard: undefined,
  card: undefined,
  cardImage: undefined,
  previouslySelectedCard: undefined,
  playerSelectingHand: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerTurn: "red",
  
};

function getPlayerTurn() { return Game.ui.playerTurn; }
function setPlayerTurn(value) { Game.ui.playerTurn = value; }

// Debug visibility
Game.alpha = 0.01;

// Rules
Game.rules = [
  // "open",
  // "random",
  "elemental"
  // "sudden_death"
];

// Board data
Game.board = {
  boardArray: ["Empty","Empty","Empty","Empty","Empty","Empty","Empty","Empty","Empty"],
  freeCells: [1,2,3,4,5,6,7,8,9]
};

// Stage (will be created in init)
Game.stage = null;
Game.stageWidth = 0;
Game.stageHeight = 0;

// ---------------------------------------------------------------------
// Create global aliases for backwards compatibility with external files
// (We assign them during init so everything points to the same objects.)
// ---------------------------------------------------------------------
var stage,
    stageWidth,
    stageHeight,
    gameOffsetX,
    gameOffsetY,
    handOffsetY,
    handCardOffset,
    cellWidth,
    cellHeight,
    cardOffsetX,
    cardOffsetY,
    cardWidth,
    cardHeight,

    playerHandOffsetX,
    playerCards = [], // kept for compatibility but will be set to Game.player.playerCards
    ownedCards,
    selectedCards,
    cardsInPlayerHand,
    playerHand,
    cardsAboveSelection,
    playerCardCount,
    playedPlayerCardCount,
    totalBlueCards,
    playerHandCursor,
    playerHandSelectionCursor,

    aiHandOffsetX,
    cardsInAIHand,
    aiCardsAboveSelection,
    aiCardCount,
    aiDelay,
    totalRedCards,
    aiHandCursor,

    squares,
    square,
    selectedRow,
    selectedColumn,
    selectedSquare,
    selectedAISquare,
    squareLeft,
    squareUp,
    squareRight,
    squareDown,
    gridCursor,

    selectionBoard,
    selectionBoardBackground,
    shownCards,
    page,
    pageDisplay,
    totalPages,
    displayedCards,
    displayedCard,
    displayedCardImage,
    displayedCardColour,
    remainingCards,
    selectedHandCardNumber,
    selectedHandCard,

    confirmation,
    confirmationBackground,
    confirmationCursor,
    selectedConfirmationChoice,
    playerConfirming,

    infoBox,
    infoBoxCardName,
    cardName,
    cardCount,
    selectedCardNumber,
    selectedCard,
    card,
    cardImage,
    previouslySelectedCard,
    playerSelectingHand,
    playerChoosingCard,
    playerSelectingPlacement,

    alpha,

    rules,

    board,
    freeCells;

// ---------------------------------------------------------------------
// CORE: initialization + tick + binding
// ---------------------------------------------------------------------
function handleTick() {
  // unchanged logic; stage alias will point to Game.stage
  stage.update();
}

function init() {
  // Create stage and tie global aliases to Game.* structures
  Game.stage = new createjs.Stage("gameArea");
  createjs.Ticker.setFPS(Game.config.fps);
  createjs.Ticker.addEventListener("tick", handleTick);

  // expose stage globals
  stage = Game.stage;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;
  Game.stageWidth = stageWidth;
  Game.stageHeight = stageHeight;

  // dimensions & offsets - put into Game.offsets and apply aliases
  Game.offsets.handOffsetY = Game.offsets.gameOffsetY; // preserve original handOffsetY semantics
  gameOffsetX = Game.offsets.gameOffsetX;
  gameOffsetY = Game.offsets.gameOffsetY;
  handOffsetY = Game.offsets.handOffsetY;
  handCardOffset = Game.offsets.handCardOffset;
  cellWidth = Game.offsets.cellWidth;
  cellHeight = Game.offsets.cellHeight;
  cardOffsetX = Game.offsets.cardOffsetX;
  cardOffsetY = Game.offsets.cardOffsetY;
  cardWidth = (cellWidth - (cardOffsetX * 2));
  cardHeight = (cellHeight - (cardOffsetY * 2));

  // Player offsets and objects
  playerHandOffsetX = gameOffsetX + (cellWidth * 3) + (cardWidth / 4);
  Game.player.handOffsetX = playerHandOffsetX;

  // Setup Game.player arrays / references
  Game.player.playerCards = Game.player.playerCards || [];
  Game.player.ownedCards = Game.player.ownedCards || [];
  Game.player.selectedCards = Game.player.selectedCards || [];
  Game.player.cardsInPlayerHand = Game.player.cardsInPlayerHand || [];
  Game.player.playerHand = Game.player.playerHand || [];
  Game.player.cardsAboveSelection = Game.player.cardsAboveSelection;
  Game.player.playerCardCount = Game.player.playerCardCount;
  Game.player.playedPlayerCardCount = Game.player.playedPlayerCardCount || 0;
  Game.player.totalBlueCards = Game.player.totalBlueCards || 5;

  // AI offsets
  aiHandOffsetX = (gameOffsetX / 2) - (cardWidth / 2);
  Game.ai.handOffsetX = aiHandOffsetX;
  Game.ai.cardsInAIHand = Game.ai.cardsInAIHand || [];
  Game.ai.aiCardsAboveSelection = Game.ai.aiCardsAboveSelection;
  Game.ai.aiCardCount = Game.ai.aiCardCount;
  Game.ai.aiDelay = Game.ai.aiDelay || 1000;
  Game.ai.totalRedCards = Game.ai.totalRedCards || 5;

  // Create cursors (preserve original global names by aliasing)
  Game.player.playerHandCursor = new createjs.Bitmap(Game.config.imagePath + 'cursor.png');
  Game.player.playerHandSelectionCursor = new createjs.Bitmap(Game.config.imagePath + 'cursor.png');
  Game.ai.aiHandCursor = new createjs.Bitmap(Game.config.imagePath + 'cursor.png');
  Game.ui.gridCursor = new createjs.Bitmap(Game.config.imagePath + 'cursor.png');

  // assign global aliases so existing external code still works
  playerHandCursor = Game.player.playerHandCursor;
  playerHandSelectionCursor = Game.player.playerHandSelectionCursor;
  aiHandCursor = Game.ai.aiHandCursor;
  gridCursor = Game.ui.gridCursor;

  // UI containers and selection structures
  Game.ui.selectionBoard = new createjs.Container();
  Game.ui.selectionBoardBackground = Game.ui.selectionBoardBackground || undefined;
  Game.ui.shownCards = new createjs.Container();
  Game.ui.page = Game.ui.page;
  Game.ui.pageDisplay = Game.ui.pageDisplay;
  Game.ui.totalPages = Game.ui.totalPages;
  Game.ui.displayedCards = Game.ui.displayedCards;
  Game.ui.displayedCard = Game.ui.displayedCard;
  Game.ui.displayedCardImage = Game.ui.displayedCardImage;
  Game.ui.displayedCardColour = Game.ui.displayedCardColour;
  Game.ui.remainingCards = Game.ui.remainingCards;
  Game.ui.selectedHandCardNumber = Game.ui.selectedHandCardNumber;
  Game.ui.selectedHandCard = Game.ui.selectedHandCard;

  // Confirmation box
  Game.ui.confirmation = new createjs.Container();
  Game.ui.confirmationBackground = new createjs.Shape();
  Game.ui.confirmationCursor = new createjs.Bitmap(Game.config.imagePath + 'cursor.png');
  Game.ui.selectedConfirmationChoice = 0;
  Game.ui.playerConfirming = false;

  // Info box
  Game.ui.infoBox = new createjs.Container();
  Game.ui.infoBoxCardName = undefined;
  Game.ui.selectedCardNumber = undefined;
  Game.ui.selectedCard = undefined;
  Game.ui.card = undefined;
  Game.ui.cardImage = undefined;
  Game.ui.previouslySelectedCard = [];

  // state aliases
  playerCards = Game.player.playerCards;
  ownedCards = Game.player.ownedCards;
  selectedCards = Game.player.selectedCards;
  cardsInPlayerHand = Game.player.cardsInPlayerHand;
  playerHand = Game.player.playerHand;
  cardsAboveSelection = Game.player.cardsAboveSelection;
  playerCardCount = Game.player.playerCardCount;
  playedPlayerCardCount = Game.player.playedPlayerCardCount;
  totalBlueCards = Game.player.totalBlueCards;

  cardsInAIHand = Game.ai.cardsInAIHand;
  aiCardsAboveSelection = Game.ai.aiCardsAboveSelection;
  aiCardCount = Game.ai.aiCardCount;
  aiDelay = Game.ai.aiDelay;
  totalRedCards = Game.ai.totalRedCards;

  squares = Game.ui.squares;
  square = Game.ui.square;
  selectedRow = Game.ui.selectedRow;
  selectedColumn = Game.ui.selectedColumn;
  selectedSquare = Game.ui.selectedSquare;
  selectedAISquare = Game.ui.selectedAISquare;

  selectionBoard = Game.ui.selectionBoard;
  selectionBoardBackground = Game.ui.selectionBoardBackground;
  shownCards = Game.ui.shownCards;
  page = Game.ui.page;
  pageDisplay = Game.ui.pageDisplay;
  totalPages = Game.ui.totalPages;
  displayedCards = Game.ui.displayedCards;
  displayedCard = Game.ui.displayedCard;
  displayedCardImage = Game.ui.displayedCardImage;
  displayedCardColour = Game.ui.displayedCardColour;
  remainingCards = Game.ui.remainingCards;
  selectedHandCardNumber = Game.ui.selectedHandCardNumber;
  selectedHandCard = Game.ui.selectedHandCard;

  confirmation = Game.ui.confirmation;
  confirmationBackground = Game.ui.confirmationBackground;
  confirmationCursor = Game.ui.confirmationCursor;
  selectedConfirmationChoice = Game.ui.selectedConfirmationChoice;
  playerConfirming = Game.ui.playerConfirming;

  infoBox = Game.ui.infoBox;
  infoBoxCardName = Game.ui.infoBoxCardName;
  previouslySelectedCard = Game.ui.previouslySelectedCard;

  Game.rules = Game.rules || ["elemental"];
  rules = Game.rules;

  board = Game.board.boardArray;
  freeCells = Game.board.freeCells;

  alpha = Game.alpha;

  // preserve original key binding
  document.onkeydown = checkKey;

  // Add initial background and then ajax call as before
  addBackground();
  ajaxCall(pickPlayerCards);
}

// ---------------------------------------------------------------------
// RENDERING / UI functions (bodies left logically unchanged)
// ---------------------------------------------------------------------

function addBackground() {
  var background = new createjs.Bitmap('front_end/images/board.png');
  background.x = 0;
  background.y = 0;
  stage.addChild(background);
  stage.update();
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
function populatePlayerCards(playerCardsParam) {

  // Calculate The Current Player
  player();

  // Setup Player Hand
  playerHand = shuffle(playerCardsParam);
  playerHand = $.extend({}, playerCardsParam);
  playerHand.length = 5;

  for (var i = 0; i < playerHand.length; i++) {
    // Grab The Correct Card Graphically
    var chosen_card = playerHand[i];
    cardImage = new createjs.Bitmap('front_end/images/cards/' + chosen_card.image + '.png');

    // Card Background Colour
    cardColour = new createjs.Bitmap('front_end/images/cards/' + getPlayerTurn() + '.png');

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
    card.owner = card.background = getPlayerTurn();
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
  if (getPlayerTurn() == "red") {
    selectedCard.x = selectedCard.x + 30;
    previouslySelectedCard.x = previouslySelectedCard.x - 30;
  } else if (getPlayerTurn() == "blue") {
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
        CardPlacer.placeCard(
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

// ---------------------------------------------------------------------
// GAME LOGIC functions (left unchanged)
// ---------------------------------------------------------------------

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
    CardPlacer.placeCard(
      aiSelectedCard,
      (gameOffsetX + (cellWidth * (selectedColumn - 1)) + cardOffsetX),
      (gameOffsetY + (cellHeight * (selectedRow - 1)) + cardOffsetY)
    );
  }, aiDelay);
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
  Game.ui.playerTurn = Game.ui.playerTurn === "red" ? "blue" : "red";
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

// preserve original ready call
$(document).ready(function() {
  init();
});
</script>
