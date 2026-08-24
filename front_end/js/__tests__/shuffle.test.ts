/**
 * @module shuffle
 * @description Unit tests for the {@link module:../utilities/shuffle} shuffle function.
 */

import { shuffle } from "../utilities/shuffle.js";

/**
 * Verifies that {@link shuffle} returns a new array containing all the
 * original elements (same length, same elements regardless of order).
 *
 * - Creates a source array `[1, 2, 3, 4, 5]`.
 * - Calls `shuffle` on a copy of that array.
 * - Asserts the output has the same length as the source.
 * - Asserts the sorted output matches the sorted copy of the source,
 *   confirming no elements were lost, added, or duplicated.
 */
test("shuffle retains elements and length", () => {
  const array = [1, 2, 3, 4, 5];
  const copy = [...array];
  const out = shuffle([...array]);
  expect(out).toHaveLength(array.length);
  expect([...out].sort()).toEqual([...copy].sort());
});
