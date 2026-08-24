/**
 * @module rng
 * @description Unit tests for the RNG class (Linear Congruential Generator).
 */

import { RNG } from "../utilities/rng.js";

describe("RNG", () => {
  describe("constructor", () => {
    test("creates an instance with default seed 0", () => {
      const rng = new RNG();
      expect(rng.state).toBe(0);
    });

    test("creates an instance with a given seed", () => {
      const rng = new RNG(12_345);
      expect(rng.state).toBe(12_345);
    });

    test("coerces negative seed to unsigned 32-bit", () => {
      const rng = new RNG(-1);
      expect(rng.state).toBe(4_294_967_295);
    });

    test("coerces floating-point seed to unsigned 32-bit", () => {
      const rng = new RNG(3.14);
      expect(rng.state).toBe(3);
    });

    test("sets MULTIPLIER constant as 1664525", () => {
      const rng = new RNG();
      expect(rng.MULTIPLIER).toBe(1_664_525);
    });

    test("sets INCREMENT constant as 1013904223", () => {
      const rng = new RNG();
      expect(rng.INCREMENT).toBe(1_013_904_223);
    });
  });

  describe("next", () => {
    test("returns a number between 0 and 255 inclusive", () => {
      const rng = new RNG(42);
      for (let index = 0; index < 100; index++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    test("returns deterministic sequence for same seed", () => {
      const rngA = new RNG(9999);
      const rngB = new RNG(9999);

      for (let index = 0; index < 20; index++) {
        expect(rngA.next()).toBe(rngB.next());
      }
    });

    test("returns different sequence for different seeds", () => {
      const rngA = new RNG(100);
      const rngB = new RNG(200);

      const seqA = Array.from({ length: 10 }, () => rngA.next());
      const seqB = Array.from({ length: 10 }, () => rngB.next());

      expect(seqA).not.toEqual(seqB);
    });

    test("advances the internal state each call", () => {
      const rng = new RNG(1);
      const stateBefore = rng.state;
      rng.next();
      expect(rng.state).not.toBe(stateBefore);
    });

    test("produces known sequence for seed 0", () => {
      const rng = new RNG(0);
      expect(rng.next()).toBe(60);
    });
  });

  describe("reset", () => {
    test("resets state to the given seed", () => {
      const rng = new RNG(42);
      rng.next();
      rng.next();
      rng.reset(42);
      expect(rng.state).toBe(42);
    });

    test("resets state to 0 by default", () => {
      const rng = new RNG(9999);
      rng.next();
      rng.reset();
      expect(rng.state).toBe(0);
    });

    test("produces identical sequence after reset", () => {
      const rng = new RNG(777);
      const first = rng.next();
      rng.next();
      rng.next();

      rng.reset(777);
      expect(rng.next()).toBe(first);
    });
  });
});
