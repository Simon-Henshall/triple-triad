window.Game = window.Game || {};
(function (Game) {
  // safe guard: if previously initialized, destroy first
  if (Game.initialized && typeof Game.destroy === "function") {
    console.log("Game: previous instance found — destroying before re-init");
    try {
      Game.destroy();
    } catch (e) {
      console.warn("Game.destroy failed", e);
    }
  }

  Game.initialized = false;

  Game.destroy = function () {
    try {
      // stop createjs Ticker (if used)
      if (createjs && createjs.Ticker) {
        createjs.Ticker.removeAllEventListeners();
        try {
          createjs.Ticker.reset && createjs.Ticker.reset();
        } catch (e) {}
      }
      // stage cleanup
      if (Game.stage) {
        try {
          Game.stage.removeAllChildren();
          Game.stage.removeAllEventListeners &&
            Game.stage.removeAllEventListeners();
        } catch (e) {
          console.warn(e);
        }
      }
      // remove any DOM listeners you registered
      if (Game._listeners && Array.isArray(Game._listeners)) {
        Game._listeners.forEach(function (l) {
          try {
            window.removeEventListener(l.event, l.fn);
          } catch (e) {}
          try {
            document.removeEventListener(l.event, l.fn);
          } catch (e) {}
        });
      }
      // clear any intervals/timeouts the game created
      if (Game._intervals) {
        Game._intervals.forEach((id) => clearInterval(id));
      }
      if (Game._timeouts) {
        Game._timeouts.forEach((id) => clearTimeout(id));
      }
      // clear references
      Game.stage = null;
      Game.assets = null;
      Game.cursor = null;
      // ...and anything else you attach to Game during runtime
    } finally {
      Game.initialized = false;
      console.log("Game destroyed");
    }
  };

  Game.bootstrap = function (options) {
    options = options || {};
    // small helper registries for teardown bookkeeping
    Game._listeners = Game._listeners || [];
    Game._intervals = Game._intervals || [];
    Game._timeouts = Game._timeouts || [];

    // hookup a single asset loader if none exists
    if (!Game.assets) {
      var queue = new createjs.LoadQueue(false);
      // example: queue.loadManifest([...]); // leave manifest for main.js
      Game.assets = queue;
      Game.assets.loaded = new Promise(function (resolve) {
        queue.on("complete", function () {
          resolve();
        });
        queue.on("error", function (err) {
          console.error("assets load error", err);
          resolve();
        });
      });
    }
  };

  // mark ready
  Game.initialized = false;
})(window.Game);

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
  cardWidth: 0,
  cardHeight: 0,
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
  infoBox: null,
  infoBoxCardName: undefined,
  cardName: undefined,
  cardCount: undefined,
  selectedCardNumber: 0,
  selectedCard: undefined,
  card: undefined,
  cardImage: undefined,
  previouslySelectedCard: [],
  playerSelectingHand: false,
  playerConfirming: false,
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
var playerCards = [],
  ownedCards,
  selectedCards,
  playerHand,
  squares,
  square,
  squareLeft,
  squareUp,
  squareRight,
  squareDown,
  selectionBoardBackground,
  remainingCards,
  selectedHandCardNumber,
  selectedHandCard,
  confirmationBackground,
  confirmationCursor,
  selectedConfirmationChoice,
  infoBoxCardName,
  cardName,
  cardCount,
  card,
  cardImage,
  alpha,
  rules;

// -------------------------
// CORE: Initialization
// -------------------------
function handleTick() {
  Game.stage.update();
}

function init() {
  initStage();
  initOffsets();
  initHandPositions();
  initCursors();
  initUIContainers();
  bindEvents();
  loadInitialCards();

  // Legacy global aliases
  playerCards = Game.player.playerCards;
  ownedCards = Game.player.ownedCards;
  selectedCards = Game.player.selectedCards;
  playerHand = Game.player.playerHand;

  squares = Game.ui.squares;
  square = Game.ui.square;

  selectionBoardBackground = Game.ui.selectionBoardBackground;
  remainingCards = Game.ui.remainingCards;
  selectedHandCardNumber = Game.ui.selectedHandCardNumber;
  selectedHandCard = Game.ui.selectedHandCard;

  confirmationBackground = Game.ui.confirmationBackground;
  confirmationCursor = Game.ui.confirmationCursor;
  selectedConfirmationChoice = Game.ui.selectedConfirmationChoice;

  infoBoxCardName = Game.ui.infoBoxCardName;

  rules = Game.rules;
  alpha = Game.alpha;
}

function initStage() {
  Game.stage = new createjs.Stage("gameArea");
  createjs.Ticker.setFPS(Game.config.fps);
  createjs.Ticker.addEventListener("tick", handleTick);

  Game.stageWidth = Game.stage.canvas.width;
  Game.stageHeight = Game.stage.canvas.height;
}

function initOffsets() {
  // Card size
  Game.offsets.cardWidth = Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2;
  Game.offsets.cardHeight = Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2;
}

function initHandPositions() {
  Game.player.handOffsetX = Game.offsets.gameOffsetX + Game.offsets.cellWidth * 3 + Game.offsets.cardWidth / 4;
  Game.ai.handOffsetX = Game.offsets.gameOffsetX / 2 - Game.offsets.cardWidth / 2;
}

function initCursors() {
  Game.player.playerHandCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  Game.player.playerHandSelectionCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
  Game.ui.gridCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );
}

function initUIContainers() {
  // Main containers
  Game.ui.selectionBoard = new createjs.Container();
  Game.ui.shownCards = new createjs.Container();
  Game.ui.confirmation = new createjs.Container();
  Game.ui.infoBox = new createjs.Container();
  Game.ui.previouslySelectedCard = [];

  // Aliases for convenience
  confirmationBackground = Game.ui.confirmationBackground =
    new createjs.Shape();
  confirmationCursor = Game.ui.confirmationCursor = new createjs.Bitmap(
    Game.config.imagePath + "cursor.png"
  );

  // Confirmation state
  Game.ui.selectedConfirmationChoice = 0;
  selectedConfirmationChoice = Game.ui.selectedConfirmationChoice;
}

function bindEvents() {
  document.addEventListener("keydown", checkKey);
}

function loadInitialCards() {
  addBackground();

  if (typeof ajaxCall === "function") {
    ajaxCall(pickPlayerCards);
  } else if (typeof pickPlayerCards === "function") {
    pickPlayerCards();
  }
}

// Start The Game
function startGame() {
  generateGrid();
  populatePlayerCards(playerCards);

  // Debugging
  logHands(); // shows initial hands for player and AI
  logBoard(); // empty board
  logTurn(); // shows who starts

  drawCardCounts();
  drawInfoBox();
  placePlayerHandCursor();
}

// Choose Which Cards To Play With (Currently Random Cards)
function populatePlayerCards(playerCardsParam) {
  // Calculate The Current Player
  Game.utils.togglePlayerTurn();

  // Shuffle and copy hand
  playerHand = Game.utils.shuffle([...playerCardsParam]).slice(0, 5);

  for (let i = 0; i < playerHand.length; i++) {
    const chosenCard = playerHand[i];

    // Transparent card data
    const cardImage = new createjs.Bitmap(
      `${Game.config.cardPath}${chosenCard.image}.png`
    );
    // Card Background Colour
    const cardColour = new createjs.Bitmap(
      `${Game.config.cardPath}${Game.utils.getPlayerTurn()}.png`
    );

    // Card Container
    const card = new createjs.Container();
    card.addChild(cardColour, cardImage);

    // Adjust The Card For The Board
    card.scaleX = Game.offsets.cardWidth / card.children[0].image.width;
    card.scaleY = Game.offsets.cardHeight / card.children[0].image.height;

    // Assign stats
    card.name = chosenCard.displayName;
    card.strengthUp = chosenCard.strengthUp;
    card.strengthRight = chosenCard.strengthRight;
    card.strengthDown = chosenCard.strengthDown;
    card.strengthLeft = chosenCard.strengthLeft;
    card.element = chosenCard.element;
    card.owner = card.background = Game.utils.getPlayerTurn();

    // Place The Card
    card.x = Game.player.handOffsetX;
    card.y = Game.offsets.handOffsetY + i * Game.offsets.handCardOffset;
    Game.player.cardsInPlayerHand.push(card);
    Game.stage.addChild(card);
    Game.stage.update();
  }

  // Select The Top Card By Default
  Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];
  Game.ui.previouslySelectedCard = [];

  // Indent The Chosen Card
  indentSelectedCard();

  // Ready For The Player To Choose Which Card To Play
  Game.ui.playerConfirming = false;
  Game.ui.playerChoosingCard = true;
}

// Indent The Selected Card
function indentSelectedCard() {
  if (Game.utils.getPlayerTurn() == "red") {
    if (Game.ui.selectedCard && typeof Game.ui.selectedCard.x !== "undefined") {
      Game.ui.selectedCard.x = Game.ui.selectedCard.x + 30;
    }
    if (
      Game.ui.previouslySelectedCard &&
      typeof Game.ui.previouslySelectedCard.x !== "undefined"
    ) {
      Game.ui.previouslySelectedCard.x = Game.ui.previouslySelectedCard.x - 30;
    }
  } else if (Game.utils.getPlayerTurn() == "blue") {
    if (Game.ui.selectedCard && typeof Game.ui.selectedCard.x !== "undefined") {
      Game.ui.selectedCard.x = Game.ui.selectedCard.x - 30;
    }
    if (
      Game.ui.previouslySelectedCard &&
      typeof Game.ui.previouslySelectedCard.x !== "undefined"
    ) {
      Game.ui.previouslySelectedCard.x = Game.ui.previouslySelectedCard.x + 30;
    }
  }
  Game.stage.update();
}

// -------------------------
// END GAME
// -------------------------

function endGame() {
  // Calculate The Winner
  var winner;
  if (Game.ai.totalRedCards > Game.player.totalBlueCards) {
    alert("lose");
  } else if (Game.player.totalBlueCards > Game.ai.totalRedCards) {
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
