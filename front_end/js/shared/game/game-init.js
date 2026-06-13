import { Game } from "./game.js";
import { config } from "../../constants/config.js";
import { offsets } from "../../constants/offsets.js";

import phases from "../../game/phases.js";
import StateMachine from "../../game/game-state-machine.js";

import { ScoreBoard } from "../ui/scoreboard.js";

import { CursorModel } from "../cursor/cursor-model.js";
import { CursorView } from "../cursor/cursor-view.js";
import { CursorController } from "../cursor/cursor-controller.js";

import { PlayerModel } from "../player/player-model.js";
import { PlayerView } from "../player/player-view.js";
import { PlayerController } from "../player/player-controller.js";

import { AITurnModel } from "../../phases/ai-turn/ai-turn-model.js";
import { AITurnController } from "../../phases/ai-turn/ai-turn-controller.js";
import HandSelectController from "../../phases/hand-select/hand-select-controller.js";

import { PlacementModel } from "../../phases/placement/placement-model.js";
import { PlacementController } from "../../phases/placement/placement-controller.js";

import { InputModel } from "../input/input-model.js";
import { InputController } from "../input/input-controller.js";

import { BoardModel } from "../board/board-model.js";
import {
  createDeckFromFallback,
  createDeckFromApi,
} from "../card/card-factory.js";
import { InfoBox } from "../ui/info-box.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";

/** @type {import("../card/card.js").Card[]|undefined} */
let aiInitialCards;

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
    ConfirmationView.container = new createjs.Container();
    ConfirmationView.background = new createjs.Shape();
    ConfirmationView.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );

    InfoBox.container = new createjs.Container();

    BoardModel.boardContainer = new createjs.Container();
  },

  // ---------------------------------------------
  // Add static board background
  // ---------------------------------------------
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    Game.stage.addChild(background);

    BoardModel.boardContainer.x = offsets.gameOffsetX;
    BoardModel.boardContainer.y = offsets.gameOffsetY;

    Game.stage.addChild(BoardModel.boardContainer);
  },

  // ---------------------------------------------
  // Initialise legacy models + new state machine
  // ---------------------------------------------
  models() {
    const aiTurnModel = new AITurnModel();
    const aiTurnController = new AITurnController(
      { aiModel: aiTurnModel },
      undefined,
    );

    const playerModel = new PlayerModel();
    const playerView = new PlayerView(playerModel);
    playerModel.view = playerView;
    const playerController = new PlayerController(playerModel, playerView);

    const placementController = new PlacementController(
      { playerModel },
      undefined,
    );
    placementController.init();

    const placementModel = new PlacementModel(placementController, undefined);
    placementModel.setController?.(placementController);

    const inputModel = new InputModel(
      playerModel,
      playerView,
      placementController,
    );
    const inputController = new InputController(inputModel);

    const handSelectController = new HandSelectController(
      {
        playerModel,
        cursorController: undefined,
        handUI: playerModel,
        boardModel: BoardModel,
      },
      undefined,
    );

    const stateMachine = new StateMachine(phases, {
      allowedTransitions: {
        "deck-selection": ["confirmation"],
        confirmation: ["deck-selection", "hand-select"],
        "hand-select": ["placement"],
        placement: ["resolution", "game-over"],
        resolution: ["end-turn"],
        "end-turn": ["ai-turn", "hand-select"],
        "ai-turn": ["placement"],
        "game-over": ["card-claim"],
        "card-claim": ["game-over"],
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
      playerController,
      placementController,
      inputController,
      handSelectController,
    };

    Game.views = { playerView };

    Game.ui.scoreBoard = new ScoreBoard(Game.stage, playerModel, aiTurnModel);

    return {
      aiTurnModel,
      aiTurnController,
      playerController,
      playerModel,
      playerView,
      placementModel,
      placementController,
      inputModel,
      inputController,
      handSelectController,
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

    BoardModel.gridCursor = new createjs.Bitmap(cursorPath);

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
  // Set up visual hand offsets
  // ---------------------------------------------
  handOffsets() {
    const playerModel = Game.models.playerModel;
    const aiTurnController = Game.controllers.aiTurnController;
    const aiTurnModel = Game.models.aiTurnModel;

    playerModel.handOffsetX =
      offsets.gameOffsetX + offsets.cellWidth * 3 + offsets.cardWidth / 4;
    aiTurnController.handOffsetX =
      offsets.gameOffsetX / 3 - offsets.cardWidth / 2;
    aiTurnModel.handOffsetX = aiTurnController.handOffsetX;
  },

  // ---------------------------------------------
  // Full Game Init
  // ---------------------------------------------
  async all(playerApiCards) {
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

    // Decks – use API data if available, otherwise fall back to static data
    const playerDeck = playerApiCards
      ? createDeckFromApi(playerApiCards, "player")
      : createDeckFromFallback("player");
    const aiDeck = playerApiCards
      ? createDeckFromApi(playerApiCards, "ai")
      : createDeckFromFallback("ai");
    playerModel.deck = playerDeck;
    aiTurnModel.deck = aiDeck;

    // Set up visual hand offsets
    // NOTE: aiTurnController.initHand() depends on these positions
    this.handOffsets();

    // AI Hand
    const drawnCards = aiTurnModel.populateHand();
    aiTurnController.initHand(drawnCards);

    // Store a snapshot of the AI's initial hand *before* gameplay starts modifying it
    aiInitialCards = drawnCards.map((card) => card.clone({ owner: "ai" }));

    // Phase Dependencies
    stateMachine.setRootDependencies({
      playerModel,
      playerDeck,
      cursorController: Game.controllers.cursorController,
      selectionUI: playerModel,
      aiInitialCards,

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
