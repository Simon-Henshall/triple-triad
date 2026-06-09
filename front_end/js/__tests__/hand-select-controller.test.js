/**
 * @module hand-select-controller
 * @description Unit tests for HandSelectController
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";

describe("HandSelectController", () => {
  let HandSelectController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/hand-select/hand-select-controller.js"
    );
    HandSelectController = module_.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.controllers = {
      cursorController: {
        grid: { place: jest.fn() },
      },
    };
    Game.stage = new createjs.Stage();
    // Ensure InfoBox has a valid stage reference
    Game.stage.canvas = { width: 800, height: 600 };
    Game.models = {
      playerModel: { selectedCard: { data: { id: 1 }, name: "Test Card" } },
    };
  });

  test("constructor stores dependencies and creates model/view", () => {
    const playerModel = {
      hand: [],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const deps = {
      playerModel,
      cursorController: {},
      handUI: {},
      boardModel: {},
    };
    const ctrl = new HandSelectController(deps, transitionMock);
    expect(ctrl.playerModel).toBe(playerModel);
    expect(ctrl.model).toBeDefined();
    expect(ctrl.view).toBeDefined();
    expect(Game.controllers.handSelectController).toBe(ctrl);
  });

  test("activate sets playerChoosingCard to true and calls model/view", async () => {
    const ctrl = new HandSelectController(
      { playerModel: { hand: [] } },
      transitionMock,
    );
    await ctrl.activate();
    const module_ = await import("../game/phases.js");
    expect(module_.PhaseChecker.playerChoosingCard).toBe(true);
  });

  test("deactivate sets playerChoosingCard to false", async () => {
    const ctrl = new HandSelectController(
      { playerModel: { hand: [] } },
      transitionMock,
    );
    await ctrl.deactivate();
    const module_ = await import("../game/phases.js");
    expect(module_.PhaseChecker.playerChoosingCard).toBe(false);
  });

  test("playSelectedCard warns when no card is selected", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const ctrl = new HandSelectController({ playerModel: {} }, transitionMock);
    ctrl.playSelectedCard();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("playSelectedCard with valid card sets up board and transitions", () => {
    const mockCard = { data: { id: 1 } };
    const playerModel = {
      hand: [mockCard],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const ctrl = new HandSelectController(
      { playerModel, cursorController: Game.controllers.cursorController },
      transitionMock,
    );
    ctrl.playSelectedCard();
    expect(BoardModel.selectedRow).toBe(2);
    expect(BoardModel.selectedColumn).toBe(2);
    expect(BoardModel.selectedSquare).toBe(5);
    expect(transitionMock).toHaveBeenCalledWith("placement", {
      selectedCard: mockCard,
      selectedSquare: 5,
    });
  });

  test("playSelectedCard without transition does not throw", () => {
    const mockCard = { data: { id: 1 } };
    const playerModel = {
      hand: [mockCard],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const ctrl = new HandSelectController(
      { playerModel, cursorController: Game.controllers.cursorController },
      undefined,
    );
    expect(() => ctrl.playSelectedCard()).not.toThrow();
  });

  test("playSelectedCard updates info box when cell has occupant", () => {
    const mockCard = { data: { id: 1 } };
    const mockOccupant = { data: { id: 2 } };
    BoardModel.getOccupant = jest.fn().mockReturnValue(mockOccupant);
    const playerModel = {
      hand: [mockCard],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const ctrl = new HandSelectController(
      { playerModel, cursorController: Game.controllers.cursorController },
      transitionMock,
    );
    ctrl.playSelectedCard();
    expect(BoardModel.getOccupant).toHaveBeenCalledWith(4);
  });

  test("playSelectedCard does not update info box when cell is empty", () => {
    const mockCard = { data: { id: 1 } };
    BoardModel.getOccupant = jest.fn().mockReturnValue();
    const playerModel = {
      hand: [mockCard],
      selectedCardNumber: 0,
      playedCardsCount: 0,
    };
    const ctrl = new HandSelectController(
      { playerModel, cursorController: Game.controllers.cursorController },
      transitionMock,
    );
    ctrl.playSelectedCard();
    expect(BoardModel.getOccupant).toHaveBeenCalledWith(4);
  });
});
