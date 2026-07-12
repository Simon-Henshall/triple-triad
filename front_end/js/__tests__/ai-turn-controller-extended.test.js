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

    // Mock global createjs so that AITurnView constructor can create a cursor bitmap
    globalThis.createjs = {
      Bitmap: jest.fn().mockReturnValue({ visible: false }),
      Tween: {
        get: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue({ call: jest.fn() }),
        }),
      },
      Ease: { quadOut: jest.fn() },
    };

    Game.stage = {
      canvas: { height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
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
    test("activates and calls takeTurn", async () => {
      const aiModel = {
        hand: [{ data: { name: "Card1" } }],
        chooseCard: jest.fn().mockReturnValue({ data: { name: "Card1" } }),
        cardsAboveSelection: 0,
        decrementMove: jest.fn(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      ctrl.takeTurn = jest.fn();
      await ctrl.activate();
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
    test("returns early when no card can be chosen", async () => {
      const aiModel = {
        hand: [],
        chooseCard: jest.fn().mockReturnValue(-1),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      await ctrl.takeTurn();
      expect(aiModel.chooseCard).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("returns early when takeCard fails (no card retrieved)", async () => {
      const aiModel = {
        hand: [{ data: { name: "X" } }],
        chooseCard: jest.fn().mockReturnValue(0),
        cardsAboveSelection: 0,
        takeCard: jest.fn().mockReturnValue(),
        decrementMove: jest.fn(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

      // Mock the async thinking animation to skip delays
      ctrl._animateThinking = jest.fn().mockResolvedValue();
      // Mock view.showSelection/hideSelection to avoid visual delay in test
      jest.spyOn(ctrl.view, "showSelection").mockImplementation(() => {});
      jest.spyOn(ctrl.view, "hideSelection").mockImplementation(() => {});

      await ctrl.takeTurn();
      expect(logWarn).toHaveBeenCalled();
      expect(aiModel.takeCard).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("returns early when no free cells available", async () => {
      const playedCard = { data: { name: "X" } };
      const aiModel = {
        hand: [playedCard],
        chooseCard: jest.fn().mockReturnValue(0),
        cardsAboveSelection: 0,
        takeCard: jest.fn().mockReturnValue(playedCard),
        decrementMove: jest.fn(),
      };
      // Fill all cells
      BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
        element: 0,
        occupant: { data: { id: 1 } },
      }));
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});

      // Mock the async thinking animation to skip delays
      ctrl._animateThinking = jest.fn().mockResolvedValue();
      // Mock view.showSelection/hideSelection to avoid visual delay in test
      jest.spyOn(ctrl.view, "showSelection").mockImplementation(() => {});
      jest.spyOn(ctrl.view, "hideSelection").mockImplementation(() => {});

      await ctrl.takeTurn();
      expect(logWarn).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("places a card on a free cell", async () => {
      const playedCard = { data: { name: "Played" } };
      const aiModel = {
        hand: [playedCard],
        chooseCard: jest.fn().mockReturnValue(0),
        cardsAboveSelection: 0,
        takeCard: jest.fn().mockReturnValue(playedCard),
        decrementMove: jest.fn(),
      };
      const ctrl = new AiTurnController({ aiModel }, transitionMock);
      ctrl.view.shiftCardsDown = jest.fn();

      // Mock the async thinking animation to skip delays
      ctrl._animateThinking = jest.fn().mockResolvedValue();
      // Mock view.showSelection/hideSelection to avoid visual delay in test
      jest.spyOn(ctrl.view, "showSelection").mockImplementation(() => {});
      jest.spyOn(ctrl.view, "hideSelection").mockImplementation(() => {});

      await ctrl.takeTurn();
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
