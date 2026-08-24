/**
 * @module cursor-model-extended
 * @description Unit tests for CursorModel (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { PhaseChecker } from "../game/phases.js";

describe("CursorModel (extended)", () => {
  let CursorModel;

  beforeAll(async () => {
    globalThis.SelectionBook = { controller: undefined };
    const module_ = await import("../shared/cursor/cursor-model.js");
    CursorModel = module_.CursorModel;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = {
      playerModel: {
        selectedCardNumber: 0,
        hand: [{ data: { id: 1 } }, { data: { id: 2 } }],
        playedCardsCount: 0,
        playerHandCursor: { x: 0, y: 0, visible: true },
      },
    };
    BoardModel.gridCursor = { x: 100, y: 100, visible: true };
    BoardModel.selectedSquare = 5;
    BoardModel.selectedRow = 2;
    BoardModel.selectedColumn = 2;
    BoardModel.selectedColumn = 2;
    BoardModel.freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    BoardModel.squares = [];
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    PhaseChecker.playerChoosingCard = false;
  });

  describe("selection", () => {
    test("initPosition sets cursor position relative to background", async () => {
      const deckModule = await import(
        "../phases/deck-selection/deck-selection-model.js"
      );
      deckModule.default.background = { x: 10, y: 20 };
      CursorModel.player = {
        playerHandSelectionCursor: { x: 0, y: 0 },
      };
      CursorModel.selection.initPosition();
      expect(CursorModel.player.playerHandSelectionCursor.x).toBe(-30);
      expect(CursorModel.player.playerHandSelectionCursor.y).toBe(78);
    });

    test("move with up direction moves selection up when above page start", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 2,
          displayedCards: [{}, {}, {}],
          selectPrevious: jest.fn(),
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("up");
      expect(
        globalThis.SelectionBook.controller.selectPrevious,
      ).toHaveBeenCalled();
    });

    test("move with up direction does not move below page start", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 0,
          displayedCards: [{}, {}, {}],
          selectPrevious: jest.fn(),
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("up");
      expect(
        globalThis.SelectionBook.controller.selectPrevious,
      ).not.toHaveBeenCalled();
    });

    test("move with down direction moves down when below page end", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 1,
          displayedCards: [{}, {}, {}],
          selectNext: jest.fn(),
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("down");
      expect(globalThis.SelectionBook.controller.selectNext).toHaveBeenCalled();
    });

    test("move with down direction does not move past page end", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 2,
          displayedCards: [{}, {}, {}],
          selectNext: jest.fn(),
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("down");
      expect(
        globalThis.SelectionBook.controller.selectNext,
      ).not.toHaveBeenCalled();
    });

    test("move with left direction paginates left", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 0,
          displayedCards: [{}],
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("left");
      expect(globalThis.SelectionBook.controller.paginate).toHaveBeenCalledWith(
        "left",
      );
    });

    test("move with right direction paginates right", () => {
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 0,
          displayedCards: [{}],
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("right");
      expect(globalThis.SelectionBook.controller.paginate).toHaveBeenCalledWith(
        "right",
      );
    });

    test("move with unknown direction warns", () => {
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      globalThis.SelectionBook = {
        controller: {
          pageStart: 0,
          selectedIndex: 0,
          displayedCards: [{}],
          paginate: jest.fn(),
        },
      };
      CursorModel.selection.move("diagonal");
      expect(logWarn).toHaveBeenCalled();
      logWarn.mockRestore();
    });
  });

  describe("confirmation", () => {
    test("resetChoice returns true and sets selected to 0 when model exists", async () => {
      const cvModule = await import(
        "../phases/confirmation/confirmation-view.js"
      );
      cvModule.ConfirmationView.model = {
        selectedIndex: 1,
        setSelected: jest.fn(),
      };
      const result = CursorModel.confirmation.resetChoice();
      expect(result).toBe(true);
      expect(cvModule.ConfirmationView.model.setSelected).toHaveBeenCalledWith(
        0,
      );
    });

    test("move up decrements and returns true when changed", async () => {
      const cvModule = await import(
        "../phases/confirmation/confirmation-view.js"
      );
      cvModule.ConfirmationView.model = {
        selectedIndex: 1,
        setSelected: jest.fn(function (index) {
          this.selectedIndex = index;
        }),
      };
      const result = CursorModel.confirmation.move("up");
      expect(result).toBe(true);
    });

    test("move down increments and returns true when changed", async () => {
      const cvModule = await import(
        "../phases/confirmation/confirmation-view.js"
      );
      cvModule.ConfirmationView.model = {
        selectedIndex: 0,
        setSelected: jest.fn(function (index) {
          this.selectedIndex = index;
        }),
      };
      const result = CursorModel.confirmation.move("down");
      expect(result).toBe(true);
    });
  });

  describe("playerHand", () => {
    test("init sets playerChoosingCard to true and positions cursor", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0 },
        handOffsetX: 100,
        playedCardsCount: 0,
      };
      CursorModel.playerHand.init();
      expect(PhaseChecker.playerChoosingCard).toBe(true);
    });

    test("move up when selected > 0 moves cursor up", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 100 },
        hand: [{}, {}, {}],
        cardsAboveSelection: 1,
      };
      Game.models.playerModel.selectedCardNumber = 1;
      const result = CursorModel.playerHand.move("up");
      expect(result).toBe(true);
    });

    test("move up when at top returns false", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0 },
        hand: [{}, {}],
        cardsAboveSelection: 0,
      };
      Game.models.playerModel.selectedCardNumber = 0;
      const result = CursorModel.playerHand.move("up");
      expect(result).toBe(false);
    });

    test("move down when not at last position moves cursor down", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0 },
        hand: [{}, {}, {}],
        cardsAboveSelection: 0,
      };
      Game.models.playerModel.selectedCardNumber = 0;
      const result = CursorModel.playerHand.move("down");
      expect(result).toBe(true);
    });

    test("move down when at last position returns false", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0 },
        hand: [{}, {}],
        cardsAboveSelection: 1,
      };
      Game.models.playerModel.selectedCardNumber = 1;
      const result = CursorModel.playerHand.move("down");
      expect(result).toBe(false);
    });

    test("move with unknown direction returns false", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0 },
        hand: [{}, {}],
        cardsAboveSelection: 0,
      };
      const result = CursorModel.playerHand.move("sideways");
      expect(result).toBe(false);
    });

    test("clear sets playerChoosingCard to false and hides cursor", () => {
      CursorModel.player = {
        playerHandCursor: { x: 0, y: 0, visible: true },
      };
      CursorModel.playerHand.clear();
      expect(PhaseChecker.playerChoosingCard).toBe(false);
      expect(CursorModel.player.playerHandCursor.visible).toBe(false);
    });
  });

  describe("grid", () => {
    test("move left updates column and selection", () => {
      BoardModel.gridCursor = { x: 500, y: 100 };
      BoardModel.selectedColumn = 2;
      CursorModel.grid.move("left");
      expect(BoardModel.gridCursor.x).toBeLessThan(500);
    });

    test("move up updates row and selection", () => {
      BoardModel.gridCursor = { x: 100, y: 500 };
      BoardModel.selectedRow = 3;
      CursorModel.grid.move("up");
      expect(BoardModel.gridCursor.y).toBeLessThan(500);
    });

    test("move right updates column and selection", () => {
      BoardModel.gridCursor = { x: 100, y: 100 };
      BoardModel.selectedColumn = 1;
      CursorModel.grid.move("right");
      expect(BoardModel.gridCursor.x).toBeGreaterThan(100);
    });

    test("move down updates row and selection", () => {
      BoardModel.gridCursor = { x: 100, y: 100 };
      BoardModel.selectedRow = 1;
      CursorModel.grid.move("down");
      expect(BoardModel.gridCursor.y).toBeGreaterThan(100);
    });

    test("move with unknown direction warns", () => {
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      CursorModel.grid.move("diagonal");
      expect(logWarn).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("clear sets playerSelectingPlacement to false", () => {
      PhaseChecker.playerSelectingPlacement = true;
      CursorModel.grid.clear();
      expect(PhaseChecker.playerSelectingPlacement).toBe(false);
    });
  });
});
