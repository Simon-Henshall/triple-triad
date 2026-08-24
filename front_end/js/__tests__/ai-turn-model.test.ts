/**
 * @module ai-turn-model
 * @description Unit tests for the AITurnModel class.
 */

import { AITurnModel } from "../phases/ai-turn/ai-turn-model.js";

describe("AITurnModel", () => {
  let model;

  beforeEach(() => {
    model = new AITurnModel();
  });

  test("constructor sets initial state", () => {
    expect(model.deck).toEqual([]);
    expect(model.hand).toEqual([]);
    expect(model.movesRemaining).toBe(0);
    expect(model.cardsAboveSelection).toBe(0);
    expect(model.currentlyOwnedCards).toBe(5);
  });

  test("populateHand draws cards up to maxHandSize from deck", () => {
    const fakeCard = { id: 1 };
    model.deck = [fakeCard, { id: 2 }, { id: 3 }];

    const drawn = model.populateHand(3);

    expect(drawn).toHaveLength(3);
    expect(model.hand).toHaveLength(3);
    expect(model.movesRemaining).toBe(3);
    expect(model.deck).toHaveLength(0);
  });

  test("populateHand stops when deck is empty", () => {
    model.deck = [{ id: 1 }];

    const drawn = model.populateHand(5);

    expect(drawn).toHaveLength(1);
    expect(model.hand).toHaveLength(1);
    expect(model.movesRemaining).toBe(1);
  });

  test("populateHand with 0 maxHandSize draws nothing", () => {
    model.deck = [{ id: 1 }, { id: 2 }];
    const drawn = model.populateHand(0);
    expect(drawn).toHaveLength(0);
    expect(model.hand).toHaveLength(0);
  });

  test("chooseCard returns -1 when hand is empty", () => {
    expect(model.chooseCard()).toBe(-1);
  });

  test("chooseCard returns a valid index and sets cardsAboveSelection", () => {
    const card1 = { id: 1 };
    const card2 = { id: 2 };
    const card3 = { id: 3 };
    model.hand = [card1, card2, card3];

    const chosenIndex = model.chooseCard();
    const expectedIndex = model.cardsAboveSelection;

    expect(chosenIndex).toBe(expectedIndex);
    expect(chosenIndex).toBeGreaterThanOrEqual(0);
    expect(chosenIndex).toBeLessThan(3);
    // The card should still be in the hand (not removed yet)
    expect(model.hand).toHaveLength(3);
  });

  test("takeCard removes and returns the card at cardsAboveSelection", () => {
    const card1 = { id: 1 };
    const card2 = { id: 2 };
    const card3 = { id: 3 };
    model.hand = [card1, card2, card3];
    model.cardsAboveSelection = 1;

    const taken = model.takeCard();

    expect(taken).toBe(card2);
    expect(model.hand).toHaveLength(2);
    expect(model.hand[0]).toBe(card1);
    expect(model.hand[1]).toBe(card3);
  });

  test("takeCard returns undefined when cardsAboveSelection is out of range", () => {
    model.hand = [{ id: 1 }];
    model.cardsAboveSelection = -1;
    expect(model.takeCard()).toBeUndefined();

    model.cardsAboveSelection = 5;
    expect(model.takeCard()).toBeUndefined();
  });

  test("decrementMove reduces movesRemaining", () => {
    model.movesRemaining = 3;
    model.decrementMove();
    expect(model.movesRemaining).toBe(2);
    model.decrementMove();
    expect(model.movesRemaining).toBe(1);
  });

  test("isTurnComplete returns true when no moves left", () => {
    model.movesRemaining = 0;
    expect(model.isTurnComplete()).toBe(true);
  });

  test("isTurnComplete returns false when moves remain", () => {
    model.movesRemaining = 1;
    expect(model.isTurnComplete()).toBe(false);
  });

  test("isTurnComplete returns true for negative movesRemaining", () => {
    model.movesRemaining = -1;
    expect(model.isTurnComplete()).toBe(true);
  });

  test("resetHand clears hand and movesRemaining", () => {
    model.hand = [{ id: 1 }];
    model.movesRemaining = 3;
    model.resetHand();
    expect(model.hand).toEqual([]);
    expect(model.movesRemaining).toBe(0);
  });

  test("getCardCountDisplay returns currentlyOwnedCards", () => {
    model.currentlyOwnedCards = 7;
    expect(model.getCardCountDisplay()).toBe(7);
  });
});
