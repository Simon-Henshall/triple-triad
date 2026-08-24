/*
 * @module card-claim-model
 * @description Unit tests for CardClaimModel
 */

import CardClaimModel from "../phases/card-claim/card-claim-model.js";

describe("CardClaimModel", () => {
  let cards;
  beforeEach(() => {
    cards = [
      { data: { id: 1, name: "Card A" } },
      { data: { id: 2, name: "Card B" } },
      { data: { id: 3, name: "Card C" } },
    ];
  });

  test("constructor defaults", () => {
    const m = new CardClaimModel();
    expect(m.aiInitialCards).toEqual([]);
    expect(m.selectedIndex).toBe(0);
  });

  test("constructor stores cards", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    expect(m.aiInitialCards).toBe(cards);
  });

  test("getSelectedCard returns first by default", () => {
    expect(
      new CardClaimModel({ aiInitialCards: cards }).getSelectedCard(),
    ).toBe(cards[0]);
  });

  test("getSelectedCard returns undefined when empty", () => {
    expect(new CardClaimModel().getSelectedCard()).toBeUndefined();
  });

  test("getSelectedCard respects index", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    m.selectedIndex = 2;
    expect(m.getSelectedCard()).toBe(cards[2]);
  });

  test("selectPrev wraps to last", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    m.selectPrev();
    expect(m.selectedIndex).toBe(2);
  });

  test("selectPrev decrements", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    m.selectedIndex = 2;
    m.selectPrev();
    expect(m.selectedIndex).toBe(1);
  });

  test("selectPrev does nothing when empty", () => {
    const m = new CardClaimModel();
    m.selectPrev();
    expect(m.selectedIndex).toBe(0);
  });

  test("selectNext wraps to first", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    m.selectedIndex = 2;
    m.selectNext();
    expect(m.selectedIndex).toBe(0);
  });

  test("selectNext increments", () => {
    const m = new CardClaimModel({ aiInitialCards: cards });
    m.selectNext();
    expect(m.selectedIndex).toBe(1);
  });

  test("selectNext does nothing when empty", () => {
    const m = new CardClaimModel();
    m.selectNext();
    expect(m.selectedIndex).toBe(0);
  });
});
