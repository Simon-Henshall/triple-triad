/*
 * @module rules-controller
 * @description Unit tests for RulesController
 */

import { jest } from "@jest/globals";
import { RulesController } from "../phases/rules/rules-controller.js";
import { Game } from "../shared/game/game.js";
import { PhaseChecker } from "../game/phases.js";

beforeAll(() => {
  globalAlert = globalThis.alert;
  globalThis.alert = jest.fn();
});

afterAll(() => {
  globalThis.alert = globalAlert;
});

describe("RulesController", () => {
  let transitionMock;
  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      update: jest.fn(),
      canvas: { width: 800, height: 600 },
    };
    Game.controllers = {};
    Game.models = {};
  });

  test("constructor sets defaults", () => {
    const ctrl = new RulesController({}, transitionMock);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.callbacks).toEqual({});
  });

  test("constructor works with no deps", () => {
    const ctrl = new RulesController();
    expect(ctrl.transition).toBeUndefined();
  });

  test("activate sets phase checker", () => {
    const ctrl = new RulesController({}, transitionMock);
    ctrl.activate();
    expect(PhaseChecker.playerViewingRules).toBe(true);
  });

  test("navigate calls model.handleInput", () => {
    const ctrl = new RulesController({}, transitionMock);
    ctrl.model.handleInput = jest.fn();
    ctrl.navigate("down");
    expect(ctrl.model.handleInput).toHaveBeenCalledWith("down");
  });

  test("confirm with Play transitions to deck-selection", () => {
    const ctrl = new RulesController({}, transitionMock);
    ctrl.model.confirm = jest.fn().mockReturnValue(true);
    ctrl.confirm();
    expect(transitionMock).toHaveBeenCalledWith("deck-selection");
  });

  test("confirm with Quit calls alert", () => {
    const ctrl = new RulesController({}, transitionMock);
    ctrl.model.confirm = jest.fn().mockReturnValue(false);
    ctrl.confirm();
    expect(globalThis.alert).toHaveBeenCalledWith("Quit selected");
    expect(transitionMock).not.toHaveBeenCalled();
  });

  test("deactivate cleans up", () => {
    const ctrl = new RulesController({}, transitionMock);
    ctrl.deactivate();
    expect(PhaseChecker.playerViewingRules).toBe(false);
  });

  test("activate requires aiTurnController with view", () => {
    const ctrl = new RulesController({}, transitionMock);
    Game.controllers.aiTurnController = { model: { hand: [] }, view: {} };
    expect(() => ctrl.activate()).not.toThrow();
    expect(PhaseChecker.playerViewingRules).toBe(true);
  });

  test("deactivate does not throw when no AI hand", () => {
    const ctrl = new RulesController({}, transitionMock);
    expect(() => ctrl.deactivate()).not.toThrow();
  });
});
