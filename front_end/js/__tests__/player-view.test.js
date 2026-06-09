/**
 * @module player-view
 * @description Unit tests for PlayerView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("PlayerView", () => {
  let PlayerView;
  let DeckSelectionModel;

  beforeAll(async () => {
    const module_ = await import("../shared/player/player-view.js");
    PlayerView = module_.PlayerView;

    const modelModule = await import(
      "../phases/deck-selection/deck-selection-model.js"
    );
    DeckSelectionModel = modelModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    Game.stage = {
      canvas: { width: 800, height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      numChildren: 10,
      getNumChildren: jest.fn().mockReturnValue(10),
      getChildIndex: jest.fn().mockReturnValue(0),
      setChildIndex: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
    };

    Game.views = {};
    Game.models = {};
  });

  describe("constructor", () => {
    test("stores playerModel reference", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      expect(view.model).toBe(mockModel);
    });

    test("initializes cardsInPlayerHand as empty array", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      expect(view.cardsInPlayerHand).toEqual([]);
    });

    test("initializes stack offsets from offsets constants", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      expect(view.stackOffsetX).toBeDefined();
      expect(view.stackOffsetY).toBeDefined();
      expect(view.stackSpacing).toBeDefined();
      expect(typeof view.stackOffsetX).toBe("number");
      expect(typeof view.stackOffsetY).toBe("number");
      expect(typeof view.stackSpacing).toBe("number");
    });
  });

  describe("animateCardToHand", () => {
    test("adds card to stage when not removing", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const mockCardContainer = { x: 0, y: 0 };

      view.animateCardToHand(mockCardContainer, 0, false);

      expect(mockCardContainer.x).toBeDefined();
      expect(mockCardContainer.y).toBeDefined();
      expect(Game.stage.addChild).toHaveBeenCalledWith(mockCardContainer);
      expect(view.cardsInPlayerHand).toContain(mockCardContainer);
    });

    test("inserts card at correct index in cardsInPlayerHand", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const card1 = { x: 0, y: 0 };
      const card2 = { x: 0, y: 0 };

      view.animateCardToHand(card1, 0, false);
      view.animateCardToHand(card2, 0, false);

      expect(view.cardsInPlayerHand[0]).toBe(card2);
      expect(view.cardsInPlayerHand[1]).toBe(card1);
    });

    test("does not add to stage when removing", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const mockCardContainer = { x: 0, y: 0 };

      view.animateCardToHand(mockCardContainer, 0, true);

      expect(Game.stage.addChild).not.toHaveBeenCalled();
    });

    test("sets card position for adding", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const mockCardContainer = { x: 0, y: 999 };

      view.animateCardToHand(mockCardContainer, 0, false);

      // Card Y should be set to canvas height + 200 initially (for adding)
      expect(mockCardContainer.y).toBe(800);
    });
  });

  describe("indentSelectedCard", () => {
    test("indents selected card by moving x left", () => {
      const mockModel = { hand: [], previouslySelectedCard: undefined };
      const view = new PlayerView(mockModel);

      const mockSelectedCard = {
        data: { name: "Test Card" },
        visuals: { container: { x: 100 } },
      };

      view.indentSelectedCard(mockSelectedCard);

      expect(mockSelectedCard.visuals.container.x).toBe(70);
    });

    test("unindents previously selected card", () => {
      const previousCard = {
        data: { name: "Previous Card" },
        visuals: { container: { x: 70 } },
      };
      const mockModel = {
        hand: [],
        previouslySelectedCard: previousCard,
      };
      const view = new PlayerView(mockModel);

      const mockSelectedCard = {
        data: { name: "New Card" },
        visuals: { container: { x: 100 } },
      };

      view.indentSelectedCard(mockSelectedCard);

      expect(previousCard.visuals.container.x).toBe(100);
    });

    test("updates previouslySelectedCard reference", () => {
      const mockModel = { hand: [], previouslySelectedCard: undefined };
      const view = new PlayerView(mockModel);

      const mockSelectedCard = {
        data: { name: "Test Card" },
        visuals: { container: { x: 100 } },
      };

      view.indentSelectedCard(mockSelectedCard);

      expect(mockModel.previouslySelectedCard).toBe(mockSelectedCard);
    });
  });

  describe("resetHand", () => {
    test("removes all hand cards from stage", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const card1 = { id: "card1" };
      const card2 = { id: "card2" };
      view.cardsInPlayerHand = [card1, card2];

      Game.stage.contains = jest.fn().mockReturnValue(true);

      view.resetHand();

      expect(Game.stage.removeChild).toHaveBeenCalledWith(card1);
      expect(Game.stage.removeChild).toHaveBeenCalledWith(card2);
      expect(view.cardsInPlayerHand).toEqual([]);
    });

    test("does not remove cards not in stage", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const card1 = { id: "card1" };
      view.cardsInPlayerHand = [card1];

      Game.stage.contains = jest.fn().mockReturnValue(false);

      view.resetHand();

      expect(Game.stage.removeChild).not.toHaveBeenCalled();
      expect(view.cardsInPlayerHand).toEqual([]);
    });

    test("calls stage.update", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      view.resetHand();

      expect(Game.stage.update).toHaveBeenCalled();
    });

    test("handles empty hand gracefully", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      view.cardsInPlayerHand = [];

      expect(() => view.resetHand()).not.toThrow();
      expect(Game.stage.update).toHaveBeenCalled();
    });
  });

  describe("_updateHandAndPreviewZOrder", () => {
    test("does not throw with no preview card", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      expect(() => view._updateHandAndPreviewZOrder()).not.toThrow();
    });

    test("sets preview card z-index when present and in stage", () => {
      const mockModel = { hand: [] };
      const view = new PlayerView(mockModel);

      const mockPreviewCard = { id: "preview" };
      DeckSelectionModel.displayedCard = mockPreviewCard;

      Game.stage.contains = jest.fn().mockReturnValue(true);
      Game.stage.numChildren = 10;

      view._updateHandAndPreviewZOrder(true);

      expect(Game.stage.setChildIndex).toHaveBeenCalled();

      // Cleanup
      DeckSelectionModel.displayedCard = undefined;
    });
  });
});
