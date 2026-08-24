/**
 * rng.js
 *
 * Linear Congruential Generator (LCG) for Triple Triad.
 * Implements 8-bit/32-bit PRNG.
 *
 * Uses a 32-bit LCG with 8-bit output (0-255).
 *
 * Formula: state = (state * multiplier + increment) mod 2^32
 * Return:  state >>> 24 (top 8 bits, 0-255)
 */

/**
 * Linear Congruential Generator
 */
export class RNG {
  /**
   * Creates a new RNG instance.
   * @param {number} seed - Initial seed value (default 0)
   */
  constructor(seed = 0) {
    /** @type {number} Current internal state */
    this.state = seed >>> 0;
    /** @type {number} LCG multiplier (standard constant) */
    this.MULTIPLIER = 1_664_525;
    /** @type {number} LCG increment (standard constant) */
    this.INCREMENT = 1_013_904_223;
  }

  /**
   * Advance the state and return a value 0-255.
   * @returns {number} 0-255 value (top 8 bits of the state)
   */
  next() {
    this.state = (this.MULTIPLIER * this.state + this.INCREMENT) >>> 0;
    // eslint-disable-next-line unicorn/number-literal-case
    return (this.state >>> 24) & 0xff;
  }

  /**
   * Reset the RNG to a new seed.
   * @param {number} seed
   */
  reset(seed = 0) {
    this.state = seed >>> 0;
  }
}
