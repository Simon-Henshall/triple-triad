/**
 * @module fallback-cards
 * @description Unit tests for the fallback-cards data module
 * ({@link module:../data/fallback-cards}), validating structure, value
 * ranges, and invariants across all fallback card descriptors.
 */

import { fallBackCardsForTesting } from "../data/fallback-cards.js";

/**
 * Verifies that fallBackCardsForTesting is a non-empty array and each entry
 * has valid card (positive integer), image (non-empty string), and count
 * (non-negative integer).
 */
test("fallback cards have valid structure", () => {
  expect(Array.isArray(fallBackCardsForTesting)).toBe(true);
  expect(fallBackCardsForTesting.length).toBeGreaterThan(0);

  for (const entry of fallBackCardsForTesting) {
    expect(typeof entry).toBe("object");
    expect(entry).not.toBeNull();

    // card id: positive integer
    expect(Number.isInteger(entry.card)).toBe(true);
    expect(entry.card).toBeGreaterThanOrEqual(1);

    // image: non-empty string
    expect(typeof entry.image).toBe("string");
    expect(entry.image.length).toBeGreaterThan(0);

    // count: non-negative integer
    expect(Number.isInteger(entry.count)).toBe(true);
    expect(entry.count).toBeGreaterThanOrEqual(0);
  }
});

/**
 * Verifies that fallback card ids are unique.
 */
test("fallback card ids are unique", () => {
  const ids = fallBackCardsForTesting.map((entry) => entry.card);
  expect(new Set(ids).size).toBe(ids.length);
});

/**
 * Verifies that fallback card images are unique.
 */
test("fallback card images are unique", () => {
  const images = fallBackCardsForTesting.map((entry) => entry.image);
  expect(new Set(images).size).toBe(images.length);
});

/**
 * Verifies the expected total count of fallback cards (110).
 */
test("fallback cards count is 110", () => {
  expect(fallBackCardsForTesting).toHaveLength(110);
});

/**
 * Verifies known fallback card entries match expected values.
 */
test("known fallback card entries", () => {
  // First entry
  expect(fallBackCardsForTesting[0]).toEqual({
    card: 1,
    image: "card0",
    count: 6,
  });

  // Last entry
  const last = fallBackCardsForTesting.at(-1);
  expect(last).toEqual({ card: 110, image: "card109", count: 5 });

  // Check a specific entry: card 66 (Krysta) has count 0
  const krysta = fallBackCardsForTesting.find((entry) => entry.card === 66);
  expect(krysta).toBeDefined();
  expect(krysta.count).toBe(0);

  // Card 90 (Diablos) has count 0
  const diablos = fallBackCardsForTesting.find((entry) => entry.card === 90);
  expect(diablos).toBeDefined();
  expect(diablos.count).toBe(0);
});

/**
 * Verifies that images follow the sequential "cardN" pattern from card0
 * through card109.
 */
test("fallback card images follow sequential pattern", () => {
  for (const [index, entry] of fallBackCardsForTesting.entries()) {
    expect(entry.image).toBe(`card${index}`);
  }
});

/**
 * Verifies that card ids are sequential from 1 to 110.
 */
test("fallback card ids are sequential from 1 to 110", () => {
  for (const [index, entry] of fallBackCardsForTesting.entries()) {
    expect(entry.card).toBe(index + 1);
  }
});
