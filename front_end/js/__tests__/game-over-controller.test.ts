/**
 * @module game-over-controller
 * @description Unit tests for GameOverController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("GameOverController", () => {
  let GameOverController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import("../phases/game-over/game-over-controller.js");
    GameOverController = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.stage = new createjs.Stage();
  });

  test("constructor creates model and view", () => {
    const ctrl = new GameOverController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
  });
});
