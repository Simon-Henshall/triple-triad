import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";

import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";

import { Game } from "./game.js";

// Managers & Controllers
import { AIManager } from "../managers/ai-manager.js";
import { PlayerManager } from "../managers/player-manager.js";
import { PlayerRenderer } from "../renderers/player-renderer.js";
import { PlayerController } from "../controllers/player-controller.js";

import { PlacementManager } from "../managers/placement-manager.js";
import { PlacementController } from "../controllers/placement-controller.js";

import { InputManager } from "../managers/input-manager.js";
import { InputController } from "../controllers/input-controller.js";

import { CursorManager } from "../managers/cursor-manager.js";
import { CursorRenderer } from "../renderers/cursor-renderer.js";
import { CursorController } from "../controllers/cursor-controller.js";

import { BoardManager } from "../managers/board-manager.js";

/**
 * Handles full initialization of the game environment:
 * - Stage & ticker
 * - UI containers
 * - Managers, controllers, renderers
 * - Cursor setup
 * - Event listeners
 * - Hand selection setup
 */
export const gameInit = {
  /**
   * Initialize the CreateJS stage and ticker.
   * Sets Game.stage, Game.stageWidth, and Game.stageHeight.
   */
  stage() {
    Game.stage = new createjs.Stage("gameArea");
    Game.stageWidth = Game.stage.canvas.width;
    Game.stageHeight = Game.stage.canvas.height;

    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.addEventListener("tick", () => Game.stage.update());
  },

  /**
   * Compute card dimensions based on grid offsets.
   * Populates offsets.cardWidth and offsets.cardHeight.
   */
  offsets() {
    offsets.cardWidth = offsets.cellWidth - offsets.cardOffsetX * 2;
    offsets.cardHeight = offsets.cellHeight - offsets.cardOffsetY * 2;
  },

  /**
   * Instantiate all core managers, controllers, and renderers.
   * Wires necessary references to Game object.
   * @returns {Object} References to created managers/controllers/renderers
   */
  managers() {
    const aiManager = new AIManager();
    const playerManager = new PlayerManager();
    const playerRenderer = new PlayerRenderer(playerManager);
    const playerController = new PlayerController(
      playerManager,
      playerRenderer,
      UIManager,
    );

    const placementController = new PlacementController(playerManager);
    placementController.init();
    const placementManager = new PlacementManager(placementController);
    if (placementManager.setController) {
      placementManager.setController(placementController);
    }

    const inputManager = new InputManager(
      playerManager,
      playerRenderer,
      playerController,
      placementController,
    );
    const inputController = new InputController(inputManager);

    Game.managers = {
      aiManager,
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
      aiManager,
      playerManager,
      playerRenderer,
      playerController,
      placementManager,
      placementController,
      inputManager,
      inputController,
    };
  },

  /**
   * Compute visual hand positions for player and AI hands.
   * Depends on offsets computed from the grid.
   */
  handPositions() {
    const { aiManager, playerManager } = Game.managers;
    playerManager.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiManager.handOffsetX = offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },

  /**
   * Setup basic UI containers for the game.
   * Initializes selectionBoard, confirmation, infoBox, and background.
   */
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

  /**
   * Create cursors for player hand, selection board, and grid.
   * Wires CursorManager and Game renderers/controllers.
   */
  cursors() {
    const cursorPath = config.imagePath + "cursor.png";

    CursorManager.player = Game.managers.playerManager;

    CursorManager.player.playerHandCursor = new createjs.Bitmap(cursorPath);
    CursorManager.player.playerHandCursor.visible = false;

    CursorManager.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    CursorManager.player.playerHandSelectionCursor.visible = false;

    UIManager.gridCursor = new createjs.Bitmap(cursorPath);
    UIManager.gridCursor.visible = false;

    Game.renderers.cursorRenderer = CursorRenderer(
      Game.managers.playerManager,
      Game.renderers.playerRenderer,
    );
    Game.controllers.cursorController = CursorController(
      Game.renderers.cursorRenderer,
    );
  },

  /**
   * Register keydown event handlers for player input.
   * @param {InputController} inputController
   */
  events(inputController) {
    document.addEventListener("keydown", (event) =>
      inputController.handleKey(event),
    );
  },

  /**
   * Run full initialization sequence in order:
   * 1. Stage setup
   * 2. Compute offsets
   * 3. Create managers/controllers/renderers
   * 4. Setup UI containers
   * 5. Compute hand positions
   * 6. Setup cursors
   * 7. Register input events
   * 8. Start hand selection
   */
  all() {
    this.stage();
    this.offsets();

    const { inputController } = this.managers();

    this.uiContainers();
    this.handPositions();
    this.cursors();
    this.events(inputController);

    Game.startSelection();
  },
};
