// -------------------------
// CORE: Initialization
// -------------------------
Game.init = {
  stage() {
    Game.stage = new createjs.Stage("gameArea");
    createjs.Ticker.setFPS(Game.config.fps);
    createjs.Ticker.addEventListener("tick", () => Game.stage.update());

    Game.stageWidth = Game.stage.canvas.width;
    Game.stageHeight = Game.stage.canvas.height;
  },
  offsets() {
    // Card size
    Game.offsets.cardWidth =
      Game.offsets.cellWidth - Game.offsets.cardOffsetX * 2;
    Game.offsets.cardHeight =
      Game.offsets.cellHeight - Game.offsets.cardOffsetY * 2;
  },
  handPositions() {
    Game.player.handOffsetX =
      Game.offsets.gameOffsetX +
      Game.offsets.cellWidth * 3 +
      Game.offsets.cardWidth / 4;
    Game.ai.handOffsetX =
      Game.offsets.gameOffsetX / 2 - Game.offsets.cardWidth / 2;
  },
  cursors() {
    Game.player.playerHandCursor = new createjs.Bitmap(
      Game.config.imagePath + "cursor.png"
    );
    Game.player.playerHandSelectionCursor = new createjs.Bitmap(
      Game.config.imagePath + "cursor.png"
    );
    Game.ui.gridCursor = new createjs.Bitmap(
      Game.config.imagePath + "cursor.png"
    );
  },
  uiContainers() {
    // Main containers
    Game.ui.selectionBoard = new createjs.Container();
    Game.ui.shownCards = new createjs.Container();
    Game.ui.confirmation = new createjs.Container();
    Game.ui.infoBox = new createjs.Container();
    Game.ui.previouslySelectedCard = [];

    Game.ui.confirmationBackground = new createjs.Shape();
    Game.ui.confirmationCursor = new createjs.Bitmap(
      Game.config.imagePath + "cursor.png"
    );
  },
  events() {
    document.addEventListener("keydown", Game.input.checkKey);
  },
  loadInitialCards() {
    addBackground();

    if (typeof ajaxCall === "function") {
      Game.utils.ajaxCall(Game.utils.pickPlayerCards);
    } else if (typeof Game.utils.pickPlayerCards === "function") {
      Game.utils.pickPlayerCards();
    }
  },
  all() {
    this.stage();
    this.offsets();
    this.handPositions();
    this.cursors();
    this.uiContainers();
    this.events();
    this.loadInitialCards();
  },
};