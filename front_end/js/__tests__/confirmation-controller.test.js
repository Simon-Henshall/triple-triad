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
  });

  test("ConfirmationController has expected properties", () => {
    expect(typeof ConfirmationController.show).toBe("function");
    expect(typeof ConfirmationController.hide).toBe("function");
    expect(typeof ConfirmationController.accept).toBe("function");
    expect(typeof ConfirmationController.cancel).toBe("function");
  });
});
