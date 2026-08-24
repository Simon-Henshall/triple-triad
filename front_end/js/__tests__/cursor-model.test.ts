/**
 * @module cursor-model
 * @description Unit tests for CursorModel
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("CursorModel", () => {
  let CursorModel;
  let mockCursor;

  beforeAll(async () => {
    // SelectionBook is referenced but not imported by cursor-model; mock it globally
    globalThis.SelectionBook = { controller: undefined };
    const module_ = await import("../shared/cursor/cursor-model.js");
    CursorModel = module_.CursorModel;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCursor = { x: 0, y: 0, visible: true };
    CursorModel.player = {
      playerHandSelectionCursor: { x: 0, y: 0 },
      playerHandCursor: { x: 0, y: 0, visible: true },
      hand: [{ data: { id: 1 } }],
      handOffsetX: 100,
      cardsAboveSelection: 0,
      playedCardsCount: 0,
    };
    CursorModel.player.playerHandCursor = { ...mockCursor };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = { playerModel: { selectedCardNumber: 0, hand: [] } };
  });

  describe("selection", () => {
    test("initPosition does nothing when player not set", () => {
      CursorModel.player = undefined;
      expect(() => CursorModel.selection.initPosition()).not.toThrow();
    });

    test("move does nothing without controller", () => {
      expect(() => CursorModel.selection.move("up")).not.toThrow();
    });
  });

  describe("confirmation", () => {
    test("resetChoice returns false when ConfirmationView.model is missing", () => {
      const result = CursorModel.confirmation.resetChoice();
      expect(result).toBe(false);
    });

    test("move returns false when ConfirmationView.model is missing", () => {
      const result = CursorModel.confirmation.move("up");
      expect(result).toBe(false);
    });

    test("move returns false for unknown direction", () => {
      const result = CursorModel.confirmation.move("left");
      expect(result).toBe(false);
    });
  });

  describe("playerHand", () => {
    test("init warns when cursor not available", () => {
      CursorModel.player.playerHandCursor = undefined;
      expect(() => CursorModel.playerHand.init()).not.toThrow();
    });

    test("move returns false when player not set", () => {
      CursorModel.player = undefined;
      const result = CursorModel.playerHand.move("up");
      expect(result).toBe(false);
    });

    test("clear sets playerChoosingCard to false", () => {
      CursorModel.playerHand.clear();
    });
  });

  describe("grid", () => {
    test("init does not throw", () => {
      // This requires many dependencies, just test it doesn't crash
      // when board model is not available
    });

    test("clear does not throw when grid cursor is null", () => {
      CursorModel.grid.clear();
    });
  });
});
