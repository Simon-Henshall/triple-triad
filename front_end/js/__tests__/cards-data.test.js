/**
 * @module cards-data
 * @description Unit tests for the cards data module
 * ({@link module:../data/cards}), validating structure, value ranges, and
 * invariants across all card definitions.
 */

import { cards } from "../data/cards.js";

/**
 * Verifies that the cards array is not empty and each entry has the expected
 * shape: displayName (non-empty string), image (non-empty string),
 * four direction strengths (1-10 integers), element (integer >= 0).
 */
test("all cards have valid structure and value ranges", () => {
  expect(Array.isArray(cards)).toBe(true);
  expect(cards.length).toBeGreaterThan(0);

  for (const card of cards) {
    expect(typeof card.displayName).toBe("string");
    expect(card.displayName.length).toBeGreaterThan(0);

    expect(typeof card.image).toBe("string");
    expect(card.image.length).toBeGreaterThan(0);

    // Strength values should be integers between 1 and 10
    expect(Number.isInteger(card.strengthUp)).toBe(true);
    expect(card.strengthUp).toBeGreaterThanOrEqual(1);
    expect(card.strengthUp).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strengthRight)).toBe(true);
    expect(card.strengthRight).toBeGreaterThanOrEqual(1);
    expect(card.strengthRight).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strengthDown)).toBe(true);
    expect(card.strengthDown).toBeGreaterThanOrEqual(1);
    expect(card.strengthDown).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strengthLeft)).toBe(true);
    expect(card.strengthLeft).toBeGreaterThanOrEqual(1);
    expect(card.strengthLeft).toBeLessThanOrEqual(10);

    // Element should be a non-negative integer
    expect(Number.isInteger(card.element)).toBe(true);
    expect(card.element).toBeGreaterThanOrEqual(0);
    expect(card.element).toBeLessThanOrEqual(8);
  }
});

/**
 * Verifies that all card image identifiers are unique.
 */
test("all card images are unique", () => {
  const images = cards.map((card) => card.image);
  expect(new Set(images).size).toBe(images.length);
});

/**
 * Verifies that all card display names are unique.
 */
test("all card display names are unique", () => {
  const names = cards.map((card) => card.displayName);
  expect(new Set(names).size).toBe(names.length);
});

/**
 * Verifies the count of total cards.
 */
test("cards count matches expected total (110)", () => {
  expect(cards).toHaveLength(110);
});

/**
 * Verifies known card entries: first, last, and a few middle cards.
 */
test("known card entries have expected values", () => {
  // First card
  expect(cards[0].displayName).toBe("Geezard");
  expect(cards[0].strengthUp).toBe(1);
  expect(cards[0].element).toBe(0);

  // Last card
  const last = cards.at(-1);
  expect(last.displayName).toBe("Squall");
  expect(last.image).toBe("card109");

  // PuPu (index 47) – has a strength value of 10
  const pupu = cards.find((c) => c.displayName === "PuPu");
  expect(pupu).toBeDefined();
  expect(pupu.strengthRight).toBe(10);

  // Chubby Chocobo has strengthLeft = 9
  const chocobo = cards.find((c) => c.displayName === "Chubby Chocobo");
  expect(chocobo).toBeDefined();
  expect(chocobo.strengthLeft).toBe(9);
});

/**
 * Verifies element field is one of the known element IDs (0-8).
 */
test("every card element is in valid range [0, 8]", () => {
  for (const card of cards) {
    expect(card.element).toBeGreaterThanOrEqual(0);
    expect(card.element).toBeLessThanOrEqual(8);
  }
});

/**
 * Verifies that image paths follow the "cardN" pattern sequentially from
 * card0 to card109.
 */
test("image identifiers follow sequential cardN pattern", () => {
  for (const [index, card] of cards.entries()) {
    expect(card.image).toBe(`card${index}`);
  }
});
