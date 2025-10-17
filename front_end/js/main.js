// -------------------------
// Triple Triad - Main.js
// -------------------------

// -------------------------
// AI Hand generator
// -------------------------
function generateAIHand() {
  const fallback = window.cards || [];
  return fallback
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map((c) => Object.assign({}, c)); // deep copy
}
window.generateAIHand = generateAIHand;

// -------------------------
// Ensure Game object
// -------------------------
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

// -------------------------
// PLAYER / AI / UI STATE
// -------------------------
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
  gridCursor: null,
  selectionBoard: null,
  selectionBoardBackground: undefined,
  shownCards: null,
  page: 1,
  totalPages: 1,
  displayedCards: [],
  displayedCard: undefined,
  displayedCardImage: undefined,
  displayedCardColour: undefined,
  remainingCards: 0,
  selectedHandCardNumber: 0,
  selectedHandCard: undefined,
  confirmation: null,
  confirmationBackground: null,
  confirmationCursor: null,
  selectedConfirmationChoice: 0,
  playerConfirming: false,
  infoBox: null,
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
// CORE: Tick
// -------------------------
Game.handleTick = () => {
  if (Game.stage) Game.stage.update();
};

// -------------------------
// INIT: Sets up canvas, containers, cursors
// -------------------------
Game.init = async () => {
  console.log("🎮 Initialising Triple Triad...");

  // Stage setup
  Game.stage = new createjs.Stage("gameArea");
  createjs.Ticker.setFPS(Game.config.fps);
  createjs.Ticker.addEventListener("tick", Game.handleTick);

  Game.stageWidth = Game.stage.canvas.width;
  Game.stageHeight = Game.stage.canvas.height;

  // Offsets
  Game.offsets.handOffsetY = Game.offsets.gameOffsetY;
  Game.player.handOffsetX =
    Game.offsets.gameOffsetX +
    Game.offsets.cellWidth * 3 +
    (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / 4;
  Game.ai.handOffsetX =
    Game.offsets.gameOffsetX / 2 -
    (Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2) / 2;

  // Cursors
  Game.player.playerHandCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
  Game.player.playerHandSelectionCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
  Game.ai.aiHandCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
  Game.ui.gridCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");

  // UI Containers
  Game.ui.selectionBoard = new createjs.Container();
  Game.ui.shownCards = new createjs.Container();
  Game.ui.confirmation = new createjs.Container();
  Game.ui.confirmationBackground = new createjs.Shape();
  Game.ui.confirmationCursor = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
  Game.ui.infoBox = new createjs.Container();
  Game.ui.previouslySelectedCard = [];

  // Legacy globals (needed by selectionBoardCards.js)
  window.selectionBoard = Game.ui.selectionBoard;
  window.shownCards = Game.ui.shownCards;
  window.confirmation = Game.ui.confirmation;
  window.confirmationBackground = Game.ui.confirmationBackground;
  window.confirmationCursor = Game.ui.confirmationCursor;

  // Bind key handler
  document.onkeydown = checkKey;

  // Background
  if (typeof addBackground === "function") addBackground();

  // -------------------------
  // Ensure PlayerCardManager exists
  // -------------------------
  if (!window.__playerCardManager) {
    try {
      window.__playerCardManager = new PlayerCardManager(window.ownedCards || []);
      console.log("✅ PlayerCardManager created");
    } catch (err) {
      console.warn("⚠️ PlayerCardManager missing; fallback shim applied");
      window.__playerCardManager = {
        pickPlayerCards: () =>
          typeof pickPlayerCards === "function" ? pickPlayerCards() : [],
        updateDisplayedCard: () => {},
        updateHandCards: () => {},
      };
    }
  }

  const manager = window.__playerCardManager;

  // -------------------------
  // Load player cards (populate selection board)
  // -------------------------
  if (manager && typeof manager.pickPlayerCards === "function") {
    await manager.pickPlayerCards();
  } else {
    console.warn("⚠️ No card manager available; selection board empty");
  }

  // -------------------------
  // Start card selection phase
  // -------------------------
  Game.startCardSelectionPhase();
};

// -------------------------
// START CARD SELECTION PHASE
// -------------------------
Game.startCardSelectionPhase = () => {
  console.log("🃏 Starting card selection phase...");

  const manager = window.__playerCardManager;

  if (!manager || !window.ownedCards || window.ownedCards.length === 0) {
    console.warn("⚠️ Cannot start selection; no cards available.");
    return;
  }

  // The selectionBoardCards.js handles vertical layout, names, preview, cursor, etc.
  // We just ensure it populates the current page
  if (typeof window.populateSelectionBoardCardsShim === "function") {
    window.populateSelectionBoardCardsShim(window.ownedCards);
  }

  // Enable player interaction
  Game.ui.playerSelectingHand = true;

  console.log(`✅ Selection board ready with ${window.ownedCards.length} cards`);
  if (!Game.aiHandVisible) {
  if (typeof createAIHand === "function") {
    console.log("🤖 Rendering AI hand...");
    createAIHand();
    Game.aiHandVisible = true;
  } else {
    console.warn("⚠️ AI hand renderer missing (createAIHand not found)");
  }
}

  // Render immediately
  Game.stage.update();
};


// -------------------------
// Start Card Selection Phase
// -------------------------
Game.startCardSelectionPhase = () => {
  console.log("🃏 Starting card selection phase...");

  const manager = window.__playerCardManager;
  if (!manager || !window.ownedCards || window.ownedCards.length === 0) {
    console.warn("⚠️ Cannot start selection; no cards available.");
    return;
  }

  Game.ui.selectionBoard.removeAllChildren();
  Game.ui.shownCards.removeAllChildren();

  // Display the first page of owned cards
  const cardsPerPage = 5;
  Game.ui.page = 1;
  Game.ui.totalPages = Math.ceil(window.ownedCards.length / cardsPerPage);
  Game.ui.displayedCards = window.ownedCards.slice(0, cardsPerPage);

  Game.ui.displayedCards.forEach((card, i) => {
    const cardImage = new createjs.Bitmap(Game.config.cardPath + card.image);
    cardImage.x =
      Game.offsets.gameOffsetX +
      i * (Game.offsets.cardOffsetX * 2 + 80); // spacing
    cardImage.y = Game.offsets.gameOffsetY + 300; // arbitrary y offset
    cardImage.scaleX = cardImage.scaleY = 0.8;

    cardImage.cursor = "pointer";

    // Click handler for selecting card
    cardImage.on("click", () => {
      Game.ui.selectedHandCardNumber = i;
      Game.ui.selectedHandCard = card;
      manager.updateDisplayedCard(card); // updates preview/info
      console.log(`Selected card: ${card.name}`);
    });

    Game.ui.selectionBoard.addChild(cardImage);
  });

  // Add selection board to stage
  Game.stage.addChild(Game.ui.selectionBoard);

  // Optional: show preview of first card
  if (Game.ui.displayedCards.length > 0) {
    Game.ui.selectedHandCardNumber = 0;
    Game.ui.selectedHandCard = Game.ui.displayedCards[0];
    manager.updateDisplayedCard(Game.ui.selectedHandCard);
  }

  // Enable player selecting hand
  Game.ui.playerSelectingHand = true;

  console.log(
    `✅ Selection board ready with ${Game.ui.displayedCards.length} cards`
  );

  // Update stage immediately
  Game.stage.update();
};

// -------------------------
// Document ready
// -------------------------
document.addEventListener("DOMContentLoaded", Game.init);
