/**
 * @module card-factory
 * @description Unit tests for the {@link createDeckFromFallback} and
 * {@link createDeckFromApi} factory functions.
 */

import {
  createDeckFromFallback,
  createDeckFromApi,
} from "../shared/card/card-factory.js";

describe("createDeckFromFallback", () => {
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
    const deck = createDeckFromFallback("player");

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
    const deck = createDeckFromFallback("ai");

    for (const card of deck) {
      expect(card.owner).toBe("ai");
    }
  });

  test("each card has valid strength values", () => {
    const deck = createDeckFromFallback("player");

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
    const deck = createDeckFromFallback("player");

    for (const card of deck) {
      expect(card.data.imagePath).toBeDefined();
      expect(typeof card.data.imagePath).toBe("string");
      expect(card.data.imagePath).toMatch(/\.png$/);
    }
  });

  test("each card has an id and name", () => {
    const deck = createDeckFromFallback("player");

    for (const card of deck) {
      expect(card.data.id).toBeDefined();
      expect(typeof card.data.id).toBe("number");
      expect(card.data.name).toBeDefined();
      expect(typeof card.data.name).toBe("string");
      expect(card.data.name.length).toBeGreaterThan(0);
    }
  });

  test("deck cards have unique ids", () => {
    const deck = createDeckFromFallback("player");
    const ids = deck.map((c) => c.data.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("createDeckFromApi", () => {
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
      };
    }
  });

  const sampleApiCards = [
    {
      id: 1,
      display_name: "Geezard",
      image: "card0",
      strength_up: 1,
      strength_right: 4,
      strength_down: 1,
      strength_left: 5,
      element_id: 0,
      quantity: 6,
    },
    {
      id: 7,
      display_name: "Gesper",
      image: "card6",
      strength_up: 1,
      strength_right: 5,
      strength_down: 4,
      strength_left: 1,
      element_id: 0,
      quantity: 7,
    },
    {
      id: 110,
      display_name: "Squall",
      image: "card109",
      strength_up: 10,
      strength_right: 4,
      strength_down: 6,
      strength_left: 9,
      element_id: 0,
      quantity: 5,
    },
  ];

  const edgeCaseCards = [
    {
      id: 109,
      display_name: "Seifer",
      image: "card108",
      strength_up: 6,
      strength_right: 9,
      strength_down: 10,
      strength_left: 4,
      element_id: 3,
      quantity: 0,
    },
    {
      id: 110,
      display_name: "Squall",
      image: "card109",
      strength_up: 10,
      strength_right: 4,
      strength_down: 6,
      strength_left: 9,
      element_id: 7,
      quantity: 5,
    },
  ];

  test("creates a deck from API response with correct structure", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");

    expect(Array.isArray(deck)).toBe(true);
    expect(deck.length).toBe(3);

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

  test("maps API fields correctly", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");

    expect(deck[0].data.id).toBe(1);
    expect(deck[0].data.name).toBe("Geezard");
    expect(deck[0].data.strength.up).toBe(1);
    expect(deck[0].data.strength.right).toBe(4);
    expect(deck[0].data.strength.down).toBe(1);
    expect(deck[0].data.strength.left).toBe(5);
    expect(deck[0].count).toBe(6);
    expect(deck[0].data.imagePath).toMatch(/card0\.png$/);

    expect(deck[2].data.id).toBe(110);
    expect(deck[2].data.name).toBe("Squall");
    expect(deck[2].data.strength.up).toBe(10);
    expect(deck[2].data.strength.right).toBe(4);
    expect(deck[2].data.strength.down).toBe(6);
    expect(deck[2].data.strength.left).toBe(9);
    expect(deck[2].count).toBe(5);
    expect(deck[2].data.imagePath).toMatch(/card109\.png$/);
  });

  test("creates deck for AI owner", () => {
    const deck = createDeckFromApi(sampleApiCards.slice(0, 1), "ai");

    expect(deck[0].owner).toBe("ai");
  });

  test("each card has valid strength values", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");

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

  test("handles zero quantity gracefully", () => {
    const deck = createDeckFromApi(edgeCaseCards, "player");

    expect(deck[0].count).toBe(0);
    expect(deck[0].data.name).toBe("Seifer");
    expect(deck[0].data.id).toBe(109);
  });

  test("handles non-zero element_id", () => {
    const deck = createDeckFromApi(edgeCaseCards, "player");

    expect(deck[0].data.element).toBe(3);
    expect(deck[1].data.element).toBe(7);
  });

  test("handles zero element_id (no element)", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");

    expect(deck[0].data.element).toBe(0);
  });

  test("deck cards have unique ids", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");
    const ids = deck.map((c) => c.data.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("produces valid image paths for every card", () => {
    const deck = createDeckFromApi(sampleApiCards, "player");

    for (const card of deck) {
      expect(card.data.imagePath).toBeDefined();
      expect(typeof card.data.imagePath).toBe("string");
      expect(card.data.imagePath).toMatch(/\.png$/);
    }
  });

  test("returns empty array for empty input", () => {
    const deck = createDeckFromApi([], "player");

    expect(deck).toEqual([]);
    expect(deck.length).toBe(0);
  });
});
