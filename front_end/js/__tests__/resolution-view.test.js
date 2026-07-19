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
      canvas: { width: 800, height: 600 },
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

  describe("showRulePopup", () => {
    beforeEach(() => {
      // Re-setup Tween mock after clearAllMocks since showRulePopup uses .wait()
      jest.spyOn(createjs.Tween, "get").mockReturnValue({
        to: jest.fn().mockReturnThis(),
        call: jest.fn().mockReturnThis(),
        wait: jest.fn().mockReturnThis(),
      });
    });

    test("does nothing when stage is falsy", () => {
      const viewNoStage = new ResolutionView(undefined);
      expect(() => viewNoStage.showRulePopup("Same!")).not.toThrow();
    });

    test("adds popup container to stage", () => {
      view.showRulePopup("Same!");
      expect(mockStage.addChild).toHaveBeenCalled();
    });

    test("creates text with correct label and default gold color", () => {
      view.showRulePopup("Same!");
      // Two Text instances created: main text and glow text
      expect(createjs.Text).toHaveBeenCalledWith(
        "Same!",
        "bold 56px Impact, Arial Black, sans-serif",
        "#FFD700",
      );
    });

    test("creates text with custom color", () => {
      view.showRulePopup("Plus!", "#00BFFF");
      expect(createjs.Text).toHaveBeenCalledWith(
        "Plus!",
        "bold 56px Impact, Arial Black, sans-serif",
        "#00BFFF",
      );
    });

    test("animates popup with scale and fade tweens", () => {
      const tweenGetSpy = jest.spyOn(createjs.Tween, "get");
      view.showRulePopup("Combo!");
      // Should create tweens for: popupContainer, popupText, glowText
      expect(tweenGetSpy).toHaveBeenCalledTimes(3);
    });

    test("removes popup from stage after animation completes", () => {
      // Capture the call function from the tween chain
      let callCallback;
      const tweenMock = {
        to: jest.fn().mockReturnThis(),
        call: jest.fn().mockImplementation((function_) => {
          callCallback = function_;
          return tweenMock;
        }),
        wait: jest.fn().mockReturnThis(),
      };
      jest.spyOn(createjs.Tween, "get").mockReturnValue(tweenMock);

      // Override addChild to capture the container
      mockStage.addChild.mockImplementation((child) => {
        // Simulate parent being set
        child.parent = mockStage;
      });

      view.showRulePopup("Test!");

      // Execute the cleanup callback
      if (callCallback) {
        callCallback();
      }

      expect(mockStage.removeChild).toHaveBeenCalled();
    });
  });
});
