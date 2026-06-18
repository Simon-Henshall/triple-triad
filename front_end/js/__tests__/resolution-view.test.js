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

  test.each([
    ["left", "scaleX"],
    ["right", "scaleX"],
    ["up", "scaleY"],
    ["down", "scaleY"],
  ])(
    "flipCard with direction '%s' animates %s to 0 then back to original",
    (direction, axis) => {
      const container = { scaleX: 1.5, scaleY: 0.8 };
      const expectedOriginal = container[axis];

      const tweenToMock = jest
        .fn()
        .mockReturnValue({ to: jest.fn(), call: jest.fn() });
      const tweenCallMock = jest.fn().mockReturnValue({ to: jest.fn() });
      const tweenMock = {
        to: tweenToMock.mockReturnValue({
          to: tweenToMock,
          call: tweenCallMock,
        }),
        call: tweenCallMock,
      };
      jest.spyOn(createjs.Tween, "get").mockReturnValue(tweenMock);

      view.flipCard(container, direction);

      const firstTarget = { [axis]: 0 };

      const secondTarget = { [axis]: expectedOriginal };

      // First tween step squishes to 0
      expect(tweenToMock).toHaveBeenNthCalledWith(
        1,
        firstTarget,
        200,
        createjs.Ease.quadIn,
      );
      // Second step expands back to original
      expect(tweenToMock).toHaveBeenNthCalledWith(
        2,
        secondTarget,
        200,
        createjs.Ease.quadOut,
      );
    },
  );

  test("flipCard handles falsy container gracefully", () => {
    expect(() => view.flipCard(undefined, "left")).not.toThrow();
    expect(() => view.flipCard(0, "right")).not.toThrow();
  });

  test("refreshCardFace does nothing for falsy card", () => {
    expect(() => view.refreshCardFace()).not.toThrow();
    expect(() => view.refreshCardFace(0)).not.toThrow();
  });

  test("refreshCardFace does nothing for card without visuals", () => {
    expect(() => view.refreshCardFace({})).not.toThrow();
    expect(() => view.refreshCardFace({ visuals: {} })).not.toThrow();
  });

  test("refreshCardFace sets face bitmap as last child", () => {
    const container = {
      contains: jest.fn().mockReturnValue(true),
      setChildIndex: jest.fn(),
      getNumChildren: jest.fn().mockReturnValue(3),
    };
    const face = { name: "faceBitmap" };
    const card = {
      visuals: { container, faceBitmap: face },
    };

    view.refreshCardFace(card);

    expect(container.contains).toHaveBeenCalledWith(face);
    expect(container.setChildIndex).toHaveBeenCalledWith(face, 2);
  });

  test("refreshCardFace does nothing if face not in container", () => {
    const container = {
      contains: jest.fn().mockReturnValue(false),
      setChildIndex: jest.fn(),
    };
    const card = {
      visuals: {
        container,
        faceBitmap: { name: "faceBitmap" },
      },
    };

    view.refreshCardFace(card);

    expect(container.setChildIndex).not.toHaveBeenCalled();
  });
});
