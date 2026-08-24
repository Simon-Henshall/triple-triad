/**
 * @module game-over-controller-extended
 * @description Unit tests for GameOverController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("GameOverController (extended)", () => {
  let GameOverController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import("../phases/game-over/game-over-controller.js");
    GameOverController = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = {
      playerModel: { totalBlueCards: 0 },
      aiTurnModel: { currentlyOwnedCards: 0 },
    };
    Game.ui = { scoreBoard: { update: jest.fn() } };
    Game.rules = [];
  });

  test("constructor creates model and view", () => {
    const ctrl = new GameOverController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
  });

  test("activate displays outcome via view", async () => {
    const ctrl = new GameOverController({}, transitionMock);
    const displaySpy = jest.spyOn(ctrl.view, "displayOutcome");
    await ctrl.activate();
    expect(displaySpy).toHaveBeenCalled();
  });

  test("activate with sudden_death rule and draw outcome restarts game", async () => {
    Game.rules = ["sudden_death"];
    const startGameSpy = jest
      .spyOn(Game, "startGame")
      .mockImplementation(() => {});
    const ctrl = new GameOverController(
      {
        playerModel: { totalBlueCards: 5 },
        aiTurnModel: { currentlyOwnedCards: 5 },
      },
      transitionMock,
    );
    jest.spyOn(ctrl.model, "determineOutcome").mockReturnValue("draw");
    jest
      .spyOn(ctrl.model, "getCardCounts")
      .mockReturnValue({ playerCards: 5, aiCards: 5 });
    await ctrl.activate();
    expect(startGameSpy).toHaveBeenCalled();
    startGameSpy.mockRestore();
  });

  test("activate with non-draw outcome does not restart", async () => {
    const ctrl = new GameOverController(
      {
        playerModel: { totalBlueCards: 5 },
        aiTurnModel: { currentlyOwnedCards: 2 },
      },
      transitionMock,
    );
    jest.spyOn(ctrl.model, "determineOutcome").mockReturnValue("win");
    jest
      .spyOn(ctrl.model, "getCardCounts")
      .mockReturnValue({ playerCards: 5, aiCards: 2 });
    const startGameSpy = jest
      .spyOn(Game, "startGame")
      .mockImplementation(() => {});
    await ctrl.activate();
    expect(startGameSpy).not.toHaveBeenCalled();
    startGameSpy.mockRestore();
  });

  test("deactivate calls view.cleanup", async () => {
    const ctrl = new GameOverController({}, transitionMock);
    const cleanupSpy = jest.spyOn(ctrl.view, "cleanup");
    await ctrl.deactivate();
    expect(cleanupSpy).toHaveBeenCalled();
  });
});
