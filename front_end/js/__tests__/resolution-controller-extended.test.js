/**
 * @module resolution-controller-extended
 * @description Unit tests for ResolutionController (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { PhaseChecker } from "../game/phases.js";

describe("ResolutionController (extended)", () => {
  let ResolutionController;
  let transitionMock;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/resolution/resolution-controller.js"
    );
    ResolutionController = module_.ResolutionController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    transitionMock = jest.fn();
    Game.models = {
      playerModel: { totalBlueCards: 0 },
      aiTurnModel: { currentlyOwnedCards: 0 },
    };
    Game.ui = { scoreBoard: { update: jest.fn() } };
    Game.stage = {
      addChild: jest.fn(),
      update: jest.fn(),
      canvas: { width: 800, height: 600 },
    };
    BoardModel.squares = [];
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    PhaseChecker.playerTurn = "blue";
  });

  test("constructor with no args sets transition to undefined", () => {
    const ctrl = new ResolutionController();
    expect(ctrl.transition).toBeUndefined();
  });

  test("constructor with localDeps object stores model from deps", () => {
    const model = { recordFlip: jest.fn() };
    const ctrl = new ResolutionController({ model }, transitionMock);
    expect(ctrl.model).toBe(model);
    expect(ctrl.transition).toBe(transitionMock);
  });

  describe("flipCardsCheck", () => {
    test("skips when no target card in direction", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      const card = {
        owner: "player",
        data: { strength: { left: 5, up: 5, right: 5, down: 5 } },
        cardLeft: undefined,
        cardUp: undefined,
        cardRight: undefined,
        cardDown: undefined,
      };
      expect(() => ctrl.flipCardsCheck(card)).not.toThrow();
    });

    test("does not flip when target has higher strength", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      const target = {
        owner: "ai",
        data: { strength: { right: 10 } },
        setOwner: jest.fn(),
        visuals: { container: {} },
      };
      const card = {
        owner: "player",
        data: { strength: { left: 5 } },
        cardLeft: target,
        setOwner: jest.fn(),
      };
      ctrl.flipCardsCheck(card);
      expect(card.setOwner).not.toHaveBeenCalled();
    });

    test("flips when current card strength is higher", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      const target = {
        owner: "ai",
        data: { strength: { right: 3 } },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 5,
      };
      const card = {
        owner: "player",
        data: { strength: { left: 7 } },
        cardLeft: target,
        setOwner: jest.fn(),
      };
      ctrl.flipCardsCheck(card);
      expect(target.setOwner).toHaveBeenCalledWith("player");
    });
  });

  describe("flipCardOver", () => {
    test("returns early when targetCard is undefined", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      expect(() => ctrl.flipCardOver(undefined, "left")).not.toThrow();
    });

    test("flips card to current player owner and records flip when model exists", () => {
      const ctrl = new ResolutionController(
        { model: { recordFlip: jest.fn() } },
        transitionMock,
      );
      const target = {
        owner: "ai",
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 1,
      };
      ctrl.view = {
        flipCard: jest.fn(),
        refreshCardFace: jest.fn(),
      };
      BoardModel.squares = [{ card: undefined }, { card: undefined }];
      ctrl.flipCardOver(target, "left");
      expect(target.setOwner).toHaveBeenCalledWith("player");
      expect(ctrl.model.recordFlip).toHaveBeenCalledWith(target);
      expect(ctrl.view.flipCard).toHaveBeenCalled();
      expect(ctrl.view.refreshCardFace).toHaveBeenCalled();
    });

    test("flips card to AI owner when turn is red", () => {
      PhaseChecker.playerTurn = "red";
      const ctrl = new ResolutionController({}, transitionMock);
      const target = {
        owner: "player",
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 1,
      };
      ctrl.view = { flipCard: jest.fn(), refreshCardFace: jest.fn() };
      ctrl.flipCardOver(target, "right");
      expect(target.setOwner).toHaveBeenCalledWith("ai");
    });

    test("does nothing on missing square object", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      const target = {
        owner: "ai",
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 99,
      };
      ctrl.view = { flipCard: jest.fn(), refreshCardFace: jest.fn() };
      BoardModel.squares = [];
      expect(() => ctrl.flipCardOver(target, "left")).not.toThrow();
    });
  });

  describe("updateOwnershipCounts", () => {
    test("decrements AI cards and increments player when turn is blue", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      Game.models.playerModel.totalBlueCards = 5;
      Game.models.aiTurnModel.currentlyOwnedCards = 5;
      ctrl.updateOwnershipCounts(1);
      expect(Game.models.playerModel.totalBlueCards).toBe(6);
      expect(Game.models.aiTurnModel.currentlyOwnedCards).toBe(4);
    });

    test("increments AI cards and decrements player when turn is red", () => {
      PhaseChecker.playerTurn = "red";
      const ctrl = new ResolutionController({}, transitionMock);
      Game.models.playerModel.totalBlueCards = 5;
      Game.models.aiTurnModel.currentlyOwnedCards = 5;
      ctrl.updateOwnershipCounts(1);
      expect(Game.models.playerModel.totalBlueCards).toBe(4);
      expect(Game.models.aiTurnModel.currentlyOwnedCards).toBe(6);
    });
  });

  test("activate does not call transition when not provided", async () => {
    const ctrl = new ResolutionController();
    await ctrl.activate();
    // Should not throw
  });
});
