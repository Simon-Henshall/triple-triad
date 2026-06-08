/**
 * @module resolution-controller
 * @description Unit tests for ResolutionController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("ResolutionController", () => {
  let ResolutionController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/resolution/resolution-controller.js"
    );
    ResolutionController = module_.ResolutionController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.models = {
      playerModel: { totalBlueCards: 0 },
      aiTurnModel: { currentlyOwnedCards: 0 },
    };
    Game.ui = { scoreBoard: { update: jest.fn() } };
    Game.stage = new createjs.Stage();
    BoardModel.squares = [];
  });

  test("constructor supports legacy usage with function arg", () => {
    const ctrl = new ResolutionController(transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
  });

  test("activate calls transition with end-turn", async () => {
    const ctrl = new ResolutionController({}, transitionMock);
    await ctrl.activate();
    expect(transitionMock).toHaveBeenCalledWith("end-turn");
  });

  test("deactivate does not throw", async () => {
    const ctrl = new ResolutionController({}, transitionMock);
    await expect(ctrl.deactivate()).resolves.not.toThrow();
  });

  test("updateOwnershipCounts updates blue player correctly", () => {
    const ctrl = new ResolutionController({}, transitionMock);
    ctrl.updateOwnershipCounts(1);
    expect(Game.models.playerModel.totalBlueCards).toBe(1);
  });
});
