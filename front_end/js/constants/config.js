/**
 * @file Configuration constants for the front-end game.
 * @module config
 */

/**
 * Configuration options used across the front-end.
 *
 * @typedef {Object} Config
 * @property {string} imagePath - Base path (relative to project root) where general images are stored.
 *   Example: "front_end/images/".
 * @property {string} cardPath - Path (relative to `imagePath`) where card images are stored.
 *   Example: "front_end/images/cards/".
 * @property {number} fps - Target frames-per-second used by rendering/animation loops.
 */

/**
 * Application configuration values.
 *
 * These values are imported by various modules to determine where image assets live
 * and how frequently the game updates its rendering loop.
 *
 * @type {Config}
 */
export const config = {
  /**
   * Base path (relative to project root) for images.
   * @type {string}
   */
  imagePath: "front_end/images/",

  /**
   * Path (relative to project root) for card images.
   * @type {string}
   */
  cardPath: "front_end/images/cards/",

  /**
   * Target frames-per-second for animations and rendering.
   * Use an integer > 0. Typical values: 30, 60.
   * @type {number}
   */
  fps: 60,
};
