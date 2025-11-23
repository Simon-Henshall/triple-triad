import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

import { UIModel } from "../ui/ui-model.js";

import { Game } from "./game.js";

import { createDeck } from "../card/card-factory.js";

import { AITurnController } from "../../phases/ai-turn/ai-turn-controller.js";
import { AITurnModel } from "../../phases/ai-turn/ai-turn-model.js";

import { PlayerModel } from "../player/player-model.js";
import { PlayerView } from "../player/player-view.js";

import { PlacementModel } from "../../phases/placement/placement-model.js";
import { PlacementController } from "../../phases/placement/placement-controller.js";

import { InputModel } from "../input/input-model.js";
import { InputController } from "../input/input-controller.js";

import { CursorModel } from "../cursor/cursor-model.js";
import { CursorView } from "../cursor/cursor-view.js";
import { CursorController } from "../cursor/cursor-controller.js";

import { BoardModel } from "../board/board-model.js";
import phases from "../../game/phases.js";
import { StateMachine } from "../../game/game-state-machine.js";

import { ScoreBoard } from "../ui/scoreboard.js";

/**
 * Initialises the game state, models, and controllers.
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
   * Instantiate all core models, controllers, and views.
   * Wires necessary references to Game object.
   * @returns {Object} References to created models/controllers/views
   */
  models() {
    const aiTurnModel = new AITurnModel();
    const aiTurnController = new AITurnController(aiTurnModel);
    const playerModel = new PlayerModel();
    const playerView = new PlayerView(playerModel);
    playerModel.view = playerView;
    const placementController = new PlacementController(playerModel);
    placementController.init();
    const placementModel = new PlacementModel(placementController);
    if (placementModel.setController) {
      placementModel.setController(placementController);
    }

    const inputModel = new InputModel(
      playerModel,
      playerView,
      placementController,
    );
    const inputController = new InputController(inputModel);

    // Instantiate the state machine with the phase registry and an empty deps object for now
    const stateMachine = new StateMachine(phases, {});

    Game.models = {
      aiTurnModel: AITurnModel,
      playerModel: PlayerModel,
      placementModel: PlacementModel,
      inputModel: InputModel,
      boardModel: BoardModel,
    };

    Game.controllers = {
      aiTurnController,
      placementController,
      inputController,
    };

    Game.views = { playerView };

    Game.ui = Game.ui || {};
    Game.ui.scoreBoard = new ScoreBoard(Game.stage, playerModel, aiTurnModel);

    return {
      aiTurnModel,
      aiTurnController,
      playerModel,
      playerView,
      placementModel,
      placementController,
      inputModel,
      inputController,
      stateMachine,
    };
  },

  /**
   * Compute visual hand positions for player and AI hands.
   * Depends on offsets computed from the grid.
   */
  handPositions() {
    const { playerModel } = Game.models;
    playerModel.handOffsetX =
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
    UIModel.confirmation.container = new createjs.Container();
    UIModel.infoBox.container = new createjs.Container();
    UIModel.previouslySelectedCard = [];
    UIModel.confirmation.background = new createjs.Shape();
    UIModel.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );
  },

  /**
   * Create cursors for player hand, selection board, and grid.
   * Wires CursorModel and Game views/controllers.
   */
  cursors() {
    const cursorPath = config.imagePath + "cursor.png";
    const playerModel = Game.models.playerModel;
    CursorModel.player = playerModel;
    CursorModel.player.playerHandCursor = new createjs.Bitmap(cursorPath);
    CursorModel.player.playerHandSelectionCursor = new createjs.Bitmap(
      cursorPath,
    );
    UIModel.gridCursor = new createjs.Bitmap(cursorPath);
    Game.views.cursorView = CursorView(playerModel, Game.views.playerView);
    Game.controllers.cursorController = CursorController(Game.views.cursorView);
  },

  /**
   * Register keydown event handlers for player input.
   */
  events(stateMachine) {
    globalThis.addEventListener("keydown", (event) => {
      stateMachine.handleInput(event);
    });
  },

  /**
   * Adds the main board background to the game stage.
   * This is a static image and does not require updates.
   */
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    Game.stage.addChild(background);
    UIModel.boardContainer.x = offsets.gameOffsetX;
    UIModel.boardContainer.y = offsets.gameOffsetY;
    background.stage.addChild(UIModel.boardContainer);
    Game.stage.update();
  },

  /* Initialises the game environment, setting up the CreateJS stage,
   * ticker, models, controllers, views, and event listeners.
   */
  all() {
    console.log("[Game-Init] Setting up canvas...");
    this.stage();
    this.uiContainers();
    this.addBackground();

    const { playerModel, aiTurnController, aiTurnModel, stateMachine } =
      this.models();

    this.cursors();
    this.events(stateMachine);

    // Create decks first
    const playerDeck = createDeck("player");
    const aiDeck = createDeck("ai");
    playerModel.deck = playerDeck;
    aiTurnModel.deck = aiDeck;

    // Populate AI hand in the model
    const drawnCards = aiTurnModel.populateHand();

    // Now set up visual offsets based on hand
    playerModel.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiTurnController.handOffsetX =
      offsets.gameOffsetX / 2 - offsets.cardWidth / 2;
    aiTurnModel.handOffsetX = aiTurnController.handOffsetX;

    // Initialise AI hand visuals
    aiTurnController.initHand(drawnCards);

    // Set dependencies for the state machine
    stateMachine.setDependencies({
      playerModel,
      aiTurnController,
      deck: playerDeck,
    });

    console.log("[Game-Init] Transitioning to deck-selection phase...");
    stateMachine.transitionTo("deck-selection");
  },
};
