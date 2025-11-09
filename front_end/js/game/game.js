import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";

// Managers, Controllers, Renderers
import { UIManager } from "../managers/ui-manager.js";
import { UIRenderer } from "../renderers/ui-renderer.js";
import { BoardRenderer } from "../renderers/board-renderer.js";
import { UIController } from "../controllers/ui-controller.js";

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
import { fetchPlayerCards } from "../utilities/network.js";
import { pickPlayerCards } from "../utilities/selection.js";

export const Game = {
  initialized: false,
  rules: ["elemental"],
  stage: undefined,
  managers: {},
  controllers: {},
  renderers: {},
  stageWidth: 0,
  stageHeight: 0,
  cards: {},

  /** Cleanly resets the game environment */
  destroy() {
    if (createjs?.Ticker) {
      createjs.Ticker.removeAllEventListeners();
      createjs.Ticker.reset?.();
    }

    if (this.stage) {
      this.stage.removeAllChildren?.();
      this.stage.removeAllEventListeners?.();
    }

    this.stage = undefined;
    this.assets = undefined;
    this.initialized = false;
    console.log("[Game] Destroyed");
  },

  /** Prepares the CreateJS stage, ticker, and asset loader */
  bootstrap() {
    this.stage = new createjs.Stage("gameArea");
    this.stageWidth = this.stage.canvas.width;
    this.stageHeight = this.stage.canvas.height;

    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.addEventListener("tick", () => this.stage.update());

    // Asset loader
    const queue = new createjs.LoadQueue(false);
    this.assets = queue;
    this.assets.loaded = new Promise((resolve) => {
      queue.on("complete", resolve);
      queue.on("error", (error) => {
        console.error("[Game] Asset load error:", error);
        resolve();
      });
    });
  },

  /** Main entry point — constructs all managers, renderers, and controllers */
  async initialize() {
    if (this.initialized) {
      return;
    }
    this.bootstrap();
    this._computeOffsets();

    // --- Managers & Controllers ---
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

    this.managers = {
      aiManager,
      playerManager,
      placementManager,
      inputManager,
      boardManager: BoardManager,
    };

    this.controllers = {
      playerController,
      placementController,
      inputController,
    };

    this.renderers = { playerRenderer };

    // --- UI setup ---
    this._setupUIContainers();
    this._setupCursors();
    this._computeHandPositions();

    // --- Input events ---
    document.addEventListener("keydown", (e) => inputController.handleKey(e));

    // --- Initial cards ---
    await this._loadInitialCards();

    this.initialized = true;
    console.log("[Game] Initialized");
  },

  /** Derives card dimensions from cell offsets */
  _computeOffsets() {
    offsets.cardWidth = offsets.cellWidth - offsets.cardOffsetX * 2;
    offsets.cardHeight = offsets.cellHeight - offsets.cardOffsetY * 2;
  },

  /** Compute visual hand positions for player and AI */
  _computeHandPositions() {
    const { aiManager, playerManager } = this.managers;
    playerManager.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiManager.handOffsetX = offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },

  /** Prepare base UI layers and containers */
  _setupUIContainers() {
    UIRenderer.addBackground();

    UIManager.selectionBoard.container = new createjs.Container();
    UIManager.selectionBoard.shownCards = new createjs.Container();
    UIManager.confirmation.container = new createjs.Container();
    UIManager.infoBox.container = new createjs.Container();

    UIManager.confirmation.background = new createjs.Shape();
    UIManager.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );
  },

  /** Create cursors and link them to the stage/UI */
  _setupCursors() {
    const cursorPath = config.imagePath + "cursor.png";

    CursorManager.player = this.managers.playerManager;

    CursorManager.player.playerHandCursor = new createjs.Bitmap(cursorPath);
    CursorManager.player.playerHandCursor.visible = false;

    CursorManager.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    CursorManager.player.playerHandSelectionCursor.visible = false;

    UIManager.gridCursor = new createjs.Bitmap(cursorPath);
    UIManager.gridCursor.visible = false;

    this.renderers.cursorRenderer = CursorRenderer(
      this.managers.playerManager,
      this.renderers.playerRenderer,
    );
    this.controllers.cursorController = CursorController(
      this.renderers.cursorRenderer,
    );
  },

  /** Fetches or selects the player's initial cards */
  async _loadInitialCards() {
    if (config.useLocalCards) {
      pickPlayerCards();
    } else {
      try {
        const playerId = 1;
        const cards = await fetchPlayerCards(playerId);
        console.log("[Game] Loaded cards:", cards);
      } catch (error) {
        console.error("[Game] Card load error:", error);
      }
    }
  },

  /** Begin a new match round */
  startGame() {
    console.log("[Game] Starting new match...");

    // Clear selection UI
    const sb = UIManager.selectionBoard;
    if (sb?.container) {
      this.stage.removeChild(sb.container);
    }
    if (UIManager.confirmation?.container) {
      this.stage.removeChild(UIManager.confirmation.container);
    }

    BoardRenderer.generateGrid();

    const { playerManager, aiManager } = this.managers;
    const { playerRenderer } = this.renderers;

    if (playerManager.hand.length === 0) {
      console.warn("[startGame] Player hand empty.");
    } else {
      playerRenderer.renderHand?.(playerManager.hand);
    }

    aiManager.populateHand?.();

    const firstCard = playerManager.hand[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      playerRenderer.indentSelectedCard(firstCard);
      UIRenderer.drawInfoBox();
      UIController.updateInfoBox(firstCard);
    }

    UIManager.playerConfirming = false;
    UIManager.playerChoosingCard = true;
    UIManager.playerSelectingHand = false;

    UIRenderer.drawCardCounts();
    this.controllers.cursorController?.playerHand?.place?.();

    this.stage.update();
    console.log("[Game] Match started successfully.");
  },

  /** Determine game outcome */
  endGame() {
    const playerManager = this.managers.playerManager;
    const aiManager = this.managers.aiManager;

    if (aiManager.totalRedCards > playerManager.totalBlueCards) {
      alert("lose");
    } else if (playerManager.totalBlueCards > aiManager.totalRedCards) {
      alert("win");
    } else {
      alert("draw");
      if (this.rules.includes("sudden_death")) {
        this.startGame();
      }
    }
  },

  startSelection() {
    console.log("[Game] Starting hand selection...");

    // Prepare the selection board container
    UIRenderer.drawSelectionBoard(); // <-- your existing rendering logic
    UIManager.selectionBoard.container.visible = true;

    // Populate with cards (pick locally or fetched)
    if (config.useLocalCards) {
      pickPlayerCards();
    } else {
      fetchPlayerCards(1).then((cards) => {
        // set playerManager.hand = cards
      });
    }

    // Set UI flags
    UIManager.playerSelectingHand = true;
    UIManager.playerChoosingCard = false;
    UIManager.playerConfirming = false;

    // Show first preview card
    UIManager.selectedCard = UIManager.selectionBoard.cards[0] ?? null;
    UIRenderer.drawPreviewCard();
    this.stage.update();
  },
};
