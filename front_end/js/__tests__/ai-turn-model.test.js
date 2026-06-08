/**
 * @module ai-turn-model
 * @description Unit tests for the AITurnModel class.
 */

import { jest } from "@jest/globals";
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

  test("chooseCard returns undefined when hand is empty", () => {
    expect(model.chooseCard()).toBeUndefined();
  });

  test("chooseCard returns a card from hand and removes it", () => {
    const card1 = { id: 1 };
    const card2 = { id: 2 };
    model.hand = [card1, card2];

    const chosen = model.chooseCard();

    expect([card1, card2]).toContain(chosen);
    expect(model.hand).toHaveLength(1);
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