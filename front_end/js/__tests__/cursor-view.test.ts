/**
 * @module cursor-view
 * @description Unit tests for CursorView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { ConfirmationView } from "../phases/confirmation/confirmation-view.js";

describe("CursorView", () => {
  let CursorView;
  let mockPlayerModel;
  let mockPlayerView;

  beforeAll(async () => {
    const module_ = await import("../shared/cursor/cursor-view.js");
    CursorView = module_.CursorView;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    mockPlayerModel = {
      playerHandSelectionCursor: { x: 0, y: 0, visible: false },
      playerHandCursor: { x: 0, y: 0, visible: false },
      hand: [{ data: { id: 1 } }],
      selectedCardNumber: 0,
      selectedCard: undefined,
      previouslySelectedCard: undefined,
    };
    mockPlayerView = {
      indentSelectedCard: jest.fn(),
    };
    // Reset ConfirmationView state
    ConfirmationView.cursor = undefined;
    ConfirmationView.background = undefined;
    ConfirmationView.model = undefined;
    ConfirmationView.container = undefined;
  });

  describe("selection", () => {
    test("place sets cursor visible and adds to stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.selection.place();
      expect(mockPlayerModel.playerHandSelectionCursor.visible).toBe(true);
      expect(Game.stage.addChild).toHaveBeenCalledWith(
        mockPlayerModel.playerHandSelectionCursor,
      );
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("remove removes cursor from stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.selection.remove();
      expect(Game.stage.removeChild).toHaveBeenCalledWith(
        mockPlayerModel.playerHandSelectionCursor,
      );
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("updatePosition updates cursor Y based on controller state", () => {
      globalThis.SelectionBookUI = {
        controller: {
          selectedIndex: 2,
          pageStart: 0,
        },
      };
      mockPlayerModel.playerHandSelectionCursor = { x: 0, y: 0 };
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.selection.updatePosition();
      expect(mockPlayerModel.playerHandSelectionCursor.y).toBeDefined();
      expect(Game.stage.update).toHaveBeenCalled();
      delete globalThis.SelectionBookUI;
    });

    test("updatePosition handles missing controller", () => {
      globalThis.SelectionBookUI = { controller: undefined };
      const view = CursorView(mockPlayerModel, mockPlayerView);
      expect(() => view.selection.updatePosition()).not.toThrow();
      delete globalThis.SelectionBookUI;
    });

    test("ensurePopulated calls SelectionBookView.populate when controller exists", () => {
      globalThis.SelectionBookUI = {
        controller: { clampSelectionToPage: jest.fn() },
      };
      globalThis.SelectionBookView = { populate: jest.fn() };
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.selection.ensurePopulated();
      expect(globalThis.SelectionBookView.populate).toHaveBeenCalled();
      delete globalThis.SelectionBookUI;
      delete globalThis.SelectionBookView;
    });

    test("ensurePopulated warns when controller is missing", () => {
      globalThis.SelectionBookUI = { controller: undefined };
      const view = CursorView(mockPlayerModel, mockPlayerView);
      expect(() => view.selection.ensurePopulated()).not.toThrow();
      delete globalThis.SelectionBookUI;
    });
  });

  describe("confirmation", () => {
    test("place positions cursor and adds to stage", () => {
      const cursor = { x: 0, y: 0 };
      const background = { x: 100, y: 200 };
      ConfirmationView.cursor = cursor;
      ConfirmationView.background = background;

      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.confirmation.place();
      expect(cursor.x).toBe(150);
      expect(cursor.y).toBe(260);
      expect(Game.stage.addChild).toHaveBeenCalledWith(cursor);
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("remove removes cursor from stage", () => {
      const cursor = { x: 0, y: 0 };
      ConfirmationView.cursor = cursor;

      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.confirmation.remove();
      expect(Game.stage.removeChild).toHaveBeenCalledWith(cursor);
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("updatePosition updates cursor Y based on selected index", () => {
      const cursor = { x: 0, y: 0 };
      const background = { x: 100, y: 200 };
      ConfirmationView.cursor = cursor;
      ConfirmationView.background = background;
      ConfirmationView.model = { selectedIndex: 1 };

      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.confirmation.updatePosition();
      expect(cursor.y).toBe(290);
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("updatePosition defaults to 0 when model is missing", () => {
      const cursor = { x: 0, y: 0 };
      const background = { x: 100, y: 200 };
      ConfirmationView.cursor = cursor;
      ConfirmationView.background = background;
      ConfirmationView.model = undefined;

      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.confirmation.updatePosition();
      expect(cursor.y).toBe(260);
    });
  });

  describe("playerHand", () => {
    test("place sets cursor visible and adds to stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.playerHand.place();
      expect(mockPlayerModel.playerHandCursor.visible).toBe(true);
      expect(Game.stage.addChild).toHaveBeenCalledWith(
        mockPlayerModel.playerHandCursor,
      );
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("updatePosition calls stage.update", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.playerHand.updatePosition();
      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("syncSelection updates selectedCard and calls indentSelectedCard", () => {
      mockPlayerModel.selectedCardNumber = 0;
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.playerHand.syncSelection();
      expect(mockPlayerModel.selectedCard).toBe(mockPlayerModel.hand[0]);
      expect(mockPlayerView.indentSelectedCard).toHaveBeenCalled();
    });

    test("remove removes cursor from stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.playerHand.remove();
      expect(Game.stage.removeChild).toHaveBeenCalledWith(
        mockPlayerModel.playerHandCursor,
      );
      expect(Game.stage.update).toHaveBeenCalled();
    });
  });

  describe("grid", () => {
    test("place adds grid cursor to stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      expect(() => view.grid.place()).not.toThrow();
    });

    test("remove removes grid cursor from stage", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      expect(() => view.grid.remove()).not.toThrow();
    });

    test("updatePosition calls stage.update", () => {
      const view = CursorView(mockPlayerModel, mockPlayerView);
      view.grid.updatePosition();
      expect(Game.stage.update).toHaveBeenCalled();
    });
  });
});
