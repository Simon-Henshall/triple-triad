/**
 * @module confirmation-controller
 * @description Unit tests for ConfirmationController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("ConfirmationController", () => {
  let ConfirmationController;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/confirmation/confirmation-controller.js"
    );
    ConfirmationController = module_.ConfirmationController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Game.controllers = {
      cursorController: {
        selection: { remove: jest.fn() },
        confirmation: { place: jest.fn() },
      },
    };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    ConfirmationController.model = undefined;
  });

  test("ConfirmationController is defined", () => {
    expect(ConfirmationController).toBeDefined();
  });

  test("ConfirmationController has expected methods", () => {
    expect(typeof ConfirmationController.show).toBe("function");
    expect(typeof ConfirmationController.hide).toBe("function");
    expect(typeof ConfirmationController.accept).toBe("function");
    expect(typeof ConfirmationController.cancel).toBe("function");
  });

  test("show creates model if not present", () => {
    ConfirmationController.show();
    expect(ConfirmationController.model).toBeDefined();
  });

  test("show removes selection cursor", () => {
    ConfirmationController.show();
    expect(
      Game.controllers.cursorController.selection.remove,
    ).toHaveBeenCalled();
  });

  test("show adds container to stage", () => {
    ConfirmationController.show();
    expect(Game.stage.addChild).toHaveBeenCalled();
  });

  test("show updates stage", () => {
    ConfirmationController.show();
    expect(Game.stage.update).toHaveBeenCalled();
  });

  test("show reuses existing model", () => {
    const mockModel = { setSelected: jest.fn() };
    ConfirmationController.model = mockModel;
    ConfirmationController.show();
    expect(ConfirmationController.model).toBe(mockModel);
  });

  test("hide removes container from stage", () => {
    ConfirmationController.show();
    ConfirmationController.hide();
    expect(Game.stage.removeChild).toHaveBeenCalled();
  });

  test("accept calls hide", () => {
    ConfirmationController.show();
    ConfirmationController.accept();
    expect(Game.stage.removeChild).toHaveBeenCalled();
  });

  test("cancel calls hide", () => {
    ConfirmationController.show();
    ConfirmationController.cancel();
    expect(Game.stage.removeChild).toHaveBeenCalled();
  });
});
