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

  rm.recordFlip(cardA);
  expect(rm.totalFlipped).toBe(1);
  expect(rm.hasFlips()).toBe(true);

  rm.reset();
  expect(rm.totalFlipped).toBe(0);
  expect(rm.getFlippedCards()).toHaveLength(0);
  expect(rm.hasFlips()).toBe(false);
});

test("recordFlip multiple distinct cards", () => {
  const rm = new ResolutionModel();
  const cardA = { id: "a" };
  const cardB = { id: "b" };
  const cardC = { id: "c" };

  rm.recordFlip(cardA);
  rm.recordFlip(cardB);
  rm.recordFlip(cardC);

  expect(rm.totalFlipped).toBe(3);
  expect(rm.getFlippedCards()).toHaveLength(3);
  expect(rm.hasFlips()).toBe(true);
});

test("isResolvingFlips is initially false", () => {
  const rm = new ResolutionModel();
  expect(rm.isResolvingFlips).toBe(false);
});

test("setResolvingFlips updates state", () => {
  const rm = new ResolutionModel();
  rm.setResolvingFlips(true);
  expect(rm.isResolvingFlips).toBe(true);
  rm.setResolvingFlips(false);
  expect(rm.isResolvingFlips).toBe(false);
});

test("reset clears isResolvingFlips", () => {
  const rm = new ResolutionModel();
  rm.setResolvingFlips(true);
  rm.reset();
  expect(rm.isResolvingFlips).toBe(false);
});
