import { config } from './config.js';
import { offsets } from './constants/offsets.js';
import { player } from './render/player.js';
import { UIManager } from "./managers/UIManager.js";
import { UIRenderer } from "./ui/UIRenderer.js";
import { utils } from './game/utils.js';
import { ai } from './game/ai.js';
import { InputController } from './controllers/InputController.js';
import { Game } from './game/game.js';

const inputController = new InputController();

// -------------------------
// CORE: Initialization
// -------------------------
export const gameInit = {
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
    ai.handOffsetX =
      offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },
  cursors() {
    player.playerHandCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
    player.playerHandSelectionCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
    UIManager.gridCursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
  },
  uiContainers() {
    UIRenderer.addBackground();
    // Main containers
    UIManager.selectionBoard.container = new createjs.Container();
    UIManager.selectionBoard.shownCards = new createjs.Container();
    UIManager.confirmation.container = new createjs.Container();
    UIManager.infoBox.container = new createjs.Container();
    UIManager.previouslySelectedCard = [];

    UIManager.confirmation.background = new createjs.Shape();
    UIManager.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png"
    );
  },
  events() {
    document.addEventListener("keydown", (e) => inputController.handleKey(e));
  },
  loadInitialCards() {
    if (typeof ajaxCall === "function") {
      utils.ajaxCall(utils.pickPlayerCards);
    } else if (typeof utils.pickPlayerCards === "function") {
      utils.pickPlayerCards();
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
