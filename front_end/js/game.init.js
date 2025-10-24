import { config } from './config.js';
import { offsets } from './offsets.js';
import { player } from './player.js';

// -------------------------
// CORE: Initialization
// -------------------------
const GameInit = {
  stage() {
    Game.stage = new createjs.Stage("gameArea");
    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.addEventListener("tick", () => Game.stage.update());

    Game.stageWidth = Game.stage.canvas.width;
    Game.stageHeight = Game.stage.canvas.height;
  },
  offsets() {
    // Card size
    offsets.cardWidth =
      offsets.cellWidth - offsets.cardOffsetX * 2;
    offsets.cardHeight =
      offsets.cellHeight - offsets.cardOffsetY * 2;
  },
  handPositions() {
    player.handOffsetX =
      offsets.gameOffsetX +
      offsets.cellWidth * 3 +
      offsets.cardWidth / 4;
    Game.ai.handOffsetX =
      offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },
  cursors() {
    player.playerHandCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
    player.playerHandSelectionCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
    Game.ui.gridCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
  },
  uiContainers() {
    // Main containers
    Game.ui.selectionBoard.container = new createjs.Container();
    Game.ui.selectionBoard.shownCards = new createjs.Container();
    Game.ui.confirmation.container = new createjs.Container();
    Game.ui.infoBox.container = new createjs.Container();
    Game.ui.previouslySelectedCard = [];

    Game.ui.confirmation.background = new createjs.Shape();
    Game.ui.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
  },
  events() {
    document.addEventListener("keydown", Game.input.checkKey);
  },
  loadInitialCards() {
    Game.ui.addBackground();

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

//export default GameInit;
window.Game.init = GameInit;