import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

import { UIManager } from "../ui/ui-manager.js";

import { Game } from "./game.js";

import { createDeck } from "../card/card-factory.js";

import { AITurnController } from "../../phases/ai-turn/ai-turn-controller.js";
import { AITurnModel } from "../../phases/ai-turn/ai-turn-model.js";

import { PlayerManager } from "../player/player-manager.js";
import { PlayerRenderer } from "../player/player-renderer.js";

import { PlacementModel } from "../../phases/placement/placement-model.js";
import { PlacementController } from "../../phases/placement/placement-controller.js";

import { InputManager } from "../input/input-manager.js";
import { InputController } from "../input/input-controller.js";

import { CursorManager } from "../cursor/cursor-manager.js";
import { CursorRenderer } from "../cursor/cursor-renderer.js";
import { CursorController } from "../cursor/cursor-controller.js";

import { BoardManager } from "../board/board-manager.js";
import phases from "../../game/phases.js";
import { StateMachine } from "../../game/game-state-machine.js";

import { ScoreBoard } from "../ui/scoreboard.js";

/**
 * Initialises the game state, managers, and controllers.
 * Sets up the game state machine and phases.
 */
export const gameInit = {
  /**
   * Initialise the CreateJS stage and ticker.
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
    const aiTurnModel = new AITurnModel();
    const aiTurnController = new AITurnController(aiTurnModel);
    const playerManager = new PlayerManager();
    const playerRenderer = new PlayerRenderer(playerManager);
    playerManager.renderer = playerRenderer;
    const placementController = new PlacementController(playerManager);
    placementController.init();
    const placementModel = new PlacementModel(placementController);
    if (placementModel.setController) {
      placementModel.setController(placementController);
    }

    const inputManager = new InputManager(
      playerManager,
      playerRenderer,
      placementController,
    );
    const inputController = new InputController(inputManager);

    // Instantiate the state machine with the phase registry and an empty deps object for now
    const stateMachine = new StateMachine(phases, {});

    Game.models = {
      aiTurnModel,
    };

    Game.managers = {
      playerManager,
      placementModel,
      inputManager,
      boardManager: BoardManager,
      stateMachine,
    };

    Game.controllers = {
      aiTurnController,
      placementController,
      inputController,
    };
    Game.renderers = { playerRenderer };

    Game.ui = Game.ui || {};
    Game.ui.scoreBoard = new ScoreBoard(Game.stage, playerManager, aiTurnModel);

    return {
      aiTurnModel,
      aiTurnController,
      playerManager,
      playerRenderer,
      placementModel,
      placementController,
      inputManager,
      inputController,
      stateMachine,
    };
  },

  /**
   * Compute visual hand positions for player and AI hands.
   * Depends on offsets computed from the grid.
   */
  handPositions() {
    const { playerManager } = Game.managers;
    playerManager.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    const { aiTurnController } = Game.controllers;
    aiTurnController.handOffsetX =
      offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
  },

  /**
   * Setup basic UI containers for the game.
   * Initializes confirmation, infoBox, and background.
   */
  uiContainers() {
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
    const playerManager = Game.managers.playerManager;
    CursorManager.player = playerManager;
    CursorManager.player.playerHandCursor = new createjs.Bitmap(cursorPath);
    CursorManager.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    UIManager.gridCursor = new createjs.Bitmap(cursorPath);
    Game.renderers.cursorRenderer = CursorRenderer(
      playerManager,
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

  /* Initialises the game environment, setting up the CreateJS stage,
   * ticker, managers, controllers, renderers, and event listeners.
   */
  all() {
    console.log("[Game-Init] Setting up canvas...");
    this.stage();
    this.uiContainers();
    this.addBackground();

    const {
      inputController,
      playerManager,
      aiTurnController,
      aiTurnModel,
      stateMachine,
    } = this.managers();

    this.cursors();
    this.events(inputController);

    // Create decks first
    const playerDeck = createDeck("player");
    const aiDeck = createDeck("ai");
    playerManager.deck = playerDeck;
    aiTurnModel.deck = aiDeck;

    // Populate AI hand in the model
    const drawnCards = aiTurnModel.populateHand();

    // Now set up visual offsets based on hand
    playerManager.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiTurnController.handOffsetX =
      offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
    aiTurnModel.handOffsetX = aiTurnController.handOffsetX;

    // Initialise AI hand visuals
    aiTurnController.initHand(drawnCards);

    // Set dependencies for the state machine
    stateMachine.setDependencies({
      playerManager,
      aiTurnController,
      deck: playerDeck,
    });

    console.log("[Game-Init] Transitioning to deck-selection phase...");
    stateMachine.transitionTo("deck-selection");
  },
};
