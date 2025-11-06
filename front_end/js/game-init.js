import { config } from "./config.js";
import { offsets } from "./constants/offsets.js";
import { UIManager } from "./managers/ui-manager.js";
import { UIRenderer } from "./renderers/ui-renderer.js";
import { utilities } from "./game/utilities.js";
import { ai } from "./game/ai.js";
import { Game } from "./game/game.js";

// Managers & Controllers
import { PlayerManager } from "./managers/player-manager.js";
import { PlayerRenderer } from "./renderers/player-renderer.js";
import { PlayerController } from "./controllers/player-controller.js";
import { PlacementManager } from "./managers/placement-manager.js";
import { PlacementController } from "./controllers/placement-controller.js";
import { InputManager } from "./managers/input-manager.js";
import { CursorManager } from "./managers/cursor-manager.js";
import { CursorRenderer } from "./renderers/cursor-renderer.js";
import { CursorController } from "./controllers/cursor-controller.js";
import { InputController } from "./controllers/input-controller.js";
import { BoardManager } from "./managers/board-manager.js";

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
    document.addEventListener("keydown", (event) =>
      inputController.handleKey(event),
    );
  },

  loadInitialCards() {
    if (typeof ajaxCall === "function") {
      utilities.ajaxCall(utilities.pickPlayerCards);
    } else if (typeof utilities.pickPlayerCards === "function") {
      utilities.pickPlayerCards();
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
