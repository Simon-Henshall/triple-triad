/**
 * @module constants
 * @description Unit tests for the project constant modules: config, offsets,
 * directions, and elements. These are pure data objects so we validate
 * structure, types, and value ranges.
 */

import { config } from "../constants/config.js";
import { offsets } from "../constants/offsets.js";
import { directionMap } from "../constants/directions.js";
import { elements } from "../constants/elements.js";

// ----- config -----

/**
 * Verifies that config.imagePath is a non-empty string, config.cardPath
 * ends with a slash, and config.fps is a positive integer.
 */
test("config has correct shape and values", () => {
  expect(typeof config.imagePath).toBe("string");
  expect(config.imagePath.length).toBeGreaterThan(0);

  expect(typeof config.cardPath).toBe("string");
  expect(config.cardPath.length).toBeGreaterThan(0);

  expect(Number.isInteger(config.fps)).toBe(true);
  expect(config.fps).toBeGreaterThan(0);
});

// ----- offsets -----

/**
 * Verifies that all offset numeric values are positive finite numbers
 * and that certain known-dimension offsets satisfy expected ratios
 * (e.g. cell width/height > 0, card dimensions > 0).
 */
test("offsets has correct shape and values", () => {
  // All numeric offset properties should be finite numbers.
  const numericKeys = [
    "gameOffsetX",
    "gameOffsetY",
    "handOffsetY",
    "handCardOffset",
    "cardOffsetX",
    "cardOffsetY",
    "playerCursorOffset",
    "cellWidth",
    "cellHeight",
    "offscreenY",
    "aiOffscreenX",
    "playerOffscreenX",
    "cardWidth",
    "cardHeight",
    "scaledCardWidth",
    "scaledCardHeight",
    "previewX",
    "previewY",
    "previewWidth",
    "previewHeight",
    "scaledPreviewWidth",
    "scaledPreviewHeight",
  ];

  for (const key of numericKeys) {
    expect(Number.isFinite(offsets[key])).toBe(true);
  }

  // Position/size values should be positive
  const positiveKeys = [
    "gameOffsetX",
    "gameOffsetY",
    "handOffsetY",
    "handCardOffset",
    "cardOffsetX",
    "cardOffsetY",
    "playerCursorOffset",
    "cellWidth",
    "cellHeight",
    "aiOffscreenX",
    "playerOffscreenX",
    "cardWidth",
    "cardHeight",
    "scaledCardWidth",
    "scaledCardHeight",
    "previewX",
    "previewY",
    "previewWidth",
    "previewHeight",
    "scaledPreviewWidth",
    "scaledPreviewHeight",
  ];

  for (const key of positiveKeys) {
    expect(offsets[key]).toBeGreaterThan(0);
  }

  // offscreenY is intentionally negative (off-screen positioning)
  expect(offsets.offscreenY).toBeLessThan(0);

  // Scaled card dimensions should be >= base card dimensions
  expect(offsets.scaledCardWidth).toBeGreaterThanOrEqual(offsets.cardWidth);
  expect(offsets.scaledCardHeight).toBeGreaterThanOrEqual(offsets.cardHeight);

  // Scaled preview dimensions should be >= base preview dimensions
  expect(offsets.scaledPreviewWidth).toBeGreaterThanOrEqual(
    offsets.previewWidth,
  );
  expect(offsets.scaledPreviewHeight).toBeGreaterThanOrEqual(
    offsets.previewHeight,
  );

  // cell dimensions should be larger than card dimensions
  expect(offsets.cellWidth).toBeGreaterThan(offsets.cardWidth);
  expect(offsets.cellHeight).toBeGreaterThan(offsets.cardHeight);
});

// ----- directionMap -----

/**
 * Verifies that directionMap contains exactly the four cardinal directions
 * and each entry has the expected prop, playerStrength, and opponentStrength
 * keys with the correct string values.
 */
test("directionMap has four directions with correct mapping", () => {
  expect(Object.keys(directionMap)).toHaveLength(4);
  expect(directionMap).toHaveProperty("left");
  expect(directionMap).toHaveProperty("right");
  expect(directionMap).toHaveProperty("up");
  expect(directionMap).toHaveProperty("down");

  // left
  expect(directionMap.left).toEqual({
    prop: "cardLeft",
    playerStrength: "left",
    opponentStrength: "right",
  });

  // right
  expect(directionMap.right).toEqual({
    prop: "cardRight",
    playerStrength: "right",
    opponentStrength: "left",
  });

  // up
  expect(directionMap.up).toEqual({
    prop: "cardUp",
    playerStrength: "up",
    opponentStrength: "down",
  });

  // down
  expect(directionMap.down).toEqual({
    prop: "cardDown",
    playerStrength: "down",
    opponentStrength: "up",
  });
});

/**
 * Verifies the invariant: opponentStrength for a given direction is the
 * opposite direction (left↔right, up↔down).
 */
test("directionMap opponentStrength is always the opposite direction", () => {
  for (const [direction, info] of Object.entries(directionMap)) {
    if (direction === "left") {
      expect(info.opponentStrength).toBe("right");
    }
    if (direction === "right") {
      expect(info.opponentStrength).toBe("left");
    }
    if (direction === "up") {
      expect(info.opponentStrength).toBe("down");
    }
    if (direction === "down") {
      expect(info.opponentStrength).toBe("up");
    }
  }
});

// ----- elements -----

/**
 * Verifies that elements contains numeric keys 1-8, each with a valid
 * imagePath (non-empty string) and name (non-empty string), and that
 * the names are unique across all elements.
 */
test("elements has entries 1-8 with valid values", () => {
  const keys = Object.keys(elements)
    .map(Number)
    .toSorted((a, b) => a - b);
  expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

  for (const [id, element] of Object.entries(elements)) {
    expect(typeof element.imagePath).toBe("string");
    expect(element.imagePath.length).toBeGreaterThan(0);

    expect(typeof element.name).toBe("string");
    expect(element.name.length).toBeGreaterThan(0);

    // imagePath should match pattern like "1.png"
    expect(element.imagePath).toMatch(/^\d+\.png$/);
  }
});

/**
 * Verifies that all element names are unique.
 */
test("elements have unique names", () => {
  const names = Object.values(elements).map((element) => element.name);
  expect(new Set(names).size).toBe(names.length);
});

/**
 * Verifies the known element name mappings for a few entries.
 */
test("known element name mappings", () => {
  expect(elements[1].name).toBe("water");
  expect(elements[3].name).toBe("fire");
  expect(elements[4].name).toBe("ice");
  expect(elements[5].name).toBe("earth");
  expect(elements[8].name).toBe("wind");
});
