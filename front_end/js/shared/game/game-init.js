import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

import { UIManager } from "../ui/ui-manager.js";

import { Game } from "./game.js";
import { GameDeck } from "./game-deck.js";

import { createDeck } from "../card/card-factory.js";

import { AIManager } from "../ai/ai-manager.js";

import { PlayerManager } from "../player/player-manager.js";
import { PlayerRenderer } from "../player/player-renderer.js";

import { PlacementManager } from "../../phase-2-game/phase-2.2-card-placement-phase/placement/placement-manager.js";
import { PlacementController } from "../../phase-2-game/phase-2.2-card-placement-phase/placement/placement-controller.js";

import { InputManager } from "../input/input-manager.js";
import { InputController } from "../input/input-controller.js";

import { CursorManager } from "../cursor/cursor-manager.js";
import { CursorRenderer } from "../cursor/cursor-renderer.js";
import { CursorController } from "../cursor/cursor-controller.js";

import { BoardManager } from "../board/board-manager.js";

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
   * Instantiate all core managers, controllers, and renderers.
   * Wires necessary references to Game object.
   * @returns {Object} References to created managers/controllers/renderers
   */
  managers() {
    const aiManager = new AIManager();
    const playerManager = new PlayerManager();
    const playerRenderer = new PlayerRenderer(playerManager);
    playerManager.renderer = playerRenderer;
    const gameDeck = new GameDeck(playerManager, aiManager);

    const placementController = new PlacementController(playerManager);
    placementController.init();
    const placementManager = new PlacementManager(placementController);
    if (placementManager.setController) {
      placementManager.setController(placementController);
    }

    const inputManager = new InputManager(
      playerManager,
      playerRenderer,
      placementController,
    );
    const inputController = new InputController(inputManager);

    Game.managers = {
      aiManager,
      playerManager,
      placementManager,
      inputManager,
      boardManager: BoardManager,
      gameDeck,
    };

    Game.controllers = {
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
      placementManager,
      gameDeck,
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
   * Initializes confirmation, infoBox, and background.
   */
  uiContainers() {
    //UIRenderer.addBackground();
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
    CursorManager.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    UIManager.gridCursor = new createjs.Bitmap(cursorPath);

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
   * Adds the main board background to the game stage.
   * This is a static image and does not require updates.
   */
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    Game.stage.addChild(background);

    UIManager.boardContainer.x = offsets.gameOffsetX;
    UIManager.boardContainer.y = offsets.gameOffsetY;
    background.stage.addChild(UIManager.boardContainer);

    Game.stage.update();
  },

  /**
   * Initializs the game environment, setting up the CreateJS stage,
   * ticker, managers, controllers, renderers, and event listeners.
   */
  all() {
    console.log("[Game-Init] Setting up canvas...");
    this.stage();

    this.uiContainers(); // Required to set up stuff for confirmation UI display

    console.log("[Game-Init] Drawing background...");
    this.addBackground();

    const { inputController } = this.managers();

    this.handPositions();
    this.cursors();
    this.events(inputController);

    console.log("[Game-Init] Starting deck creation...");

    const playerDeck = createDeck("player");
    const aiDeck = createDeck("ai");

    Game.managers.playerManager.deck = playerDeck;
    Game.managers.aiManager.deck = aiDeck;

    console.log("[Game-Init] Decks created:", {
      playerDeck,
      aiDeck,
    });

    Game.managers.aiManager.populateHand();

    console.log(
      "[Game-Init] Initialisation complete. Passing off to [Game]...",
    );
    Game.setupSelectionBook(Game.managers.playerManager);
  },
};
