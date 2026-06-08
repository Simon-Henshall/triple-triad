/**
 * @module placement-controller
 * @description Unit tests for PlacementController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("PlacementController", () => {
  let PlacementController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import("../phases/placement/placement-controller.js");
    PlacementController = module_.PlacementController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.controllers = {
      aiTurnController: { takeTurn: jest.fn() },
      cursorController: {
        playerHand: { place: jest.fn() },
      },
    };
    Game.stage = { addChild: jest.fn() };
    Game.models = { playerModel: { hand: [] } };
    BoardModel.selectedSquare = 5;
    BoardModel.squares = [];
    BoardModel.gridCursor = {};
  });

  test("constructor stores playerModel and transition", () => {
    const playerModel = {};
    const ctrl = new PlacementController({ playerModel }, transitionMock);
    expect(ctrl.playerModel).toBe(playerModel);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.placementComplete).toBe(false);
  });

  test("activate resets placementComplete and calls init", () => {
    const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
    ctrl.placementComplete = true;
    ctrl.activate();
    expect(ctrl.placementComplete).toBe(false);
  });

  test("deactivate does not throw", () => {
    const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
    expect(() => ctrl.deactivate()).not.toThrow();
  });

  test("init creates a PlacementModel", () => {
    const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
    ctrl.init();
    expect(ctrl.model).toBeDefined();
  });
});
