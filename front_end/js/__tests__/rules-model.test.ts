/*
 * @module rules-model
 * @description Unit tests for RulesModel
 */

import { jest } from "@jest/globals";
import RulesModel from "../phases/rules/rules-model.js";
import { PhaseChecker } from "../game/phases.js";
import { Game } from "../shared/game/game.js";

describe("RulesModel", () => {
  let viewMock;
  beforeEach(() => {
    jest.clearAllMocks();
    viewMock = {
      cursor: { x: 0, y: 0 },
      background: {},
      boxX: 100,
      optionsStartY: 200,
      container: {},
    };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      update: jest.fn(),
    };
  });

  test("constructor defaults", () => {
    const m = new RulesModel(viewMock);
    expect(m.choices).toEqual(["Play", "Quit"]);
    expect(m.selectedIndex).toBe(0);
  });

  test("clampIndex below 0", () => {
    expect(new RulesModel(viewMock).clampIndex(-1)).toBe(0);
  });

  test("clampIndex above max", () => {
    expect(new RulesModel(viewMock).clampIndex(5)).toBe(1);
  });

  test("clampIndex within bounds", () => {
    const m = new RulesModel(viewMock);
    expect(m.clampIndex(0)).toBe(0);
    expect(m.clampIndex(1)).toBe(1);
  });

  test("setSelected updates index and cursor", () => {
    const m = new RulesModel(viewMock);
    m.updateCursorPlacement = jest.fn();
    m.setSelected(1);
    expect(m.selectedIndex).toBe(1);
    expect(m.updateCursorPlacement).toHaveBeenCalled();
  });

  test("setSelected clamps", () => {
    const m = new RulesModel(viewMock);
    m.setSelected(-1);
    expect(m.selectedIndex).toBe(0);
  });

  test("next increments", () => {
    const m = new RulesModel(viewMock);
    m.next();
    expect(m.selectedIndex).toBe(1);
  });

  test("next clamps at max", () => {
    const m = new RulesModel(viewMock);
    m.setSelected(1);
    m.next();
    expect(m.selectedIndex).toBe(1);
  });

  test("prev decrements", () => {
    const m = new RulesModel(viewMock);
    m.setSelected(1);
    m.prev();
    expect(m.selectedIndex).toBe(0);
  });

  test("prev clamps at 0", () => {
    const m = new RulesModel(viewMock);
    m.prev();
    expect(m.selectedIndex).toBe(0);
  });

  test("confirm returns true when Play selected", () => {
    const m = new RulesModel(viewMock);
    m.hideView = jest.fn();
    expect(m.confirm()).toBe(true);
    expect(PhaseChecker.playerViewingRules).toBe(false);
  });

  test("confirm returns false when Quit selected", () => {
    const m = new RulesModel(viewMock);
    m.setSelected(1);
    m.hideView = jest.fn();
    expect(m.confirm()).toBe(false);
  });

  test("cancel returns false", () => {
    const m = new RulesModel(viewMock);
    m.hideView = jest.fn();
    expect(m.cancel()).toBe(false);
  });

  test("updateCursorPlacement sets cursor position", () => {
    const m = new RulesModel(viewMock);
    m.updateCursorPlacement();
    expect(viewMock.cursor.x).toBe(155);
    expect(viewMock.cursor.y).toBe(210);
  });

  test("updateCursorPlacement with missing view props does nothing", () => {
    const m = new RulesModel({});
    expect(() => m.updateCursorPlacement()).not.toThrow();
  });

  test("hideView removes container from stage", () => {
    Game.stage.contains.mockReturnValue(true);
    const m = new RulesModel(viewMock);
    m.hideView();
    expect(Game.stage.removeChild).toHaveBeenCalled();
  });

  test("hideView with no container does nothing", () => {
    const m = new RulesModel({});
    expect(() => m.hideView()).not.toThrow();
  });

  test("handleInput up calls prev", () => {
    const m = new RulesModel(viewMock);
    m.prev = jest.fn();
    m.handleInput("up");
    expect(m.prev).toHaveBeenCalled();
  });

  test("handleInput down calls next", () => {
    const m = new RulesModel(viewMock);
    m.next = jest.fn();
    m.handleInput("down");
    expect(m.next).toHaveBeenCalled();
  });

  test("handleInput confirm calls confirm", () => {
    const m = new RulesModel(viewMock);
    m.confirm = jest.fn().mockReturnValue(true);
    expect(m.handleInput("confirm")).toBe(true);
  });

  test("handleInput cancel calls cancel", () => {
    const m = new RulesModel(viewMock);
    m.cancel = jest.fn().mockReturnValue(false);
    expect(m.handleInput("cancel")).toBe(false);
  });

  test("handleInput unknown returns undefined", () => {
    expect(new RulesModel(viewMock).handleInput("unknown")).toBeUndefined();
  });
});
