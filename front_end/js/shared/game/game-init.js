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
import { BoardView } from "../board/board-view.js";
import { createDeckFromApi } from "../card/card-factory.js";
import { InfoBox } from "../ui/info-box.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";
import { RulesView } from "../../phases/rules/rules-view.js";
import { RulesController } from "../../phases/rules/rules-controller.js";
import { fetchOpponentCards } from "../../utilities/network.js";
import { RNG } from "../../utilities/rng.js";
import { generateAIHand } from "../../utilities/ai-hand-generator.js";

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
    RulesView.container = new createjs.Container();
    RulesView.background = new createjs.Shape();
    RulesView.cursor = new createjs.Bitmap(config.imagePath + "cursor.png");

    ConfirmationView.container = new createjs.Container();
    ConfirmationView.background = new createjs.Shape();
    ConfirmationView.cursor = new createjs.Bitmap(
      config.imagePath + "cursor.png",
    );

    InfoBox.container = new createjs.Container();

    BoardView.boardContainer = new createjs.Container();
  },

  // ---------------------------------------------
  // Add static board background
  // ---------------------------------------------
  addBackground() {
    const background = new createjs.Bitmap(config.imagePath + "board.png");
    Game.stage.addChild(background);

    BoardView.boardContainer.x = offsets.gameOffsetX;
    BoardView.boardContainer.y = offsets.gameOffsetY;

    Game.stage.addChild(BoardView.boardContainer);
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

    const rulesController = new RulesController({}, undefined);

    const stateMachine = new StateMachine(phases, {
      allowedTransitions: {
        "opponent-selection": ["rules"],
        rules: ["deck-selection"],
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
      rulesController,
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
      rulesController,
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
  // Set up AI deck and hand after opponent is selected
  // ---------------------------------------------
  async setupAIForOpponent(opponent) {
    console.log(
      `[Game-Init] Setting up AI for opponent: "${opponent.name}" (ID: ${opponent.id})`,
    );

    const { aiTurnModel, playerModel, stateMachine } = Game.models;
    const { aiTurnController } = Game.controllers;

    // Fetch the opponent's available cards AND rare card from the database
    let opponentCards;
    let rareCardApi;
    try {
      const response = await fetchOpponentCards(opponent.id, {
        uniqueCardId: opponent.unique_card_id,
      });
      if (response.success && response.cards.length > 0) {
        opponentCards = response.cards;
        rareCardApi = response.rare_card || undefined;
        console.log(
          `[Game-Init] Loaded ${opponentCards.length} cards for opponent "${opponent.name}"`,
        );
      } else {
        console.warn(
          `[Game-Init] No cards returned for opponent "${opponent.name}", using player cards as fallback`,
        );
        opponentCards = await this._getPlayerCardsFallback();
      }
    } catch (error) {
      console.error(
        "[Game-Init] Failed to fetch opponent cards:",
        error,
        "Using player cards as fallback",
      );
      opponentCards = await this._getPlayerCardsFallback();
    }

    // Create the AI deck from the opponent's card pool (for the UI deck display)
    const aiDeck = createDeckFromApi(opponentCards, "ai");
    aiTurnModel.deck = aiDeck;

    // Clear any existing hand
    aiTurnModel.resetHand();

    // Build rare Card object from the fetched API data (if any)
    let rareCard;
    if (rareCardApi) {
      const rarityDeck = createDeckFromApi([rareCardApi], "ai");
      if (rarityDeck.length > 0) {
        rareCard = rarityDeck[0];
      }
    }

    // Build common-card pool: AI deck cards (already Card objects from API data)
    const commonCardPool = aiDeck.map((card) => card.clone({ owner: "ai" }));

    // Get player 1's card IDs for the rare-card ownership check
    const playerCardIds = playerModel.deck.map((card) => card.data.id);

    // Use the RNG rare-card system to generate the AI's hand
    const rng = new RNG(Date.now());
    const drawnCards = generateAIHand(
      commonCardPool,
      rareCard,
      playerCardIds,
      opponent,
      rng,
    );

    // Overwrite the AI's hand with the generated cards
    aiTurnModel.hand = [...drawnCards];
    aiTurnController.initHand(drawnCards);

    // Store a snapshot of the AI's initial hand
    aiInitialCards = drawnCards.map((card) => card.clone({ owner: "ai" }));

    // Update root dependencies with the initial cards
    stateMachine.setRootDependencies({
      ...stateMachine.rootDeps,
      aiInitialCards,
    });

    console.log(
      `[Game-Init] AI hand populated with ${drawnCards.length} cards`,
    );
  },

  /**
   * Fallback: get player cards from the in-memory player deck.
   * @private
   */
  async _getPlayerCardsFallback() {
    const playerModel = Game.models.playerModel;
    // Convert the player deck back to API-style cards
    return playerModel.deck.map((card) => ({
      id: card.data.id,
      display_name: card.data.name,
      image:
        card.data.imagePath?.split("/").pop()?.replace(".png", "") ||
        `card${card.data.id}`,
      strength_up: card.data.strength.up,
      strength_right: card.data.strength.right,
      strength_down: card.data.strength.down,
      strength_left: card.data.strength.left,
      element_id: card.data.element ?? 0,
    }));
  },

  // ---------------------------------------------
  // Full Game Init
  // ---------------------------------------------
  async all(playerApiCards, opponentLocations) {
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

    // Player deck – build from API data
    const playerDeck = createDeckFromApi(playerApiCards, "player");
    playerModel.deck = playerDeck;

    // Set up visual hand offsets
    // NOTE: aiTurnController.initHand() depends on these positions
    this.handOffsets();

    // Phase Dependencies – set up root deps (AI deck will be created later)
    stateMachine.setRootDependencies({
      playerModel,
      playerDeck,
      cursorController: Game.controllers.cursorController,
      selectionUI: playerModel,

      aiTurnModel,
      aiTurnController,

      opponentLocations: opponentLocations || [],
      opponentSelectionCallbacks: {
        /** Called when an opponent is selected */
        onOpponentSelected: (opponent) => this.setupAIForOpponent(opponent),
      },

      aiInitialCards: [],

      placementModel: Game.models.placementModel,
      placementController: Game.controllers.placementController,

      boardModel: BoardModel,
      scoreboard: Game.ui.scoreBoard,
    });

    console.log("[Game-Init] Entering first phase: opponent-selection");
    await stateMachine.transitionTo("opponent-selection");
  },
};
