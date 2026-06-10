/**
 * @module deck-selection-controller
 * @description Unit tests for the DeckSelectionController class.
 */

import { jest } from "@jest/globals";
import { DeckSelectionController } from "../phases/deck-selection/deck-selection-controller.js";
import { Game } from "../shared/game/game.js";

/**
 * Helper function to create a fake card object for testing.
 * @param {number} id - The unique identifier for the card.
 * @param {string} name - The name of the card.
 * @param {number} count - The number of copies of the card in the deck (default is 3).
 * @returns {object} A fake card object with the specified properties.
 */
function fakeCard(id, name, count = 3) {
  return {
    data: {
      id,
      name,
      element: undefined,
      strength: { up: 1, down: 2, left: 3, right: 4 },
    },
    remaining: count,
    count,
    selected: 0,
    selectedCount: 0,
  };
}

describe("DeckSelectionController", () => {
  let controller;
  let mockPlayerModel;

  beforeEach(() => {
    jest.clearAllMocks();
    Game.models = { playerModel: undefined };
    Game.stage = undefined;

    mockPlayerModel = {
      hand: [],
      deck: [],
      selectedCard: undefined,
      selectedCardNumber: 0,
    };

    const deck = [
      fakeCard(1, "Card1", 3),
      fakeCard(2, "Card2", 3),
      fakeCard(3, "Card3", 3),
      fakeCard(4, "Card4", 3),
      fakeCard(5, "Card5", 3),
      fakeCard(6, "Card6", 0),
    ];

    controller = new DeckSelectionController({
      deck,
      playerModel: mockPlayerModel,
    });
  });

  test("constructor stores cards and playerModel", () => {
    expect(controller.playerModel).toBe(mockPlayerModel);
    expect(controller.cards).toHaveLength(6);
    expect(controller.currentPage).toBe(1);
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("constructor maps initially hidden cards correctly", () => {
    const hiddenCard = controller.cards.find((c) => c.data.id === 6);
    expect(hiddenCard.initiallyHidden).toBe(true);
    const visibleCard = controller.cards.find((c) => c.data.id === 1);
    expect(visibleCard.initiallyHidden).toBe(false);
  });

  test("displayedCards filters out initially hidden cards", () => {
    const displayed = controller.displayedCards;
    expect(displayed).toHaveLength(5);
    for (const card of displayed) {
      expect(card.initiallyHidden).toBe(false);
    }
  });

  test("displayedCards recalculates remaining based on hand", () => {
    mockPlayerModel.hand = [{ data: { id: 1 } }, { data: { id: 1 } }];
    const displayed = controller.displayedCards;
    const card1 = displayed.find((c) => c.data.id === 1);
    expect(card1.remaining).toBe(1);
  });

  test("visibleCards returns current page slice", () => {
    const visible = controller.visibleCards;
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThanOrEqual(controller.cardsPerPage);
  });

  test("totalPages calculates correctly", () => {
    expect(controller.totalPages).toBe(1);
  });

  test("selectedCard returns the card at selectedIndexOnPage", () => {
    expect(controller.selectedCard).toBeDefined();
    expect(controller.selectedCard).toStrictEqual(controller.visibleCards[0]);
  });

  test("moveNext advances the cursor", () => {
    controller.moveNext();
    expect(controller.selectedIndexOnPage).toBe(1);
  });

  test("moveNext does not go past the end", () => {
    for (let index = 0; index < 100; index++) {
      controller.moveNext();
    }
    expect(controller.selectedIndexOnPage).toBe(
      controller.visibleCards.length - 1,
    );
  });

  test("moveNext on empty list does nothing", () => {
    controller = new DeckSelectionController({
      deck: [],
      playerModel: mockPlayerModel,
    });
    controller.moveNext();
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("movePrevious decrements the cursor", () => {
    controller.selectedIndexOnPage = 3;
    controller.movePrevious();
    expect(controller.selectedIndexOnPage).toBe(2);
  });

  test("movePrevious does not go below 0", () => {
    controller.movePrevious();
    controller.movePrevious();
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("paginate right advances page and resets index", () => {
    controller.paginate("right");
    expect(controller.currentPage).toBe(1);
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("paginate left goes back a page", () => {
    controller.currentPage = 2;
    controller.paginate("left");
    expect(controller.currentPage).toBe(1);
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("paginate left does not go below page 1", () => {
    controller.paginate("left");
    expect(controller.currentPage).toBe(1);
  });

  test("paginate resets selectedIndexOnPage", () => {
    controller.selectedIndexOnPage = 3;
    controller.paginate("right");
    expect(controller.selectedIndexOnPage).toBe(0);
  });

  test("activate sets up the selection book via Game", () => {
    Game.models = { playerModel: mockPlayerModel };
    Game.controllers = {};
    Game.views = {};
    Game.ui = {};
    Game.stage = {
      addChild: jest.fn(),
      update: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
    };
    expect(() => controller.activate()).not.toThrow();
  });

  test("deactivate does not throw", () => {
    expect(() => controller.deactivate()).not.toThrow();
  });
});
