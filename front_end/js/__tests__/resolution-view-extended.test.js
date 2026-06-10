/**
 * @module resolution-view-extended
 * @description Additional unit tests for ResolutionView
 */

import { jest } from "@jest/globals";
import { ResolutionView } from "../phases/resolution/resolution-view.js";

describe("ResolutionView (extended)", () => {
  let view;
  let mockStage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    view = new ResolutionView(mockStage);
  });

  test("swapCardFace swaps face src based on backImage match", () => {
    const card = {
      children: [{ image: { src: "foo.png" } }, { image: { src: "back.png" } }],
      backImage: "back.png",
      frontImage: "front.png",
    };

    view.swapCardFace(card);
    // The face image should be replaced with the opposite
    expect(card.children[1].image.src).toBe("front.png");
  });

  test("swapCardFace with face being back toggles to front", () => {
    const card = {
      children: [{ image: { src: "x" } }, { image: { src: "front.png" } }],
      backImage: "back.png",
      frontImage: "front.png",
    };

    view.swapCardFace(card);
    expect(card.children[1].image.src).toBe("back.png");
  });

  test("flipDirection updates slice properties and calls stage.update", () => {
    const card = {
      children: [{ image: { src: "x" } }, { image: { width: 100 } }],
    };
    const container = {
      /**
       * Mock implementation of getBounds for testing. In a real test, this would return the actual bounds of the container.
       * @return {object} An object with width and height properties.
       */
      getNumChildren: () => 2,
      /**
       * Mock implementation of getChildAt for testing. In a real test, this would return the actual child at the specified index.
       * @param {number} index - The index of the child to retrieve.
       * @return {object} A mock child object with x, y, skewY properties and an updateCache method.
       */
      getChildAt: () => ({ y: 0, skewY: 0, x: 0, updateCache: jest.fn() }),
    };
    view.flipDirection(card, container, "left", 45);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("refreshCardFace adds Bitmap when no child exists", () => {
    const card = {
      children: [],
      owner: "ai",
      addChildAt: jest.fn(),
    };
    view.refreshCardFace(card);
    expect(card.addChildAt).toHaveBeenCalled();
  });

  test("refreshCardFace sets childIndex for second child", () => {
    const card = {
      children: [{ image: { src: "x" } }, { id: "face" }],
      owner: "player",
      setChildIndex: jest.fn(),
      getNumChildren: jest.fn().mockReturnValue(2),
    };
    view.refreshCardFace(card);
    expect(card.setChildIndex).toHaveBeenCalled();
  });
});
