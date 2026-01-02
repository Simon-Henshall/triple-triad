import { Game } from "./game.js";
import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

import phases from "../../game/phases.js";
import StateMachine from "../../game/game-state-machine.js";

import { UIModel } from "../ui/ui-model.js";
import { ScoreBoard } from "../ui/scoreboard.js";

import { CursorModel } from "../cursor/cursor-model.js";
import { CursorView } from "../cursor/cursor-view.js";
import { CursorController } from "../cursor/cursor-controller.js";

import { PlayerModel } from "../player/player-model.js";
import { PlayerView } from "../player/player-view.js";

import { AITurnModel } from "../../phases/ai-turn/ai-turn-model.js";
import { AITurnController } from "../../phases/ai-turn/ai-turn-controller.js";

import { PlacementModel } from "../../phases/placement/placement-model.js";
import { PlacementController } from "../../phases/placement/placement-controller.js";

import { InputModel } from "../input/input-model.js";
import { InputController } from "../input/input-controller.js";

import { BoardModel } from "../board/board-model.js";
import { createDeck } from "../card/card-factory.js";
import { InfoBox } from "../ui/info-box.js";

export const gameInit = {
  // ---------------------------------------------
  // CreateJS Stage
  // ---------------------------------------------
  stage() {
    Game.stage = new createjs.Stage("gameArea");
    Game.stageWidth = Game.stage.canvas.width;
    Game.stageHeight = Game.stage.canvas.height;

    createjs.Ticker.setFPS(config.fps);
    createjs.Ticker.addEventListener("tick", () => Game.stage.update());
  },

  // ---------------------------------------------
  // UI Containers
  // ---------------------------------------------
  uiContainers() {
    UIModel.confirmation.container = new createjs.Container();
    UIModel.confirmation.background = new createjs.Shape();
    UIModel.confirmation.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );

    InfoBox.container = new createjs.Container();
    UIModel.previouslySelectedCard = [];

    UIModel.boardContainer = new createjs.Container();
  },

  // ---------------------------------------------
  // Add static board background
  // ---------------------------------------------
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    Game.stage.addChild(background);

    UIModel.boardContainer.x = offsets.gameOffsetX;
    UIModel.boardContainer.y = offsets.gameOffsetY;

    Game.stage.addChild(UIModel.boardContainer);
  },

  // ---------------------------------------------
  // Initialise legacy models + new state machine
  // ---------------------------------------------
  models() {
    const aiTurnModel = new AITurnModel();
    const aiTurnController = new AITurnController(aiTurnModel);

    const playerModel = new PlayerModel();
    const playerView = new PlayerView(playerModel);
    playerModel.view = playerView;

    const placementController = new PlacementController(playerModel);
    placementController.init();

    const placementModel = new PlacementModel(placementController);
    placementModel.setController?.(placementController);

    const inputModel = new InputModel(
      playerModel,
      playerView,
      placementController,
    );
    const inputController = new InputController(inputModel);

    const stateMachine = new StateMachine(phases, {
      allowedTransitions: {
        "deck-selection": ["confirmation"],
        confirmation: ["deck-selection", "hand-select"],
        "hand-select": ["placement"],
        placement: ["resolution"],
        resolution: ["end-turn"],
        "end-turn": ["ai-turn", "hand-select"],
        "ai-turn": ["placement"],
        "game-over": [],
      },
      rootDeps: {},
    });

    Game.models = {
      aiTurnModel,
      playerModel,
      placementModel,
      inputModel,
      boardModel: BoardModel,
      stateMachine,
    };

    Game.controllers = {
      aiTurnController,
      placementController,
      inputController,
    };

    Game.views = { playerView };

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

  // ---------------------------------------------
  // Create cursors
  // ---------------------------------------------
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

  // ---------------------------------------------
  // Register Key Handlers
  // ---------------------------------------------
  events(inputController) {
    document.addEventListener("keydown", (event) =>
      inputController.handleKey(event),
    );
  },

  // ---------------------------------------------
  // Full Game Init
  // ---------------------------------------------
  async all() {
    console.log("[Game-Init] Starting setup...");

    // Stage + UI
    this.stage();
    Game.ui = {};
    this.uiContainers();
    this.addBackground();

    // Core systems
    const {
      inputController,
      playerModel,
      aiTurnModel,
      aiTurnController,
      stateMachine,
    } = this.models();

    this.cursors();
    this.events(inputController);

    // Decks
    const playerDeck = createDeck("player");
    const aiDeck = createDeck("ai");
    playerModel.deck = playerDeck;
    aiTurnModel.deck = aiDeck;

    // Now set up visual offsets based on hand
    // TODO: Move this logic
    // NOTE: aiTurnController.initHand() depends on these positions
    playerModel.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiTurnController.handOffsetX =
      offsets.gameOffsetX / 3 - offsets.cardWidth / 2;
    aiTurnModel.handOffsetX = aiTurnController.handOffsetX;

    // AI Hand
    const drawnCards = aiTurnModel.populateHand();
    aiTurnController.initHand(drawnCards);

    // Phase Dependencies
    stateMachine.setRootDependencies({
      playerModel,
      playerDeck,
      cursorController: Game.controllers.cursorController,
      selectionUI: UIModel,

      aiTurnModel,
      aiTurnController,

      placementModel: Game.models.placementModel,
      placementController: Game.controllers.placementController,

      boardModel: BoardModel,
      scoreboard: Game.ui.scoreBoard,
    });

    console.log("[Game-Init] Entering first phase: deck-selection");
    await stateMachine.transitionTo("deck-selection");
  },
};
