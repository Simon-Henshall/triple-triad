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
    Game.stage = new createjs.Stage();
    Game.models = { playerModel: { hand: [] } };
    BoardModel.grid = Array.from({ length: 9 }, () => {});
  });

  test("constructor creates model and view", () => {
    const ctrl = new EndTurnController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
  });

  test("deactivate does not throw", () => {
    const ctrl = new EndTurnController({}, transitionMock);
    expect(() => ctrl.deactivate()).not.toThrow();
  });
});
