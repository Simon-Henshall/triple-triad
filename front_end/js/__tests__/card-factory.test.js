/**
 * @module card-factory
 * @description Unit tests for the {@link createDeck} factory function.
 */

import { createDeckFromFallback } from "../shared/card/card-factory.js";

describe("createDeck", () => {
  beforeEach(() => {
    // Ensure createjs globals are available
    if (globalThis.createjs === undefined) {
      globalThis.createjs = {
        Container: function () {
          /**
           * Mock implementation of addChild that adds a child to the container's children array.
           */
          this.addChild = () => {};
          this.children = [];
        },
        Bitmap: function () {
          this.image = {
            complete: true,
            naturalWidth: 100,
            naturalHeight: 100,
          };
        },
        Ticker: {
          /**
           * Mock implementation of setFPS that does nothing.
           */
          setFPS: () => {},
          /**
           * Mock implementation of addEventListener that does nothing.
           */
          addEventListener: () => {},
        },
        Shape: function () {
          this.graphics = {
            /**
             * Mock implementation of beginFill that returns the graphics object for chaining.
             */
            beginFill: () => this,
            /**
             * Mock implementation of drawRect that does nothing.
             */
            drawRect: () => {},
          };
          /**
           * Mock implementation of setBounds that does nothing.
           */
          this.setBounds = () => {};
        },
        Text: function () {},
        Stage: function () {
          this.canvas = { width: 800, height: 600 };
          /**
           * Mock implementation of addChild that does nothing.
           */
          this.addChild = () => {};
          /**
           * Mock implementation of update that does nothing.
           */
          this.update = () => {};
        },
      };
    }
  });

  test("creates a deck of cards with correct structure", () => {
    const deck = createDeck("player");

    expect(Array.isArray(deck)).toBe(true);
    expect(deck.length).toBeGreaterThan(0);

    for (const card of deck) {
      expect(card).toHaveProperty("data");
      expect(card.data).toHaveProperty("id");
      expect(card.data).toHaveProperty("name");
      expect(card.data).toHaveProperty("strength");
      expect(card.data).toHaveProperty("imagePath");
      expect(card).toHaveProperty("owner", "player");
      expect(card).toHaveProperty("count");
      expect(typeof card.count).toBe("number");
      expect(card.count).toBeGreaterThanOrEqual(0);
    }
  });

  test("creates deck for AI owner", () => {
    const deck = createDeck("ai");

    for (const card of deck) {
      expect(card.owner).toBe("ai");
    }
  });

  test("each card has valid strength values", () => {
    const deck = createDeck("player");

    for (const card of deck) {
      expect(card.data.strength).toBeDefined();
      expect(typeof card.data.strength.up).toBe("number");
      expect(typeof card.data.strength.down).toBe("number");
      expect(typeof card.data.strength.left).toBe("number");
      expect(typeof card.data.strength.right).toBe("number");
      expect(card.data.strength.up).toBeGreaterThanOrEqual(0);
      expect(card.data.strength.up).toBeLessThanOrEqual(10);
      expect(card.data.strength.down).toBeGreaterThanOrEqual(0);
      expect(card.data.strength.down).toBeLessThanOrEqual(10);
      expect(card.data.strength.left).toBeGreaterThanOrEqual(0);
      expect(card.data.strength.left).toBeLessThanOrEqual(10);
      expect(card.data.strength.right).toBeGreaterThanOrEqual(0);
      expect(card.data.strength.right).toBeLessThanOrEqual(10);
    }
  });

  test("each card has a valid image path", () => {
    const deck = createDeck("player");

    for (const card of deck) {
      expect(card.data.imagePath).toBeDefined();
      expect(typeof card.data.imagePath).toBe("string");
      expect(card.data.imagePath).toMatch(/\.png$/);
    }
  });

  test("each card has an id and name", () => {
    const deck = createDeck("player");

    for (const card of deck) {
      expect(card.data.id).toBeDefined();
      expect(typeof card.data.id).toBe("number");
      expect(card.data.name).toBeDefined();
      expect(typeof card.data.name).toBe("string");
      expect(card.data.name.length).toBeGreaterThan(0);
    }
  });

  test("deck cards have unique ids", () => {
    const deck = createDeck("player");
    const ids = deck.map((c) => c.data.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
