/**
 * @module card
 * @description Unit tests for the {@link Card} class.
 */

import { Card } from "../shared/card/card.js";

/**
 * Verifies Card construction, {@link Card.setCount}, {@link Card.setOwner},
 * and {@link Card.clone}.
 *
 * - Constructs a Card from sample data with an owner of `"player"` and a count of `2`.
 * - Checks `.data.id` and `.owner`.
 * - Calls `setCount(5)` and confirms `.count` reflects the new value.
 * - Sets up a minimal `visuals.container` mock (including nested mocks for
 *   `.stage.update`, `.getChildByName`, and `.clone`) so that `setOwner` does
 *   not throw.
 * - Calls `setOwner("ai")` and verifies the return value and the updated
 *   `.owner` property.
 * - Calls `clone({ owner: "ai", count: 1 })` and verifies the result is a
 *   `Card` instance with the correct `.data.id` and `.owner`.
 */
test("Card construction, setCount, setOwner, clone", () => {
  const sample = {
    id: 1,
    name: "One",
    element: undefined,
    strength: { up: 1, down: 2, left: 3, right: 4 },
    imagePath: "img.png",
  };

  const card = new Card(sample, "player", 2);
  expect(card.data.id).toBe(1);
  expect(card.owner).toBe("player");

  card.setCount(5);
  expect(card.count).toBe(5);

  // Ensure visuals.container exists so setOwner doesn't try to access undefined
  card.visuals.container = {
    /**
     * Mock implementation of getChildByName – returns undefined.
     *
     * @param {string} _name The child name to look up (ignored).
     * @returns {undefined}
     */
    getChildByName: () => {},

    /** @type {Array<*>} */
    children: [],

    /** @type {object} */
    stage: {
      /**
       * Mock for stage.update – no-op.
       */
      update: () => {},
    },

    /**
     * Returns a minimal mock container stub with its own `getChildByName`
     * and `children` array.
     *
     * @param {boolean} _deep Whether to deep-clone (ignored).
     * @returns {object} A mock container object.
     */
    clone: (deep) => ({
      /**
       * Mock implementation of getChildByName – returns undefined.
       *
       * @param {string} __name The child name to look up (ignored).
       * @returns {undefined}
       */
      getChildByName: () => {},
      /** @type {Array<*>} */
      children: [],
    }),
  };

  const returnValue = card.setOwner("ai");
  expect(returnValue).toBe("ai");
  expect(card.owner).toBe("ai");

  const clone = card.clone({ owner: "ai", count: 1 });
  expect(clone).toBeInstanceOf(Card);
  expect(clone.data.id).toBe(1);
  expect(clone.owner).toBe("ai");
});
