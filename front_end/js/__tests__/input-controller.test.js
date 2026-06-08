/**
 * @module input-controller
 * @description Unit tests for InputController
 */

import { jest } from "@jest/globals";

describe("InputController", () => {
  let InputController;
  let mockModel;

  beforeAll(async () => {
    const module_ = await import("../shared/input/input-controller.js");
    InputController = module_.InputController;

    jest.unstable_mockModule("../shared/input/input-view.js", () => ({
      InputView: jest.fn(() => ({})),
    }));
  });

  beforeEach(() => {
    mockModel = {
      handleSelectionBookInput: jest.fn(),
      handleConfirmation: jest.fn(),
      handlePlayerCardChoice: jest.fn(),
      handlePlacement: jest.fn(),
    };
  });

  test("constructor sets model and creates view", () => {
    const ctrl = new InputController(mockModel);
    expect(ctrl.model).toBe(mockModel);
    expect(ctrl.view).toBeDefined();
  });

  test("handleKey routes to handleSelectionBookInput when playerSelectingHand", async () => {
    const module_ = await import("../game/phases.js");
    module_.PhaseChecker.playerSelectingHand = true;
    module_.PhaseChecker.playerConfirming = false;
    module_.PhaseChecker.playerChoosingCard = false;
    module_.PhaseChecker.playerSelectingPlacement = false;

    const ctrl = new InputController(mockModel);
    ctrl.handleKey({ key: "ArrowUp" });
    expect(mockModel.handleSelectionBookInput).toHaveBeenCalled();
  });

  test("handleKey routes to handleConfirmation when playerConfirming", async () => {
    const module_ = await import("../game/phases.js");
    module_.PhaseChecker.playerSelectingHand = false;
    module_.PhaseChecker.playerConfirming = true;
    module_.PhaseChecker.playerChoosingCard = false;
    module_.PhaseChecker.playerSelectingPlacement = false;

    const ctrl = new InputController(mockModel);
    ctrl.handleKey({ key: "Enter" });
    expect(mockModel.handleConfirmation).toHaveBeenCalled();
  });

  test("handleKey routes to handlePlayerCardChoice when playerChoosingCard", async () => {
    const module_ = await import("../game/phases.js");
    module_.PhaseChecker.playerSelectingHand = false;
    module_.PhaseChecker.playerConfirming = false;
    module_.PhaseChecker.playerChoosingCard = true;
    module_.PhaseChecker.playerSelectingPlacement = false;

    const ctrl = new InputController(mockModel);
    ctrl.handleKey({ key: "ArrowUp" });
    expect(mockModel.handlePlayerCardChoice).toHaveBeenCalled();
  });

  test("handleKey routes to handlePlacement when playerSelectingPlacement", async () => {
    const module_ = await import("../game/phases.js");
    module_.PhaseChecker.playerSelectingHand = false;
    module_.PhaseChecker.playerConfirming = false;
    module_.PhaseChecker.playerChoosingCard = false;
    module_.PhaseChecker.playerSelectingPlacement = true;

    const ctrl = new InputController(mockModel);
    ctrl.handleKey({ key: "ArrowLeft" });
    expect(mockModel.handlePlacement).toHaveBeenCalled();
  });
});
