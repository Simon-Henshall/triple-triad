/**
 * @module end-turn-controller
 * @description Unit tests for EndTurnController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("EndTurnController", () => {
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
    BoardModel.selectedSquare = 5;
    BoardModel.squares = [];
    BoardModel.gridCursor = {};
    BoardModel.isGameOver = jest.fn().mockReturnValue(false);
  });

  test("constructor stores transition and creates model/view", () => {
    const ctrl = new EndTurnController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
  });

  test("constructor stores transition as undefined when not provided", () => {
    const ctrl = new EndTurnController({});
    expect(ctrl.transition).toBeUndefined();
  });

  test("deactivate does not throw", async () => {
    const ctrl = new EndTurnController({}, transitionMock);
    expect(async () => await ctrl.deactivate()).not.toThrow();
  });
});
