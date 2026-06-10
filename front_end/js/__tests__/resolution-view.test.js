/**
 * @module resolution-view
 * @description Unit tests for the ResolutionView class.
 */

import { jest } from "@jest/globals";
import { ResolutionView } from "../phases/resolution/resolution-view.js";

describe("ResolutionView", () => {
  let mockStage;
  let view;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    view = new ResolutionView(mockStage);
  });

  test("constructor stores stage", () => {
    expect(view.stage).toBe(mockStage);
  });

  test("flipCard is a no-op (TODO)", () => {
    expect(() => view.flipCard({}, "left")).not.toThrow();
    expect(() => view.flipCard({}, "right")).not.toThrow();
  });

  test("finaliseFlip restores position and adds card to stage", () => {
    const card = { x: 0, y: 0 };
    const container = {
      removeAllChildren: jest.fn(),
      remove: jest.fn(),
    };
    view.finaliseFlip(card, container, 100, 200);
    expect(card.x).toBe(100);
    expect(card.y).toBe(200);
    expect(mockStage.addChild).toHaveBeenCalledWith(card);
    expect(container.removeAllChildren).toHaveBeenCalled();
    expect(container.remove).toHaveBeenCalled();
  });

  test("refreshCardFace does nothing for null card", () => {
    expect(() => view.refreshCardFace(null)).not.toThrow();
  });

  test("refreshCardFace does nothing for card without children", () => {
    expect(() => view.refreshCardFace({})).not.toThrow();
  });

  test("refreshCardFace sets image src on existing child", () => {
    const card = {
      children: [{ image: { src: "" } }],
      setChildIndex: jest.fn(),
      getNumChildren: jest.fn().mockReturnValue(2),
      owner: "player",
    };

    view.refreshCardFace(card);
    expect(card.children[0].image.src).toContain("player");
  });

  test("flipAIHand calls setTimeout for each card", () => {
    // 1. Enable fake timers before running the logic
    jest.useFakeTimers();

    // 2. Spy on the timers using Jest's native timer spy
    const spy = jest.spyOn(globalThis, "setTimeout");

    const hand = [{ id: 1 }, { id: 2 }, { id: 3 }];

    view.flipAIHand(hand);

    // 3. Verify the count
    expect(spy).toHaveBeenCalledTimes(3);

    // 4. Clear pending timeouts and restore the real timer environment
    jest.clearAllTimers();
    jest.useRealTimers();
  });
});
