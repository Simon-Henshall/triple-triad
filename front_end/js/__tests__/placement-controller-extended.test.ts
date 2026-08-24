/**
 * @module placement-controller-extended
 * @description Unit tests for PlacementController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { debug } from "../utilities/debug.js";
import { PhaseChecker } from "../game/phases.js";

describe("PlacementController (extended)", () => {
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
    Game.models = {
      playerModel: {
        hand: [{ data: { name: "Card1" } }, { data: { name: "Card2" } }],
        selectedCard: undefined,
        selectedCardIndex: 0,
        selectedCardNumber: 0,
        playerHandCursor: {},
      },
    };
    BoardModel.selectedSquare = 5;
    BoardModel.squares = [];
    BoardModel.gridCursor = {};
    BoardModel.updateUISelection = jest.fn();
    PhaseChecker.playerChoosingCard = false;
    debug.active = false;
  });

  test("constructor stores playerModel, transition, creates resolutionView, sets model and placementComplete", () => {
    const playerModel = {};
    const ctrl = new PlacementController({ playerModel }, transitionMock);
    expect(ctrl.playerModel).toBe(playerModel);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.resolutionView).toBeDefined();
    expect(ctrl.placementComplete).toBe(false);
    expect(ctrl.model).toBeUndefined();
  });

  test("activate resets placementComplete and calls init", () => {
    const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
    ctrl.placementComplete = true;
    const initSpy = jest.spyOn(ctrl, "init");
    ctrl.activate();
    expect(ctrl.placementComplete).toBe(false);
    expect(initSpy).toHaveBeenCalled();
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

  describe("applyElementEffects", () => {
    test("calls model.applyElementEffects and showElementEffect when modified", () => {
      const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
      ctrl.model = {
        applyElementEffects: jest
          .fn()
          .mockReturnValue({ modified: true, image: "img.png" }),
        view: { showElementEffect: jest.fn() },
      };
      BoardModel.squares = [{ element: 1 }];
      BoardModel.selectedSquare = 1;
      const card = { visuals: {} };
      ctrl.applyElementEffects(card);
      expect(ctrl.model.view.showElementEffect).toHaveBeenCalledWith(
        card,
        "img.png",
      );
    });

    test("does not call showElementEffect when not modified", () => {
      const ctrl = new PlacementController({ playerModel: {} }, transitionMock);
      ctrl.model = {
        applyElementEffects: jest.fn().mockReturnValue({ modified: false }),
        view: { showElementEffect: jest.fn() },
      };
      BoardModel.squares = [];
      const card = { visuals: {} };
      ctrl.applyElementEffects(card);
      expect(ctrl.model.view.showElementEffect).not.toHaveBeenCalled();
    });
  });

  describe("playerTurnSwitch", () => {
    test("calls aiTurnController.takeTurn when current is red", () => {
      const playerModel = {
        hand: [{ data: { name: "C" }, visuals: { container: { y: 0 } } }],
      };
      const ctrl = new PlacementController({ playerModel }, transitionMock);
      ctrl.model = { view: { indentAfterPlacement: jest.fn() } };
      // Set to blue so swapPlayerTurn() toggles to red
      PhaseChecker.playerTurn = "blue";
      Game.controllers.aiTurnController.takeTurn = jest.fn();
      ctrl.playerTurnSwitch();
      expect(Game.controllers.aiTurnController.takeTurn).toHaveBeenCalled();
    });

    test("calls _preparePlayerTurn when current is blue", () => {
      const playerModel = {
        hand: [{ data: { name: "C" }, visuals: { container: { y: 0 } } }],
      };
      const ctrl = new PlacementController({ playerModel }, transitionMock);
      ctrl.model = { view: { indentAfterPlacement: jest.fn() } };
      // Set to red so swapPlayerTurn() toggles to blue
      PhaseChecker.playerTurn = "red";
      const prepareSpy = jest.spyOn(ctrl, "_preparePlayerTurn");
      ctrl.playerTurnSwitch();
      expect(prepareSpy).toHaveBeenCalled();
    });

    test("calls debug.logTurn when debug.active is true", () => {
      const playerModel = {
        hand: [{ data: { name: "C" }, visuals: { container: { y: 0 } } }],
      };
      const ctrl = new PlacementController({ playerModel }, transitionMock);
      ctrl.model = { view: { indentAfterPlacement: jest.fn() } };
      PhaseChecker.playerTurn = "red";
      debug.active = true;
      const logError = jest
        .spyOn(debug, "logTurn")
        .mockImplementation(() => {});
      ctrl.playerTurnSwitch();
      expect(logError).toHaveBeenCalled();
      logError.mockRestore();
    });
  });

  describe("_preparePlayerTurn", () => {
    test("resets player selection, places cursor, brings info box to front, sets PhaseChecker", () => {
      const playerModel = {
        hand: [{ data: { name: "C" }, visuals: { container: { y: 0 } } }],
      };
      const ctrl = new PlacementController({ playerModel }, transitionMock);
      ctrl.model = { view: { indentAfterPlacement: jest.fn() } };
      ctrl._preparePlayerTurn();
      expect(playerModel.selectedCardNumber).toBe(0);
      expect(playerModel.selectedCardIndex).toBe(0);
      expect(BoardModel.selectedSquare).toBe(5);
      expect(BoardModel.updateUISelection).toHaveBeenCalled();
      expect(
        Game.controllers.cursorController.playerHand.place,
      ).toHaveBeenCalled();
      expect(Game.stage.addChild).toHaveBeenCalledWith(
        playerModel.playerHandCursor,
      );
      expect(PhaseChecker.playerChoosingCard).toBe(true);
      expect(ctrl.model.view.indentAfterPlacement).toHaveBeenCalled();
    });

    test("handles empty hand gracefully", () => {
      const playerModel = { hand: [] };
      const ctrl = new PlacementController({ playerModel }, transitionMock);
      ctrl.model = { view: { indentAfterPlacement: jest.fn() } };
      expect(() => ctrl._preparePlayerTurn()).not.toThrow();
    });
  });
});
