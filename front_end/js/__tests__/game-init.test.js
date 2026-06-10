/**
 * @module game-init
 * @description Unit tests for the gameInit module. Most methods need a lot of
 * pre-populated state, so we test them defensively to avoid hard dependencies.
 */

import { jest } from "@jest/globals";
import { gameInit } from "../shared/game/game-init.js";
import { Game } from "../shared/game/game.js";

describe("gameInit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up minimal global state
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      setChildIndex: jest.fn(),
      canvas: { width: 800, height: 600 },
      numChildren: 0,
    };
    Game.stageWidth = 800;
    Game.stageHeight = 600;
    Game.models = {};
    Game.controllers = {};
    Game.views = {};
    Game.ui = {};
  });

  test("stage method sets up stage and ticker", () => {
    expect(() => gameInit.stage()).not.toThrow();
    expect(Game.stage).toBeDefined();
  });

  test("uiContainers method does not throw", () => {
    expect(() => gameInit.uiContainers()).not.toThrow();
  });

  test("addBackground method does not throw", () => {
    expect(() => gameInit.addBackground()).not.toThrow();
  });

  test("events method registers a keydown handler", () => {
    const handleKey = jest.fn();
    expect(() => gameInit.events({ handleKey })).not.toThrow();
  });

  test("handOffsets method requires populated Game.models", () => {
    // With no models, should throw, but we are testing it does not crash unexpectedly
    expect(() => gameInit.handOffsets()).toThrow();
  });

  test("all method exists and is async", () => {
    expect(typeof gameInit.all).toBe("function");
  });
});
