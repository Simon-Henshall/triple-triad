/**
 * @module cursor-controller
 * @description Unit tests for CursorController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("CursorController", () => {
  let CursorController;
  let mockView;

  beforeAll(async () => {
    // Mock dependencies referenced by cursor-model.js
    globalThis.SelectionBook = { controller: undefined };
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.models = { playerModel: { selectedCardNumber: 0, hand: [] } };

    // ConfirmationView is imported internally by cursor-model.js;
    // set its model to make confirmation.move() work
    const cvModule = await import(
      "../phases/confirmation/confirmation-view.js"
    );
    cvModule.ConfirmationView.model = {
      selectedIndex: 0,
      setSelected(index) {
        this.selectedIndex = index;
      },
    };

    const module_ = await import("../shared/cursor/cursor-controller.js");
    CursorController = module_.CursorController;
  });

  beforeEach(() => {
    mockView = {
      selection: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        ensurePopulated: jest.fn(),
        remove: jest.fn(),
      },
      confirmation: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        remove: jest.fn(),
      },
      playerHand: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        syncSelection: jest.fn(),
        remove: jest.fn(),
      },
      grid: {
        place: jest.fn(),
        updatePosition: jest.fn(),
        remove: jest.fn(),
      },
    };
  });

  test("selection.place calls model initPosition and view place", () => {
    const ctrl = CursorController(mockView);
    ctrl.selection.place();
    expect(mockView.selection.place).toHaveBeenCalled();
  });

  test("selection.move calls model move and view update", () => {
    const ctrl = CursorController(mockView);
    ctrl.selection.move("up");
    expect(mockView.selection.updatePosition).toHaveBeenCalled();
  });

  test("selection.remove calls view remove", () => {
    const ctrl = CursorController(mockView);
    ctrl.selection.remove();
    expect(mockView.selection.remove).toHaveBeenCalled();
  });

  test("confirmation.place calls model resetChoice and view place", () => {
    const ctrl = CursorController(mockView);
    ctrl.confirmation.place();
    expect(mockView.confirmation.place).toHaveBeenCalled();
  });

  test("confirmation.move calls view updatePosition when model returns changed", () => {
    const ctrl = CursorController(mockView);
    ctrl.confirmation.move("up");
    expect(mockView.confirmation.updatePosition).toHaveBeenCalled();
  });

  test("confirmation.remove calls view remove", () => {
    const ctrl = CursorController(mockView);
    ctrl.confirmation.remove();
    expect(mockView.confirmation.remove).toHaveBeenCalled();
  });

  test("playerHand.remove calls model clear and view remove", () => {
    const ctrl = CursorController(mockView);
    ctrl.playerHand.remove();
    expect(mockView.playerHand.remove).toHaveBeenCalled();
  });

  test("grid.remove calls model clear and view remove", () => {
    const ctrl = CursorController(mockView);
    ctrl.grid.remove();
    expect(mockView.grid.remove).toHaveBeenCalled();
  });
});
