/**
 * Module providing metadata for each elemental type used by the game.
 *
 * @module elements
 */

/**
 * An element descriptor.
 *
 * @typedef {Object} Element
 * @property {string} imagePath - Filename of the element icon (relative to the elements images folder).
 * @property {string} name - Identifier name for the element (lowercase, machine-friendly).
 */

/**
 * Mapping of numeric element IDs to their corresponding Element descriptors.
 *
 * Keys are numeric IDs used throughout the codebase to reference an element.
 *
 * @type {Object.<number, Element>}
 */
export const elements = {
  /** Water element */
  1: {
    /** Filename for water icon */
    imagePath: "1.png",
    /** Element name */
    name: "water",
  },
  /** Lightning element */
  2: {
    imagePath: "2.png",
    name: "lightning",
  },
  /** Fire element */
  3: {
    imagePath: "3.png",
    name: "fire",
  },
  /** Ice element */
  4: {
    imagePath: "4.png",
    name: "ice",
  },
  /** Earth element */
  5: {
    imagePath: "5.png",
    name: "earth",
  },
  /** Poison element */
  6: {
    imagePath: "6.png",
    name: "poison",
  },
  /** Holy element */
  7: {
    imagePath: "7.png",
    name: "holy",
  },
  /** Wind element */
  8: {
    imagePath: "8.png",
    name: "wind",
  },
};
