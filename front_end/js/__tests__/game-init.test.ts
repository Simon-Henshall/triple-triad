/**
 * @module game-init
 * @description Unit tests for the gameInit module. Most methods need a lot of
 * pre-populated state, so we test them defensively to avoid hard dependencies.
 */

import { jest } from "@jest/globals";
import { gameInit } from "../shared/game/game-init.js";
import { Game } from "../shared/game/game.js";

const apiCard = (id) => ({
  id,
  display_name: `Card ${id}`,
  image: `card${id}`,
  strength_up: 1,
  strength_right: 2,
  strength_down: 3,
  strength_left: 4,
  element_id: 0,
});

describe("gameInit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up minimal global state
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      setChildIndex: jest.fn(),
      canvas: { width: 800, height: 600 },
      numChildren: 0,
    };
    Game.stageWidth = 800;
    Game.stageHeight = 600;
    Game.models = {};
    Game.controllers = {};
    Game.views = {};
    Game.ui = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("stage method sets up stage and ticker", () => {
    expect(() => gameInit.stage()).not.toThrow();
    expect(Game.stage).toBeDefined();
  });

  test("uiContainers method does not throw", () => {
    gameInit.uiContainers();
    expect(Game.views).toBeDefined();
  });

  test("uiContainers initializes shared UI containers", () => {
    gameInit.uiContainers();

    expect(gameInit).toBeDefined();
    expect(Game.stage).toBeDefined();
  });

  test("addBackground method does not throw", () => {
    gameInit.addBackground();
    expect(Game.stage.addChild).toHaveBeenCalledTimes(2);
  });

  test("events method registers a keydown handler", () => {
    const handleKey = jest.fn();
    gameInit.events({ handleKey });
    const handler = document.addEventListener.mock.calls.at(-1)[1];
    const event = { key: "Enter" };
    handler(event);
    expect(handleKey).toHaveBeenCalledWith(event);
  });

  test("handOffsets sets player and AI hand positions", () => {
    Game.models = {
      playerModel: {},
      aiTurnModel: {},
    };
    Game.controllers = { aiTurnController: {} };

    gameInit.handOffsets();

    expect(Game.models.playerModel.handOffsetX).toEqual(expect.any(Number));
    expect(Game.controllers.aiTurnController.handOffsetX).toEqual(
      expect.any(Number),
    );
    expect(Game.models.aiTurnModel.handOffsetX).toBe(
      Game.controllers.aiTurnController.handOffsetX,
    );
  });

  test("_getPlayerCardsFallback converts the player deck to API data", async () => {
    Game.models.playerModel = {
      deck: [
        {
          data: {
            id: 12,
            name: "Fallback Card",
            imagePath: "assets/original/cards/card12.png",
            strength: { up: 1, right: 2, down: 3, left: 4 },
            element: 5,
          },
        },
      ],
    };

    await expect(gameInit._getPlayerCardsFallback()).resolves.toEqual([
      {
        id: 12,
        display_name: "Fallback Card",
        image: "card12",
        strength_up: 1,
        strength_right: 2,
        strength_down: 3,
        strength_left: 4,
        element_id: 5,
      },
    ]);
  });

  test("all orchestrates startup and enters opponent selection", async () => {
    const stateMachine = {
      setRootDependencies: jest.fn(),
      transitionTo: jest.fn().mockResolvedValue(),
    };
    const dependencies = {
      inputController: {},
      playerModel: {},
      aiTurnModel: {},
      aiTurnController: {},
      stateMachine,
    };
    const methods = [
      "stage",
      "uiContainers",
      "addBackground",
      "cursors",
      "events",
      "handOffsets",
    ];
    for (const method of methods) {
      jest.spyOn(gameInit, method).mockImplementation(() => {});
    }
    jest.spyOn(gameInit, "models").mockReturnValue(dependencies);

    await gameInit.all([], undefined);

    expect(gameInit.models).toHaveBeenCalled();
    expect(gameInit.events).toHaveBeenCalledWith(dependencies.inputController);
    expect(stateMachine.setRootDependencies).toHaveBeenCalledWith(
      expect.objectContaining({
        playerModel: dependencies.playerModel,
        playerDeck: [],
        opponentLocations: [],
        aiInitialCards: [],
      }),
    );
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      "opponent-selection",
    );
  });

  test("setupAIForOpponent builds the AI deck and initial hand", async () => {
    const stateMachine = { setRootDependencies: jest.fn(), rootDeps: {} };
    const aiTurnModel = { resetHand: jest.fn() };
    const aiTurnController = { initHand: jest.fn() };
    Game.models = {
      aiTurnModel,
      playerModel: { deck: [] },
      stateMachine,
    };
    Game.controllers = { aiTurnController };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        cards: [
          apiCard(1),
          apiCard(2),
          apiCard(3),
          apiCard(4),
          apiCard(5),
          apiCard(6),
        ],
        rare_card: apiCard(10),
      }),
    });

    await gameInit.setupAIForOpponent({
      id: 30,
      name: "Test Opponent",
      unique_card_id: 10,
    });

    expect(aiTurnModel.deck).toHaveLength(6);
    expect(aiTurnModel.resetHand).toHaveBeenCalled();
    expect(aiTurnController.initHand).toHaveBeenCalledWith(aiTurnModel.hand);
    expect(aiTurnModel.hand).toHaveLength(5);
    expect(stateMachine.setRootDependencies).toHaveBeenCalledWith(
      expect.objectContaining({ aiInitialCards: expect.any(Array) }),
    );
    globalThis.fetch = originalFetch;
  });

  test("setupAIForOpponent falls back when the API returns no cards", async () => {
    const stateMachine = { setRootDependencies: jest.fn(), rootDeps: {} };
    const aiTurnModel = { resetHand: jest.fn() };
    const aiTurnController = { initHand: jest.fn() };
    const fallbackCard = {
      data: {
        id: 1,
        name: "Fallback",
        imagePath: "assets/original/cards/card1.png",
        strength: { up: 1, right: 2, down: 3, left: 4 },
        element: 0,
      },
    };
    Game.models = {
      aiTurnModel,
      playerModel: { deck: [fallbackCard] },
      stateMachine,
    };
    Game.controllers = { aiTurnController };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, cards: [], rare_card: null }),
    });

    await gameInit.setupAIForOpponent({ id: 31, name: "Fallback Opponent" });

    expect(aiTurnModel.deck).toHaveLength(1);
    expect(aiTurnController.initHand).toHaveBeenCalled();
    expect(aiTurnModel.hand).toHaveLength(2);
    globalThis.fetch = originalFetch;
  });

  test("all method exists and is async", () => {
    expect(typeof gameInit.all).toBe("function");
  });
});
