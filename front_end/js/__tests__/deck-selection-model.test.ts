/**
 * @module deck-selection-model
 * @description Unit tests for DeckSelectionModel
 */

import DeckSelectionModel from "../phases/deck-selection/deck-selection-model.js";

describe("DeckSelectionModel", () => {
  let model;

  beforeEach(() => {
    model = new DeckSelectionModel();
  });

  test("constructor initializes container as a createjs.Container", () => {
    expect(model.container).toBeDefined();
    expect(model.container.children).toEqual([]);
  });

  test("constructor initializes all properties to undefined", () => {
    expect(model.background).toBeUndefined();
    expect(model.shownCards).toBeUndefined();
    expect(model.page).toBe(1);
    expect(model.pageDisplay).toBeUndefined();
    expect(model.totalPages).toBeUndefined();
    expect(model.remainingCards).toBeUndefined();
    expect(model.displayedCards).toBeUndefined();
    expect(model.displayedCard).toBeUndefined();
    expect(model.displayedCardImage).toBeUndefined();
    expect(model.displayedCardColour).toBeUndefined();
    expect(model.selectedHandCardNumber).toBe(0);
    expect(model.selectedHandCard).toBeUndefined();
  });
});
