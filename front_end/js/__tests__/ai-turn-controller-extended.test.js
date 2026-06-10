/**
 * @module ai-turn-controller-extended
 * @description Unit tests for AITurnController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { offsets } from "../constants/offsets.js";

describe("AiTurnController (extended)", () => {
  let AiTurnController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import("../phases/ai-turn/ai-turn-controller.js");
    AiTurnController = module_.AITurnController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.controllers = {
      placementController: {
        model: { placeCard: jest.fn() },
      },
    };
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    BoardModel.selectedSquare = 5;
    BoardModel.updateUISelection = jest.fn();
  });

  test("constructor stores model, transition, and creates view", () => {
    const aiModel = { hand: [] };
    const ctrl = new AiTurnController({ aiModel }, transitionMock);
    expect(ctrl.model).toBe(aiModel);
    expect(ctrl.transition).toBe(transitionMock);
    expect(ctrl.view).toBeDefined();
    expect(ctrl.handOffsetX).toBe(offsets.cardOffsetX);
  });

  describe("activate", () => {
    test("activates and calls takeTurn", () => {
      const aiModel = {
        hand: [{ data: { name: "Card1" } }],
        chooseCard: jest.fn().mockReturnValue({ data: { name: "Card1" } }),
        cardsAboveSelection: 0,
        decrementMove: jest.fn(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      ctrl.takeTurn = jest.fn();
      ctrl.activate();
      expect(ctrl.takeTurn).toHaveBeenCalled();
    });
  });

  describe("deactivate", () => {
    test("does not throw", async () => {
      const aiModel = { hand: [] };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      await expect(ctrl.deactivate()).resolves.not.toThrow();
    });
  });

  describe("initHand", () => {
    test("returns early when drawnCards is empty", () => {
      const aiModel = { hand: [] };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const displayHandSpy = jest.spyOn(ctrl.view, "displayHand");
      ctrl.initHand([]);
      expect(displayHandSpy).not.toHaveBeenCalled();
    });

    test("calls view.displayHand with cards and offset", () => {
      const aiModel = { hand: [] };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const displayHandSpy = jest
        .spyOn(ctrl.view, "displayHand")
        .mockImplementation(() => {});
      const cards = [{ data: { name: "A" } }, { data: { name: "B" } }];
      ctrl.initHand(cards);
      expect(displayHandSpy).toHaveBeenCalledWith(cards, ctrl.handOffsetX);
    });
  });

  describe("takeTurn", () => {
    test("returns early when no card can be chosen", () => {
      const aiModel = {
        hand: [],
        chooseCard: jest.fn().mockReturnValue(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      ctrl.takeTurn();
      expect(aiModel.chooseCard).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("returns early when no free cells available", () => {
      const aiModel = {
        hand: [{ data: { name: "X" } }],
        chooseCard: jest.fn().mockReturnValue({ data: { name: "X" } }),
        cardsAboveSelection: 0,
        decrementMove: jest.fn(),
      };
      // Fill all cells
      BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
        element: 0,
        occupant: { data: { id: 1 } },
      }));
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      ctrl.takeTurn();
      expect(logWarn).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("places a card on a free cell", () => {
      const playedCard = { data: { name: "Played" } };
      const aiModel = {
        hand: [playedCard],
        chooseCard: jest.fn().mockReturnValue(playedCard),
        cardsAboveSelection: 0,
        decrementMove: jest.fn(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      ctrl.view.shiftCardsDown = jest.fn();
      ctrl.takeTurn();
      expect(BoardModel.updateUISelection).toHaveBeenCalled();
      expect(
        Game.controllers.placementController.model.placeCard,
      ).toHaveBeenCalled();
      expect(aiModel.decrementMove).toHaveBeenCalled();
    });
  });

  describe("resetHand", () => {
    test("calls view.clearHand and model.resetHand", () => {
      const aiModel = { hand: [], resetHand: jest.fn() };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      ctrl.view.clearHand = jest.fn();
      ctrl.resetHand();
      expect(ctrl.view.clearHand).toHaveBeenCalledWith(aiModel.hand);
      expect(aiModel.resetHand).toHaveBeenCalled();
    });
  });
});
