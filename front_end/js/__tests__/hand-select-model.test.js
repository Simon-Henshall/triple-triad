/**
 * @module hand-select-model
 * @description Unit tests for the HandSelectModel class.
 */

import { jest } from "@jest/globals";
import HandSelectModel from "../phases/hand-select/hand-select-model.js";
import { Game } from "../shared/game/game.js";
import { InfoBox } from "../shared/ui/info-box.js";
import { CursorModel } from "../shared/cursor/cursor-model.js";

describe("HandSelectModel", () => {
  let model;
  let mockPlayerModel;
  let indentSpy;
  let updateInfoBoxSpy;
  let initSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlayerModel = {
      hand: [{ name: "A" }, { name: "B" }, { name: "C" }],
      selectedCardNumber: 0,
      selectedCard: undefined,
    };

    indentSpy = jest.fn();
    Game.views = { playerView: { indentSelectedCard: indentSpy } };
    updateInfoBoxSpy = jest.spyOn(InfoBox, "updateInfoBox").mockImplementation(() => {});
    initSpy = jest.fn();
    CursorModel.playerHand = { init: initSpy };

    model = new HandSelectModel(mockPlayerModel);
  });

  test("constructor uses playerModel.selectedCardNumber if provided", () => {
    const pm = { hand: [{ name: "X" }], selectedCardNumber: 5 };
    const m = new HandSelectModel(pm);
    expect(m.selectedIndex).toBe(5);
  });

  test("constructor defaults to 0 if playerModel is undefined", () => {
    const m = new HandSelectModel();
    expect(m.selectedIndex).toBe(0);
  });

  test("setSelected updates index and calls view and InfoBox", () => {
    model.setSelected(1);
    expect(model.selectedIndex).toBe(1);
    expect(mockPlayerModel.selectedCardNumber).toBe(1);
    expect(mockPlayerModel.selectedCard).toBe(mockPlayerModel.hand[1]);
    expect(indentSpy).toHaveBeenCalledWith(mockPlayerModel.hand[1]);
    expect(updateInfoBoxSpy).toHaveBeenCalled();
  });

  test("setSelected clamps negative values to 0", () => {
    model.setSelected(-5);
    expect(model.selectedIndex).toBe(0);
  });

  test("setSelected clamps values above max", () => {
    model.setSelected(99);
    expect(model.selectedIndex).toBe(2);
  });

  test("setSelected does nothing if no playerModel", () => {
    const m = new HandSelectModel();
    m.setSelected(2);
    expect(m.selectedIndex).toBe(0);
  });

  test("setSelected handles empty hand", () => {
    mockPlayerModel.hand = [];
    model.setSelected(2);
    expect(model.selectedIndex).toBe(0);
  });

  test("selectNext increments index", () => {
    model.selectNext();
    expect(model.selectedIndex).toBe(1);
  });

  test("selectNext does not exceed max", () => {
    model.setSelected(2);
    model.selectNext();
    expect(model.selectedIndex).toBe(2);
  });

  test("selectPrevious decrements index", () => {
    model.setSelected(2);
    model.selectPrevious();
    expect(model.selectedIndex).toBe(1);
  });

  test("selectPrevious does not go below 0", () => {
    model.setSelected(0);
    model.selectPrevious();
    expect(model.selectedIndex).toBe(0);
  });

  test("initCursor calls playerHand.init", () => {
    model.initCursor();
    expect(initSpy).toHaveBeenCalled();
  });

  test("initCursor does not throw when playerHand is missing", () => {
    CursorModel.playerHand = undefined;
    expect(() => model.initCursor()).not.toThrow();
  });
});