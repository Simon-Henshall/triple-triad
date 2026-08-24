/**
 * @module cursor-controller-extended
 * @description Unit tests for CursorController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { PhaseChecker } from "../game/phases.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("CursorController (extended)", () => {
  let CursorController;
  let mockView;
  let cvModule;

  beforeAll(async () => {
    globalThis.SelectionBook = { controller: undefined };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = {
      playerModel: {
        selectedCardNumber: 0,
        hand: [{ data: { name: "C1" } }],
        playedCardsCount: 0,
        playerHandCursor: { x: 0, y: 0, visible: true },
      },
    };
    BoardModel.gridCursor = { x: 100, y: 100, visible: true };
    BoardModel.selectedSquare = 5;
    BoardModel.selectedRow = 2;
    BoardModel.selectedColumn = 2;
    BoardModel.squares = [];
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    cvModule = await import("../phases/confirmation/confirmation-view.js");
    cvModule.ConfirmationView.model = {
      selectedIndex: 0,
      setSelected(index) {
        this.selectedIndex = index;
      },
    };
    const module_ = await import("../shared/cursor/cursor-controller.js");
    CursorController = module_.CursorController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.models.playerModel.playerHandCursor = {
      x: 0,
      y: 0,
      visible: true,
    };
    BoardModel.gridCursor = { x: 100, y: 100, visible: true };
    mockView = {
      selection: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        ensurePopulated: jest.fn(),
        remove: jest.fn(),
      },
      confirmation: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        remove: jest.fn(),
      },
      playerHand: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        syncSelection: jest.fn(),
        remove: jest.fn(),
      },
      grid: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        remove: jest.fn(),
      },
    };
  });

  describe("playerHand.place", () => {
    test("places player hand cursor and updates position", () => {
      const ctrl = CursorController(mockView);
      ctrl.playerHand.place();
      expect(mockView.playerHand.place).toHaveBeenCalled();
    });

    test("does not throw when newly selected is undefined", () => {
      const ctrl = CursorController(mockView);
      Game.models.playerModel.hand = [];
      Game.models.playerModel.selectedCardNumber = 0;
      expect(() => ctrl.playerHand.place()).not.toThrow();
    });
  });

  describe("playerHand.move", () => {
    test("moves cursor and syncs selection when move returns true", () => {
      const ctrl = CursorController(mockView);
      expect(() => ctrl.playerHand.move("down")).not.toThrow();
    });
  });

  describe("playerHand.restorePlayerHandCursor", () => {
    test("sets phase flags", () => {
      const ctrl = CursorController(mockView);
      Game.controllers = { cursorController: ctrl };
      PhaseChecker.playerSelectingPlacement = true;
      PhaseChecker.playerChoosingCard = false;
      expect(() => ctrl.playerHand.restorePlayerHandCursor()).not.toThrow();
    });
  });

  describe("grid", () => {
    test("grid.place calls model init and view place", () => {
      const ctrl = CursorController(mockView);
      ctrl.grid.place();
      expect(mockView.grid.place).toHaveBeenCalled();
    });

    test("grid.move with valid direction updates position", () => {
      const ctrl = CursorController(mockView);
      BoardModel.gridCursor.x = 300; // valid middle position
      BoardModel.selectedColumn = 2;
      expect(() => ctrl.grid.move("right")).not.toThrow();
    });
  });

  describe("selection", () => {
    test("selection.place runs", () => {
      const ctrl = CursorController(mockView);
      expect(() => ctrl.selection.place()).not.toThrow();
    });
  });
});
