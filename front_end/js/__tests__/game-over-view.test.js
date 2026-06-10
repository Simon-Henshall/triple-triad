/**
 * @module game-over-view
 * @description Unit tests for GameOverView
 */

import { jest } from "@jest/globals";

describe("GameOverView", () => {
  let GameOverView;
  let mockStage;

  beforeAll(async () => {
    const module_ = await import("../phases/game-over/game-over-view.js");
    GameOverView = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockStage = {
      canvas: { width: 800, height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };

    // Mock document.removeEventListener (setup.js only provides addEventListener)
    if (!document.removeEventListener) {
      document.removeEventListener = jest.fn();
    }

    // Mock createjs.Shape to support .graphics.beginFill().drawCircle()
    createjs.Shape = function () {
      this.graphics = {
        beginFill: jest.fn().mockReturnThis(),
        drawRect: jest.fn().mockReturnThis(),
        drawCircle: jest.fn().mockReturnThis(),
      };
      this.setBounds = jest.fn();
      this.x = 0;
      this.y = 0;
    };

    // Mock createjs.Tween.get to support .wait() and .call() chaining
    /**
     * Helper function to create a mock Tween instance with chainable methods for testing.
     * Each method is mocked to allow chaining and to track calls.
     * @returns {object} A mock Tween instance with chainable methods.
     */
    const createTweenInstance = () => {
      const instance = {
        to: jest.fn().mockReturnThis(),
        wait: jest.fn().mockReturnThis(),
        call: jest.fn((callback) => {
          // Invoke callback synchronously to simulate tween completion
          if (callback) {
            callback();
          }
          return instance;
        }),
        setPaused: jest.fn(),
      };
      return instance;
    };
    createjs.Tween.get = jest.fn(() => createTweenInstance());
  });

  test("constructor stores stage and initializes properties", () => {
    const view = new GameOverView(mockStage);
    expect(view.stage).toBe(mockStage);
    expect(view.container).toBeUndefined();
    expect(view.overlay).toBeUndefined();
    expect(view.animationHandle).toBeUndefined();
  });

  describe("displayOutcome", () => {
    test("calls _buildOverlay with outcome and counts", () => {
      const view = new GameOverView(mockStage);
      const spy = jest.spyOn(view, "_buildOverlay");

      view.displayOutcome("win", { playerCards: 5, aiCards: 3 });
      expect(spy).toHaveBeenCalledWith("win", {
        playerCards: 5,
        aiCards: 3,
      });
    });

    test("does not throw when _buildOverlay throws", () => {
      const view = new GameOverView(mockStage);
      jest.spyOn(view, "_buildOverlay").mockImplementation(() => {
        throw new Error("test error");
      });

      expect(() =>
        view.displayOutcome("win", { playerCards: 5, aiCards: 3 }),
      ).not.toThrow();
    });
  });

  describe("_buildOverlay", () => {
    test("creates container and adds to stage", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      expect(view.container).toBeDefined();
      expect(mockStage.addChild).toHaveBeenCalledWith(view.container);
    });

    test("creates overlay shape", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      expect(view.overlay).toBeDefined();
    });

    test("creates result text for win outcome", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      expect(view.container.addChild).toHaveBeenCalled();
    });

    test("creates result text for lose outcome", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("lose", { playerCards: 2, aiCards: 5 });

      expect(view.container).toBeDefined();
      expect(mockStage.addChild).toHaveBeenCalled();
    });

    test("creates result text for draw outcome", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("draw", { playerCards: 4, aiCards: 4 });

      expect(view.container).toBeDefined();
      expect(mockStage.addChild).toHaveBeenCalled();
    });

    test("falls back to draw label for unknown outcome", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("unknown", { playerCards: 4, aiCards: 4 });

      expect(view.container).toBeDefined();
    });
  });

  describe("cleanup", () => {
    test("removes container from stage", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
      // Capture reference before cleanup sets it to undefined
      const containerReference = view.container;
      view.cleanup();

      expect(mockStage.removeChild).toHaveBeenCalledWith(containerReference);
      expect(view.container).toBeUndefined();
      expect(view.overlay).toBeUndefined();
    });

    test("does not throw when container is not set", () => {
      const view = new GameOverView(mockStage);
      view.container = undefined;
      expect(() => view.cleanup()).not.toThrow();
    });

    test("does not throw when stage is not set", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
      view.stage = undefined;
      expect(() => view.cleanup()).not.toThrow();
    });

    test("removes dismissHandler from document", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      view._dismissHandler = jest.fn();
      view.cleanup();

      expect(view._dismissHandler).toBeUndefined();
    });

    test("pauses blinkTween if it exists", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      const blinkTweenMock = { setPaused: jest.fn() };
      view._blinkTween = blinkTweenMock;
      view.cleanup();

      expect(blinkTweenMock.setPaused).toHaveBeenCalledWith(true);
      expect(view._blinkTween).toBeUndefined();
    });
  });

  describe("_attachDismissHandler", () => {
    test("does nothing if handler already exists", () => {
      const view = new GameOverView(mockStage);
      view._dismissHandler = jest.fn();

      const existing = view._dismissHandler;
      view._attachDismissHandler();
      expect(view._dismissHandler).toBe(existing);
    });
  });

  describe("_dismiss", () => {
    test("pauses blinkTween and sets to undefined", () => {
      const view = new GameOverView(mockStage);
      view._blinkTween = { setPaused: jest.fn() };
      view._dismiss();

      expect(view._blinkTween).toBeUndefined();
    });

    test("sets container and overlay to undefined after dismiss", () => {
      const view = new GameOverView(mockStage);
      view._buildOverlay("win", { playerCards: 5, aiCards: 3 });

      // cleanup is called synchronously by the tween mock
      view._dismiss();

      expect(view.container).toBeUndefined();
      expect(view.overlay).toBeUndefined();
    });
  });

  describe("_startBlinking", () => {
    test("pauses existing blink tween before creating new one", () => {
      const view = new GameOverView(mockStage);
      const mockText = { alpha: 1 };
      const existingTween = { setPaused: jest.fn() };
      view._blinkTween = existingTween;

      view._startBlinking(mockText);

      expect(existingTween.setPaused).toHaveBeenCalledWith(true);
      // A new blink tween is created via createjs.Tween.get
      expect(createjs.Tween.get).toHaveBeenCalled();
    });

    test("creates blink tween when none exists", () => {
      const view = new GameOverView(mockStage);
      const mockText = { alpha: 1 };

      view._startBlinking(mockText);

      expect(createjs.Tween.get).toHaveBeenCalled();
    });
  });
});
