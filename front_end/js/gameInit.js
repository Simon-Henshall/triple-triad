import { config } from "./config.js";
import { offsets } from "./constants/offsets.js";
import { UIManager } from "./managers/UIManager.js";
import { UIRenderer } from "./ui/UIRenderer.js";
import { utils } from "./game/utils.js";
import { ai } from "./game/ai.js";
import { Game } from "./game/game.js";

// Managers & Controllers
import { PlayerManager } from "./managers/PlayerManager.js";
import { PlayerRenderer } from "./ui/PlayerRenderer.js";
import { PlayerController } from "./controllers/PlayerController.js";
import { PlacementManager } from "./managers/PlacementManager.js";
import { PlacementController } from "./controllers/PlacementController.js";
import { InputManager } from "./managers/InputManager.js";
import { CursorManager } from "./managers/CursorManager.js";
import { CursorRenderer } from "./ui/CursorRenderer.js";
import { CursorController } from "./controllers/CursorController.js";
import { InputController } from "./controllers/InputController.js";
import { BoardManager } from "./managers/BoardManager.js";

export const gameInit = {
  stage() {
    Game.stage = new createjs.Stage("gameArea");
    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.addEventListener("tick", () => Game.stage.update());

    Game.stageWidth = Game.stage.canvas.width;
    Game.stageHeight = Game.stage.canvas.height;
  },

  offsets() {
    offsets.cardWidth = offsets.cellWidth - offsets.cardOffsetX * 2;
    offsets.cardHeight = offsets.cellHeight - offsets.cardOffsetY * 2;
  },

  managers() {
    // Instantiate base managers
    const playerManager = new PlayerManager();
    const playerRenderer = new PlayerRenderer(playerManager);
    const playerController = new PlayerController(
      playerManager,
      playerRenderer,
      UIManager,
    );

    const placementManager = new PlacementManager();
    const placementController = new PlacementController(playerManager);

    // If manager needs to call back into controller, wire it
    if (typeof placementManager.setController === "function") {
      placementManager.setController(placementController);
    }

    const inputManager = new InputManager(
      playerManager,
      playerRenderer,
      playerController,
      placementController,
    );

    const inputController = new InputController(inputManager);

    // Register everything globally in Game (optional convenience)
    Game.managers = {
      playerManager,
      placementManager,
      inputManager,
      boardManager: BoardManager,
    };

    Game.controllers = {
      playerController,
      placementController,
      inputController,
    };

    Game.renderers = {
      playerRenderer,
    };

    return {
      playerManager,
      playerRenderer,
      playerController,
      placementManager,
      placementController,
      inputManager,
      inputController,
    };
  },

  handPositions() {
    const { playerManager } = Game.managers;
    playerManager.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    ai.handOffsetX = offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },

  cursors() {
    const cursorPath = config.imagePath + "cursor.png";

    // Create grid, player hand and selection cursors
    CursorManager.player.playerHandCursor = new createjs.Bitmap(cursorPath);
    CursorManager.player.playerHandCursor.visible = false;
    CursorManager.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    CursorManager.player.playerHandSelectionCursor.visible = false;
    UIManager.gridCursor = new createjs.Bitmap(cursorPath);
    UIManager.gridCursor.visible = false;
    // NB: Stage addition happens in CursorRenderer

    Game.stage.update();
  },

  uiContainers() {
    UIRenderer.addBackground();

    UIManager.selectionBoard.container = new createjs.Container();
    UIManager.selectionBoard.shownCards = new createjs.Container();
    UIManager.confirmation.container = new createjs.Container();
    UIManager.infoBox.container = new createjs.Container();
    UIManager.previouslySelectedCard = [];

    UIManager.confirmation.background = new createjs.Shape();
    UIManager.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );
  },

  events(inputController) {
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

    const { playerManager, playerRenderer, inputController } = this.managers();

    // Setup UI containers early so cursors and renderers have valid targets
    this.uiContainers();

    // Now compute hand offsets, etc.
    this.handPositions();

    // Wire the playerManager to CursorManager
    CursorManager.player = playerManager;

    // Create the base grid and player hand cursors
    this.cursors();

    // Instantiate the renderers and controllers now that dependencies exist
    Game.renderers.cursorRenderer = CursorRenderer(
      playerManager,
      playerRenderer,
    );
    Game.controllers.cursorController = CursorController(
      Game.renderers.cursorRenderer,
    );

    // Setup key event handlers
    this.events(inputController);

    // Load cards into hand / start game
    this.loadInitialCards();
  },
};
