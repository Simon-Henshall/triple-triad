/**
 * @module placement-model
 * @description Unit tests for the PlacementModel applyElementEffects function.
 */

import { PlacementModel } from "../phases/placement/placement-model.js";

describe("PlacementModel.applyElementEffects", () => {
  test("returns modified: false when no squareElement is provided", () => {
    const card = {
      data: {
        strength: { left: 1, up: 2, right: 3, down: 4 },
      },
      element: "fire",
    };

    const result = PlacementModel.prototype.applyElementEffects.call({}, card, undefined);

    expect(result).toEqual({ modified: false });
  });

  test("returns modified: false when squareElement is 0", () => {
    const card = {
      data: {
        strength: { left: 1, up: 2, right: 3, down: 4 },
      },
      element: "fire",
    };

    const result = PlacementModel.prototype.applyElementEffects.call({}, card, 0);

    expect(result).toEqual({ modified: false });
  });

  test("adds 1 to all strengths when card element matches square element", () => {
    const card = {
      data: {
        strength: { left: 1, up: 2, right: 3, down: 4 },
      },
      element: "fire",
    };

    const result = PlacementModel.prototype.applyElementEffects.call({}, card, "fire");

    expect(result.modified).toBe(true);
    expect(card.data.strength.left).toBe(2);
    expect(card.data.strength.up).toBe(3);
    expect(card.data.strength.right).toBe(4);
    expect(card.data.strength.down).toBe(5);
    expect(result.image).toMatch(/plus_one/);
  });

  test("subtracts 1 from all strengths when card element differs from square element", () => {
    const card = {
      data: {
        strength: { left: 5, up: 5, right: 5, down: 5 },
      },
      element: "fire",
    };

    const result = PlacementModel.prototype.applyElementEffects.call({}, card, "water");

    expect(result.modified).toBe(true);
    expect(card.data.strength.left).toBe(4);
    expect(card.data.strength.up).toBe(4);
    expect(card.data.strength.right).toBe(4);
    expect(card.data.strength.down).toBe(4);
    expect(result.image).toMatch(/minus_one/);
  });
});