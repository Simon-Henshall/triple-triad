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

  test("flipCard second tween step expands scaleX back to original", () => {
    const container = { scaleX: 1.5 };
    const tweenToMock = jest
      .fn()
      .mockReturnValue({ to: jest.fn(), call: jest.fn() });
    const tweenCallMock = jest.fn().mockReturnValue({ to: jest.fn() });
    const tweenMock = {
      to: tweenToMock.mockReturnValue({ to: tweenToMock, call: tweenCallMock }),
      call: tweenCallMock,
    };
    jest.spyOn(createjs.Tween, "get").mockReturnValue(tweenMock);

    view.flipCard(container, "left");

    // Verify the expansion tween uses the original scaleX and quadOut easing
    expect(tweenToMock).toHaveBeenNthCalledWith(
      2,
      { scaleX: 1.5 },
      200,
      createjs.Ease.quadOut,
    );
  });

  test("flipCard calls stage.update via the tween call callback", () => {
    const callFunction = jest.fn();
    const secondTo = jest.fn().mockReturnValue({ call: callFunction });
    jest.spyOn(createjs.Tween, "get").mockReturnValue({
      to: jest.fn().mockReturnValue({ to: secondTo }),
      call: jest.fn(),
    });

    view.flipCard({ scaleX: 1 }, "right");

    const callback = callFunction.mock.calls[0][0];
    callback();
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("refreshCardFace adds bitmap if face is not in container", () => {
    const container = {
      contains: jest.fn().mockReturnValue(false),
      setChildIndex: jest.fn(),
      addChildAt: jest.fn(),
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

  test("refreshCardFace handles missing faceBitmap", () => {
    const card = {
      visuals: {
        container: {
          contains: jest.fn(),
          setChildIndex: jest.fn(),
        },
        faceBitmap: undefined,
      },
    };

    expect(() => view.refreshCardFace(card)).not.toThrow();
  });
});
