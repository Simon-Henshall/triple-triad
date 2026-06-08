/**
 * @module hand-select-controller
 * @description Unit tests for HandSelectController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("HandSelectController", () => {
  let HandSelectController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/hand-select/hand-select-controller.js"
    );
    HandSelectController = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.controllers = {
      cursorController: {
        grid: { place: jest.fn() },
      },
    };
    Game.stage = new createjs.Stage();
  });

  test("constructor stores dependencies and creates model/view", () => {
    const playerModel = {
      hand: [],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const deps = {
      playerModel,
      cursorController: {},
      handUI: {},
      boardModel: {},
    };
    const ctrl = new HandSelectController(deps, transitionMock);
    expect(ctrl.playerModel).toBe(playerModel);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
    expect(Game.controllers.handSelectController).toBe(ctrl);
  });

  test("deactivate sets playerChoosingCard to false", async () => {
    const ctrl = new HandSelectController(
      { playerModel: { hand: [] } },
      transitionMock,
    );
    await ctrl.deactivate();
    const module_ = await import("../game/phases.js");
    expect(module_.PhaseChecker.playerChoosingCard).toBe(false);
  });

  test("playSelectedCard warns when no card is selected", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const ctrl = new HandSelectController({ playerModel: {} }, transitionMock);
    ctrl.playSelectedCard();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
