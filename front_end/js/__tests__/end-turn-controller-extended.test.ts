/**
 * @module end-turn-controller-extended
 * @description Unit tests for EndTurnController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { PhaseChecker } from "../game/phases.js";

describe("EndTurnController (extended)", () => {
  let EndTurnController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import("../phases/end-turn/end-turn-controller.js");
    EndTurnController = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = { playerModel: { hand: [] } };
    Game.ui = { scoreBoard: { update: jest.fn() } };
    BoardModel.isGameOver = jest.fn().mockReturnValue(false);
    PhaseChecker.playerTurn = "blue";
  });

  test("constructor stores transition and creates model and view", () => {
    const ctrl = new EndTurnController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
  });

  test("activate updates scoreboard and transitions to hand-select for blue turn", async () => {
    // Set the turn to blue - the activate will swap to red, then re-swap back to blue via logic
    // Since getPlayerTurn returns blue by default and swapPlayerTurn is called,
    // after activation, turn is swapped to red. But then `current === "red"` transitions to "ai-turn"
    // So we need PhaseChecker.playerTurn = undefined to test the case where it starts as "blue"
    // and after swap becomes "red"
    // The test should check that hand-select is called when initial turn is "red"
    PhaseChecker.playerTurn = "red";
    const ctrl = new EndTurnController({}, transitionMock);
    await ctrl.activate();
    expect(Game.ui.scoreBoard.update).toHaveBeenCalled();
    // After swapping from red, current is blue, transitions to hand-select
    expect(transitionMock).toHaveBeenCalledWith("hand-select");
    expect(PhaseChecker.playerChoosingCard).toBe(true);
  });

  test("activate transitions to ai-turn for blue turn", async () => {
    // start as blue (default), after swap, current is red, transitions to ai-turn
    PhaseChecker.playerTurn = "blue";
    const ctrl = new EndTurnController({}, transitionMock);
    await ctrl.activate();
    expect(transitionMock).toHaveBeenCalledWith("ai-turn");
    expect(PhaseChecker.playerChoosingCard).toBe(false);
  });

  test("activate transitions to game-over when board is full", async () => {
    BoardModel.isGameOver = jest.fn().mockReturnValue(true);
    const ctrl = new EndTurnController({}, transitionMock);
    await ctrl.activate();
    expect(transitionMock).toHaveBeenCalledWith("game-over");
  });

  test("activate handles scoreboard update errors", async () => {
    const ctrl = new EndTurnController({}, transitionMock);
    ctrl.model.getScoreboard = jest.fn().mockReturnValue({
      update: jest.fn().mockImplementation(() => {
        throw new Error("Scoreboard error");
      }),
    });
    const logError = jest.spyOn(console, "error").mockImplementation(() => {});
    await ctrl.activate();
    expect(logError).toHaveBeenCalled();
    logError.mockRestore();
  });

  test("deactivate does not throw", async () => {
    const ctrl = new EndTurnController({}, transitionMock);
    await expect(ctrl.deactivate()).resolves.not.toThrow();
  });
});
