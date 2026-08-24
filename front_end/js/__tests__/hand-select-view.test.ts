/**
 * @module hand-select-view
 * @description Unit tests for HandSelectView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("HandSelectView", () => {
  let HandSelectView;

  beforeAll(async () => {
    const module_ = await import("../phases/hand-select/hand-select-view.js");
    HandSelectView = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.controllers = {};
    Game.views = {};
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = {
      playerModel: { selectedCard: { data: { id: 1 }, name: "Test Card" } },
    };
  });

  test("constructor stores playerModel", () => {
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    expect(view.playerModel).toBe(playerModel);
  });

  test("show calls cursorController.playerHand.place when available", () => {
    const placeMock = jest.fn();
    Game.controllers = {
      cursorController: { playerHand: { place: placeMock } },
    };
    const playerModel = {
      hand: [{ data: { id: 1 } }],
      selectedCardNumber: 0,
    };
    const view = new HandSelectView(playerModel);
    view.show();
    expect(placeMock).toHaveBeenCalled();
  });

  test("show does not throw when cursorController is missing", () => {
    Game.controllers = {};
    const playerModel = { hand: [], selectedCardNumber: 0 };
    const view = new HandSelectView(playerModel);
    expect(() => view.show()).not.toThrow();
  });

  test("hide calls cursorController.playerHand.remove when available", () => {
    const removeMock = jest.fn();
    Game.controllers = {
      cursorController: { playerHand: { remove: removeMock } },
    };
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    view.hide();
    expect(removeMock).toHaveBeenCalled();
  });

  test("hide does not throw when cursorController is missing", () => {
    Game.controllers = {};
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    expect(() => view.hide()).not.toThrow();
  });

  test("updateSelection calls playerView.indentSelectedCard when available", () => {
    const indentMock = jest.fn();
    Game.views = { playerView: { indentSelectedCard: indentMock } };
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    const card = { data: { id: 1 } };
    view.updateSelection(card);
    expect(indentMock).toHaveBeenCalledWith(card);
  });

  test("updateSelection does not throw when playerView is missing", () => {
    Game.views = {};
    const playerModel = { hand: [] };
    const view = new HandSelectView(playerModel);
    expect(() => view.updateSelection({ data: { id: 1 } })).not.toThrow();
  });
});
