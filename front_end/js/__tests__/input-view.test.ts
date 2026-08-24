/**
 * @module input-view
 * @description Unit tests for InputView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("InputView", () => {
  let InputView;

  beforeAll(async () => {
    const module_ = await import("../shared/input/input-view.js");
    InputView = module_.InputView;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    Game.controllers = {
      cursorController: {
        selection: { move: jest.fn() },
        playerHand: { move: jest.fn() },
        confirmation: { move: jest.fn() },
      },
    };
  });

  describe("moveSelectionCursor", () => {
    test("calls cursorController.selection.move with direction", () => {
      const view = new InputView();
      view.moveSelectionCursor("left");

      expect(
        Game.controllers.cursorController.selection.move,
      ).toHaveBeenCalledWith("left");
    });

    test("calls move with different directions", () => {
      const view = new InputView();

      view.moveSelectionCursor("up");
      expect(
        Game.controllers.cursorController.selection.move,
      ).toHaveBeenCalledWith("up");

      view.moveSelectionCursor("right");
      expect(
        Game.controllers.cursorController.selection.move,
      ).toHaveBeenCalledWith("right");

      view.moveSelectionCursor("down");
      expect(
        Game.controllers.cursorController.selection.move,
      ).toHaveBeenCalledWith("down");
    });

    test("does not throw when cursorController is missing", () => {
      Game.controllers = {};

      const view = new InputView();
      expect(() => view.moveSelectionCursor("left")).toThrow();
    });
  });

  describe("movePlayerHandCursor", () => {
    test("calls cursorController.playerHand.move with direction", () => {
      const view = new InputView();
      view.movePlayerHandCursor("up");

      expect(
        Game.controllers.cursorController.playerHand.move,
      ).toHaveBeenCalledWith("up");
    });

    test("calls move with down direction", () => {
      const view = new InputView();
      view.movePlayerHandCursor("down");

      expect(
        Game.controllers.cursorController.playerHand.move,
      ).toHaveBeenCalledWith("down");
    });

    test("does not throw when cursorController is missing", () => {
      Game.controllers = {};

      const view = new InputView();
      expect(() => view.movePlayerHandCursor("up")).toThrow();
    });
  });

  describe("moveConfirmationCursor", () => {
    test("calls cursorController.confirmation.move with direction", () => {
      const view = new InputView();
      view.moveConfirmationCursor("up");

      expect(
        Game.controllers.cursorController.confirmation.move,
      ).toHaveBeenCalledWith("up");
    });

    test("calls move with down direction", () => {
      const view = new InputView();
      view.moveConfirmationCursor("down");

      expect(
        Game.controllers.cursorController.confirmation.move,
      ).toHaveBeenCalledWith("down");
    });

    test("does not throw when cursorController is missing", () => {
      Game.controllers = {};

      const view = new InputView();
      expect(() => view.moveConfirmationCursor("up")).toThrow();
    });
  });
});
