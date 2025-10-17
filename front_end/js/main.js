var Game = Game || {};

// -------------------------
// CONFIG + CONSTANTS
// -------------------------
Game.config = {
  imagePath: "front_end/images/",
  cardPath: "front_end/images/cards/",
  fps: 60,
};

Game.offsets = {
  gameOffsetX: 236,
  gameOffsetY: 50,
  handOffsetY: 50,
  handCardOffset: 95,
  cellWidth: 159,
  cellHeight: 184,
  cardOffsetX: 3,
  cardOffsetY: 3,
};

Game.player = {
  handOffsetX: 0,
  playerCards: [],
  ownedCards: [],
  selectedCards: [],
  cardsInPlayerHand: [],
  playerHand: [],
  cardsAboveSelection: 0,
  playerCardCount: 0,
  playedPlayerCardCount: 0,
  totalBlueCards: 5,
  playerHandCursor: null,
  playerHandSelectionCursor: null,
};

Game.ai = {
  handOffsetX: 0,
  cardsInAIHand: [],
  aiCardsAboveSelection: 0,
  aiCardCount: 0,
  aiDelay: 1000,
  totalRedCards: 5,
  aiHandCursor: null,
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
  previouslySelectedCard: [],
  playerSelectingHand: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerTurn: "red",
};

Game.alpha = 0.01;
Game.rules = ["elemental"];

Game.board = {
  boardArray: Array(9).fill("Empty"),
  freeCells: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

Game.stage = null;
Game.stageWidth = 0;
Game.stageHeight = 0;

// -------------------------
// LEGACY GLOBALS (aliases)
// -------------------------
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
  playerCards = [],
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

// -------------------------
// CORE: Initialization
// -------------------------
function handleTick() {
  stage.update();
}

function init() {
  // Stage
  Game.stage = new createjs.Stage("gameArea");
  createjs.Ticker.setFPS(Game.config.fps);
  createjs.Ticker.addEventListener("tick", handleTick);

  stage = Game.stage;
  stageWidth = stage.canvas.width;
  stageHeight = stage.canvas.height;
  Game.stageWidth = stageWidth;
  Game.stageHeight = stageHeight;

  // Offsets and dimensions
  Game.offsets.handOffsetY = Game.offsets.gameOffsetY;
  gameOffsetX = Game.offsets.gameOffsetX;
  gameOffsetY = Game.offsets.gameOffsetY;
  handOffsetY = Game.offsets.handOffsetY;
  handCardOffset = Game.offsets.handCardOffset;
  cellWidth = Game.offsets.cellWidth;
  cellHeight = Game.offsets.cellHeight;
  cardOffsetX = Game.offsets.cardOffsetX;
  cardOffsetY = Game.offsets.cardOffsetY;
  cardWidth = cellWidth - cardOffsetX * 2;
  cardHeight = cellHeight - cardOffsetY * 2;

  // Player & AI hand positions
  playerHandOffsetX = gameOffsetX + cellWidth * 3 + cardWidth / 4;
  Game.player.handOffsetX = playerHandOffsetX;

  aiHandOffsetX = gameOffsetX / 2 - cardWidth / 2;
  Game.ai.handOffsetX = aiHandOffsetX;

  // -------------------------
  // Cursors
  // -------------------------
  Game.player.playerHandCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  Game.player.playerHandSelectionCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  Game.ai.aiHandCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  Game.ui.gridCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );

  playerHandCursor = Game.player.playerHandCursor;
  playerHandSelectionCursor = Game.player.playerHandSelectionCursor;
  aiHandCursor = Game.ai.aiHandCursor;
  gridCursor = Game.ui.gridCursor;

  // -------------------------
  // UI Containers
  // -------------------------
  Game.ui.selectionBoard = new createjs.Container();
  selectionBoard = Game.ui.selectionBoard;

  Game.ui.shownCards = new createjs.Container();
  shownCards = Game.ui.shownCards;

  Game.ui.confirmation = new createjs.Container();
  confirmation = Game.ui.confirmation;
  Game.ui.confirmationBackground = new createjs.Shape();
  confirmationBackground = Game.ui.confirmationBackground;
  Game.ui.confirmationCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  confirmationCursor = Game.ui.confirmationCursor;
  selectedConfirmationChoice = Game.ui.selectedConfirmationChoice = 0;
  playerConfirming = Game.ui.playerConfirming = false;

  Game.ui.infoBox = new createjs.Container();
  infoBox = Game.ui.infoBox;
  Game.ui.previouslySelectedCard = previouslySelectedCard = [];

  // -------------------------
  // State aliases (legacy globals)
  // -------------------------
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

  // Key binding
  document.onkeydown = checkKey;

  // Add initial background and call ajax
  addBackground();
  if (typeof ajaxCall === "function") {
    ajaxCall(pickPlayerCards);
  } else {
    // Fallback if ajaxCall isn't present (should be in getPlayerCards.js)
    if (typeof pickPlayerCards === "function") {
      pickPlayerCards();
    }
  }
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

// Choose Which Cards To Play With (Currently Random Cards)
function populatePlayerCards(playerCardsParam) {
  // Calculate The Current Player
  player();

  // Shuffle and copy hand
  playerHand = shuffle([...playerCardsParam]).slice(0, 5);

  for (let i = 0; i < playerHand.length; i++) {
    const chosenCard = playerHand[i];

    // Transparent card data
    const cardImage = new createjs.Bitmap(
      `${Game.config.cardPath}${chosenCard.image}.png`
    );
    // Card Background Colour
    const cardColour = new createjs.Bitmap(
      `${Game.config.cardPath}${getPlayerTurn()}.png`
    );

    // Card Container
    const card = new createjs.Container();
    card.addChild(cardColour, cardImage);

    // Adjust The Card For The Board
    card.scaleX = cardWidth / card.children[0].image.width;
    card.scaleY = cardHeight / card.children[0].image.height;

    // Assign stats
    card.name = chosenCard.displayName;
    card.strengthUp = chosenCard.strengthUp;
    card.strengthRight = chosenCard.strengthRight;
    card.strengthDown = chosenCard.strengthDown;
    card.strengthLeft = chosenCard.strengthLeft;
    card.element = chosenCard.element;
    card.owner = card.background = getPlayerTurn();

    // Place The Card
    card.x = playerHandOffsetX;
    card.y = handOffsetY + i * handCardOffset;
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
    if (selectedCard && typeof selectedCard.x !== "undefined") {
      selectedCard.x = selectedCard.x + 30;
    }
    if (
      previouslySelectedCard &&
      typeof previouslySelectedCard.x !== "undefined"
    ) {
      previouslySelectedCard.x = previouslySelectedCard.x - 30;
    }
  } else if (getPlayerTurn() == "blue") {
    if (selectedCard && typeof selectedCard.x !== "undefined") {
      selectedCard.x = selectedCard.x - 30;
    }
    if (
      previouslySelectedCard &&
      typeof previouslySelectedCard.x !== "undefined"
    ) {
      previouslySelectedCard.x = previouslySelectedCard.x + 30;
    }
  }
  stage.update();
}

// -------------------------
// END GAME
// -------------------------

function endGame() {
  // Calculate The Winner
  var winner;
  if (totalRedCards > totalBlueCards) {
    alert("lose");
  } else if (totalBlueCards > totalRedCards) {
    alert("win");
  } else {
    alert("draw");
    if (rules.includes("sudden_death")) {
      startGame();
    }
  }
}

// -------------------------
// DOCUMENT READY
// -------------------------

document.addEventListener("DOMContentLoaded", init);
