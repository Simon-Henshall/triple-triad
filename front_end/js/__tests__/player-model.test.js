/**
 * @module player-model
 * @description Unit tests for the {@link PlayerModel} class, covering hand
 * management, deck operations, selection, and reset logic.
 */

import { PlayerModel } from "../shared/player/player-model.js";

/**
 * Creates a minimal Card-like object suitable for use in PlayerModel tests.
 * @param {number} id
 * @param {string} name
 * @param {number} [count=1]
 * @returns {{ data: { id: number, name: string }, remaining: number, count: number, selectedCount: number }}
 */
function fakeCard(id, name, count = 1) {
  return {
    data: { id, name },
    remaining: count,
    count,
    selectedCount: 0,
  };
}

/**
 * Creates a fresh PlayerModel instance with a deck of fake cards ready for
 * testing.
 * @param {number} [deckSize=5]
 * @returns {PlayerModel}
 */
function createPlayerModel(deckSize = 5) {
  const view = {
    /**
     *
     */
    resetHandSlots: () => {},
    /** @param {*} _container @param {number} _index @param {boolean} _reverse */
    animateCardToHand: () => {},
    cardsInPlayerHand: [],
  };
  const pm = new PlayerModel({ view });
  for (let index = 0; index < deckSize; index++) {
    pm.deck.push(fakeCard(index, `Card${index}`, 3));
  }
  return pm;
}

/**
 * Verifies that a new PlayerModel starts with an empty hand, selectedCard
 * undefined, and the expected number of deck cards.
 */
test("initial state is correct", () => {
  const pm = createPlayerModel(5);
  expect(pm.hand).toHaveLength(0);
  expect(pm.selectedCard).toBeUndefined();
  expect(pm.deck).toHaveLength(5);
  expect(pm.playedCardsCount).toBe(0);
});

/**
 * Verifies that addCardToHand moves a card from the deck into the hand,
 * decrements the deck's remaining count, and increments selectedCount.
 */
test("addCardToHand moves card from deck to hand", () => {
  const pm = createPlayerModel(3);
  const card = pm.deck[0];

  const result = pm.addCardToHand(card);

  expect(result).toBe(true);
  expect(pm.hand).toHaveLength(1);
  expect(pm.hand[0].data.id).toBe(card.data.id);
  expect(card.remaining).toBe(2); // decremented from 3
  expect(card.selectedCount).toBe(1);
});

/**
 * Verifies that addCardToHand returns false and does not add when there are
 * no remaining copies of the card in the deck.
 */
test("addCardToHand returns false when no copies remain", () => {
  const pm = createPlayerModel(1);
  const card = pm.deck[0];
  card.remaining = 0;

  const result = pm.addCardToHand(card);
  expect(result).toBe(false);
  expect(pm.hand).toHaveLength(0);
});

/**
 * Verifies that multiple cards can be added to hand up to the deck limits.
 */
test("addCardToHand supports adding multiple different cards", () => {
  const pm = createPlayerModel(5);
  pm.addCardToHand(pm.deck[0]);
  pm.addCardToHand(pm.deck[1]);
  pm.addCardToHand(pm.deck[2]);

  expect(pm.hand).toHaveLength(3);
  expect(pm.deck[0].remaining).toBe(2);
  expect(pm.deck[1].remaining).toBe(2);
  expect(pm.deck[2].remaining).toBe(2);
});

/**
 * Verifies that removeLastCardFromHand removes the card and restores one
 * remaining count to the corresponding deck card.
 */
test("removeLastCardFromHand returns card to deck", () => {
  const pm = createPlayerModel(3);
  pm.addCardToHand(pm.deck[0]);

  const removed = pm.removeLastCardFromHand();
  expect(removed).toBeTruthy();
  expect(pm.hand).toHaveLength(0);
  expect(pm.deck[0].remaining).toBe(3); // restored
});

/**
 * Verifies that removeLastCardFromHand returns false when hand is empty.
 */
test("removeLastCardFromHand returns false on empty hand", () => {
  const pm = createPlayerModel(3);
  const result = pm.removeLastCardFromHand();
  expect(result).toBe(false);
});

/**
 * Verifies that getHandCard returns the correct card or undefined.
 */
test("getHandCard returns correct card or undefined", () => {
  const pm = createPlayerModel(3);
  pm.addCardToHand(pm.deck[0]);
  pm.addCardToHand(pm.deck[1]);

  expect(pm.getHandCard(0).data.id).toBe(0);
  expect(pm.getHandCard(1).data.id).toBe(1);
  expect(pm.getHandCard(5)).toBeUndefined();
});

/**
 * Verifies that resetHand clears the hand, restores all deck remaining
 * counts, resets selectedCount, and calls view.resetHandSlots.
 */
test("resetHand restores deck and clears hand", () => {
  let resetHandCalled = false;
  const view = {
    /**
     *
     */
    resetHandSlots: () => {
      resetHandCalled = true;
    },
    /**
     *
     */
    animateCardToHand: () => {},
    cardsInPlayerHand: [],
  };
  const pm = new PlayerModel({ view });
  pm.deck.push(fakeCard(0, "Card0", 5));
  pm.addCardToHand(pm.deck[0]);
  pm.addCardToHand(pm.deck[0]);
  expect(pm.hand).toHaveLength(2);
  expect(pm.deck[0].remaining).toBe(3);
  expect(pm.deck[0].selectedCount).toBe(2);

  pm.resetHand();

  expect(pm.hand).toHaveLength(0);
  expect(pm.deck[0].remaining).toBe(5);
  expect(pm.deck[0].selectedCount).toBe(0);
  expect(resetHandCalled).toBe(true);
});
