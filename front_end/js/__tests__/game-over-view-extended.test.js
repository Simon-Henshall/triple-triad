/**
 * @module game-over-view-extended
 * @description Additional unit tests for GameOverView
 */

import { jest } from "@jest/globals";

describe("GameOverView (extended)", () => {
  let GameOverView;
  let mockStage;

  beforeAll(async () => {
    const module_ = await import("../phases/game-over/game-over-view.js");
    GameOverView = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    if (!document.removeEventListener) {
      document.removeEventListener = jest.fn();
    }
    /**
     *
     */
    const createTweenInstance = () => {
      const instance = {
        to: jest.fn().mockReturnThis(),
        wait: jest.fn().mockReturnThis(),
        call: jest.fn((function_) => {
          if (function_) {
            function_();
          }
          return instance;
        }),
        setPaused: jest.fn(),
      };
      return instance;
    };
    createjs.Tween.get = jest.fn(() => createTweenInstance());

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

    mockStage = {
      canvas: { width: 800, height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
  });

  test("_dismiss fades out container and calls cleanup", () => {
    const view = new GameOverView(mockStage);
    view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
    view._dismiss();
    expect(view.container).toBeUndefined();
    expect(view.overlay).toBeUndefined();
  });

  test("dismiss handler is called on keydown", () => {
    const view = new GameOverView(mockStage);
    view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
    view.container.parent = mockStage;
    expect(view._dismissHandler).toBeDefined();
    // Simulate keydown
    const event = {};
    view._dismissHandler(event);
    expect(view._dismissHandler).toBeUndefined();
  });

  test("dismiss handler early returns when container is gone", () => {
    const view = new GameOverView(mockStage);
    view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
    // Simulate container having no parent
    view.container.parent = undefined;
    expect(() => view._dismissHandler({})).not.toThrow();
  });

  test("cleanup handles container with parent errors gracefully", () => {
    const view = new GameOverView(mockStage);
    view._buildOverlay("win", { playerCards: 5, aiCards: 3 });
    mockStage.removeChild = jest.fn().mockImplementation(() => {
      throw new Error("Remove failed");
    });
    expect(() => view.cleanup()).not.toThrow();
  });
});
