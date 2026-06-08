/**
 * @module confirmation-model
 * @description Unit tests for the ConfirmationModel class.
 */

import { jest } from "@jest/globals";
import ConfirmationModel from "../phases/confirmation/confirmation-model.js";
import { Game } from "../shared/game/game.js";
import { PhaseChecker } from "../game/phases.js";

describe("ConfirmationModel", () => {
  let model;
  let mockView;
  let mockStage;

  beforeEach(() => {
    jest.clearAllMocks();

    mockView = {
      cursor: { x: 0, y: 0 },
      background: { x: 0, y: 0 },
      container: { x: 0, y: 0 },
    };

    mockStage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      update: jest.fn(),
    };

    Game.stage = mockStage;

    model = new ConfirmationModel(mockView);
  });

  test("constructor sets initial state", () => {
    expect(model.view).toBe(mockView);
    expect(model.choices).toEqual(["Yes", "No"]);
    expect(model.selectedIndex).toBe(0);
  });

  test("clampIndex returns the index when in range", () => {
    expect(model.clampIndex(0)).toBe(0);
    expect(model.clampIndex(1)).toBe(1);
  });

  test("clampIndex clamps negative values to 0", () => {
    expect(model.clampIndex(-1)).toBe(0);
    expect(model.clampIndex(-100)).toBe(0);
  });

  test("clampIndex clamps values above max to max", () => {
    expect(model.clampIndex(2)).toBe(1);
    expect(model.clampIndex(100)).toBe(1);
  });

  test("setSelected updates the selected index", () => {
    model.setSelected(1);
    expect(model.selectedIndex).toBe(1);
  });

  test("setSelected clamps the value", () => {
    model.setSelected(-5);
    expect(model.selectedIndex).toBe(0);
    model.setSelected(100);
    expect(model.selectedIndex).toBe(1);
  });

  test("next increments the selected index", () => {
    model.next();
    expect(model.selectedIndex).toBe(1);
  });

  test("next does not exceed max", () => {
    model.next();
    model.next();
    model.next();
    expect(model.selectedIndex).toBe(1);
  });

  test("prev decrements the selected index", () => {
    model.setSelected(1);
    model.prev();
    expect(model.selectedIndex).toBe(0);
  });

  test("prev does not go below 0", () => {
    model.prev();
    model.prev();
    expect(model.selectedIndex).toBe(0);
  });

  test("confirm returns true when Yes is selected", () => {
    model.setSelected(0);
    expect(model.confirm()).toBe(true);
    expect(PhaseChecker.playerConfirming).toBe(false);
  });

  test("confirm returns false when No is selected", () => {
    model.setSelected(1);
    expect(model.confirm()).toBe(false);
  });

  test("cancel returns false", () => {
    model.setSelected(0);
    expect(model.cancel()).toBe(false);
    expect(PhaseChecker.playerConfirming).toBe(false);
  });

  test("updateCursorPlacement positions the cursor", () => {
    mockView.background = { x: 0, y: 100 };
    mockView.cursor = { x: 0, y: 0 };
    mockStage.contains = jest.fn().mockReturnValue(false);

    model.updateCursorPlacement();

    expect(mockView.cursor.y).toBe(100 + 60 + 0 * 30);
    expect(mockStage.addChild).toHaveBeenCalledWith(mockView.cursor);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("updateCursorPlacement does nothing if view is missing", () => {
    model.view = null;
    expect(() => model.updateCursorPlacement()).not.toThrow();
  });

  test("hideView removes container from stage when present", () => {
    mockStage.contains = jest.fn().mockReturnValue(true);
    model.hideView();
    expect(mockStage.removeChild).toHaveBeenCalledWith(mockView.container);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("hideView does nothing when container not in stage", () => {
    mockStage.contains = jest.fn().mockReturnValue(false);
    model.hideView();
    expect(mockStage.removeChild).not.toHaveBeenCalled();
  });

  test("handleInput dispatches to correct method", () => {
    const spy = jest.spyOn(model, "prev");
    model.handleInput("up");
    expect(spy).toHaveBeenCalled();

    const next = jest.spyOn(model, "next");
    model.handleInput("down");
    expect(next).toHaveBeenCalled();
  });

  test("handleInput confirm returns confirm result", () => {
    model.setSelected(0);
    expect(model.handleInput("confirm")).toBe(true);
  });

  test("handleInput cancel returns cancel result", () => {
    expect(model.handleInput("cancel")).toBe(false);
  });

  test("handleInput default does nothing and returns undefined", () => {
    expect(model.handleInput("foo")).toBeUndefined();
  });
});