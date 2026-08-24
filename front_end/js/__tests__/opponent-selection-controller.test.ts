/*
 * @module opponent-selection-controller
 * @description Unit tests for OpponentSelectionController
 */

import { jest } from "@jest/globals";
import { OpponentSelectionController } from "../phases/opponent-selection/opponent-selection-controller.js";
import { Game } from "../shared/game/game.js";
import { PhaseChecker } from "../game/phases.js";

describe("OpponentSelectionController", () => {
  let locations;
  let transitionMock;
  let callbacks;
  beforeEach(() => {
    jest.clearAllMocks();
    locations = [
      {
        name: "Balamb",
        players: [{ id: 1, name: "Player A", location: "Balamb" }],
      },
    ];
    transitionMock = jest.fn();
    callbacks = { onOpponentSelected: jest.fn().mockResolvedValue() };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      canvas: { width: 800, height: 600 },
    };
  });

  test("constructor sets model and view", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    expect(ctrl.model).toBeDefined();
    expect(ctrl.model.locations).toBe(locations);
    expect(ctrl.transition).toBe(transitionMock);
  });

  test("constructor handles no callbacks", () => {
    const ctrl = new OpponentSelectionController(locations, transitionMock);
    expect(ctrl.callbacks).toEqual({});
  });

  test("activate sets phase checker", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.show = jest.fn();
    ctrl.activate();
    expect(PhaseChecker.playerSelectingOpponent).toBe(true);
    expect(ctrl.show).toHaveBeenCalled();
  });

  test("deactivate unsets phase checker", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.hide = jest.fn();
    ctrl.deactivate();
    expect(PhaseChecker.playerSelectingOpponent).toBe(false);
    expect(ctrl.hide).toHaveBeenCalled();
  });

  test("show adds container to stage", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.view.show = jest.fn();
    ctrl.view.container = {};
    ctrl.show();
    expect(ctrl.view.show).toHaveBeenCalled();
    expect(Game.stage.addChild).toHaveBeenCalledWith(ctrl.view.container);
  });

  test("hide removes container from stage", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.view.hide = jest.fn();
    ctrl.view.container = {};
    ctrl.hide();
    expect(Game.stage.removeChild).toHaveBeenCalledWith(ctrl.view.container);
  });

  test("hide with no container does not throw", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.view.container = undefined;
    expect(() => ctrl.hide()).not.toThrow();
  });

  test("navigate calls model.handleInput and view.refresh", () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.model.handleInput = jest.fn();
    ctrl.view.refresh = jest.fn();
    ctrl.navigate("left");
    expect(ctrl.model.handleInput).toHaveBeenCalledWith("left");
    expect(ctrl.view.refresh).toHaveBeenCalled();
  });

  test("confirm with player calls callback and transitions", async () => {
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.hide = jest.fn();
    await ctrl.confirm();
    expect(callbacks.onOpponentSelected).toHaveBeenCalled();
    expect(transitionMock).toHaveBeenCalledWith("rules");
  });

  test("confirm with no player does nothing", async () => {
    const emptyLocs = [{ name: "Empty", players: [] }];
    const ctrl = new OpponentSelectionController(
      emptyLocs,
      transitionMock,
      callbacks,
    );
    ctrl.hide = jest.fn();
    await ctrl.confirm();
    expect(callbacks.onOpponentSelected).not.toHaveBeenCalled();
    expect(transitionMock).not.toHaveBeenCalled();
  });

  test("confirm handles callback error gracefully", async () => {
    callbacks.onOpponentSelected.mockRejectedValue(new Error("API error"));
    const ctrl = new OpponentSelectionController(
      locations,
      transitionMock,
      callbacks,
    );
    ctrl.hide = jest.fn();
    await ctrl.confirm();
    expect(transitionMock).not.toHaveBeenCalled();
  });
});
