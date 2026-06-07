/**
 * @module resolution-model
 * @description Unit tests for the {@link ResolutionModel} class.
 */

import ResolutionModel from "../phases/resolution/resolution-model.js";

/**
 * Verifies {@link ResolutionModel.recordFlip} correctly records a flipped card
 * and enforces uniqueness (recording the same card again does not increase the
 * count), {@link ResolutionModel.hasFlips} reflects whether any flips exist,
 * and {@link ResolutionModel.reset} clears all recorded flips.
 *
 * - Creates a new `ResolutionModel` instance.
 * - Records a flip for `cardA` and checks `.getFlippedCards()` and `.totalFlipped`.
 * - Records the same `cardA` again and asserts `.totalFlipped` remains `1` (uniqueness).
 * - Asserts `.hasFlips()` returns `true`.
 * - Resets the model and confirms `.totalFlipped` is `0`, `.getFlippedCards()` is empty,
 *   and `.hasFlips()` returns `false`.
 */
test("recordFlip, uniqueness, hasFlips, reset", () => {
  const rm = new ResolutionModel();
  const cardA = { id: "a" };

  rm.recordFlip(cardA);
  expect(rm.getFlippedCards()).toContain(cardA);
  expect(rm.totalFlipped).toBe(1);

  // recording same card again should not increase total
  rm.recordFlip(cardA);
  expect(rm.totalFlipped).toBe(1);
  expect(rm.hasFlips()).toBe(true);

  rm.reset();
  expect(rm.totalFlipped).toBe(0);
  expect(rm.getFlippedCards()).toHaveLength(0);
  expect(rm.hasFlips()).toBe(false);
});
