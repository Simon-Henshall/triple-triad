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
      ctrl.view = { flipCard: jest.fn(), refreshCardFace: jest.fn() };
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

  describe("_showRulePopup", () => {
    test("calls view.showRulePopup with rule name and exclamation mark", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl._showRulePopup("Same");
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Same!", "#FFD700");
    });

    test("uses custom color when provided", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl._showRulePopup("Plus", "#FF0000");
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Plus!", "#FF0000");
    });

    test("uses color map for Same (gold)", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl._showRulePopup("Same");
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Same!", "#FFD700");
    });

    test("uses color map for Plus (deep sky blue)", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl._showRulePopup("Plus");
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Plus!", "#00BFFF");
    });

    test("uses color map for Combo (orange red)", () => {
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl._showRulePopup("Combo");
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Combo!", "#FF4500");
    });
  });

  describe("rule popup integration", () => {
    test("shows Same popup when Same rule triggers flips", () => {
      Game.rules = ["same"];
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      // Mock flipCardOver to avoid side effects
      ctrl.flipCardOver = jest.fn();

      // Create a card with two adjacent opponent cards that have matching values
      const targetA = {
        owner: "ai",
        data: {
          strength: { right: 5 },
          originalStrength: { right: 5 },
        },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 1,
      };
      const targetB = {
        owner: "ai",
        data: {
          strength: { left: 5 },
          originalStrength: { left: 5 },
        },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 2,
      };
      const card = {
        owner: "player",
        data: {
          strength: { left: 5, right: 5, up: 5, down: 5 },
          originalStrength: { left: 5, right: 5, up: 5, down: 5 },
        },
        cardLeft: targetA,
        cardRight: targetB,
        cardUp: undefined,
        cardDown: undefined,
        setOwner: jest.fn(),
      };

      ctrl.flipCardsCheck(card);

      // Same should have triggered and shown popup
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Same!", "#FFD700");
    });

    test("shows Plus popup when Plus rule triggers flips", () => {
      Game.rules = ["plus"];
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl.flipCardOver = jest.fn();

      // Create a card with two adjacent opponent cards where sums match
      // placedCurrent[left]=3 + targetA.strength[right]=7 = 10
      // placedCurrent[right]=4 + targetB.strength[left]=6 = 10
      const targetA = {
        owner: "ai",
        data: {
          strength: { right: 7 },
        },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 1,
      };
      const targetB = {
        owner: "ai",
        data: {
          strength: { left: 6 },
        },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 2,
      };
      const card = {
        owner: "player",
        data: {
          strength: { left: 3, right: 4, up: 5, down: 5 },
          originalStrength: { left: 3, right: 4, up: 5, down: 5 },
        },
        cardLeft: targetA,
        cardRight: targetB,
        cardUp: undefined,
        cardDown: undefined,
        setOwner: jest.fn(),
      };

      ctrl.flipCardsCheck(card);

      // Plus should have triggered and shown popup
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Plus!", "#00BFFF");
    });

    test("shows Combo popup when combo chain triggers flips", () => {
      Game.rules = ["same"];
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl.flipCardOver = jest.fn();

      // Set up combo captured cards manually and call _applyComboChain
      // For the combo check on the 'right' direction:
      //   capturedStrength = capturedCard.data.strength[opponentStrength] = capturedCard.data.strength["left"]
      //   adjacentStrength = adjacent.data.strength[playerStrength] = adjacent.data.strength["right"]
      // So capturedCard.strength.left must be > adjacent.strength.right
      const adjacentCard = {
        owner: "ai",
        data: {
          strength: { right: 5, left: 1, up: 1, down: 1 },
        },
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 3,
      };
      const capturedCard = {
        owner: "player",
        data: {
          strength: { left: 8, right: 1, up: 1, down: 1 },
        },
        cardLeft: undefined,
        cardRight: adjacentCard,
        cardUp: undefined,
        cardDown: undefined,
        setOwner: jest.fn(),
        visuals: { container: {} },
        inCell: 2,
      };

      ctrl._comboCapturedCards = [capturedCard];
      ctrl._applyComboChain({ owner: "player" });

      // Combo should have triggered and shown popup
      expect(ctrl.view.showRulePopup).toHaveBeenCalledWith("Combo!", "#FF4500");
    });

    test("does not show Same popup when Same rule does not trigger", () => {
      Game.rules = ["same"];
      const ctrl = new ResolutionController({}, transitionMock);
      ctrl.view.showRulePopup = jest.fn();
      ctrl.flipCardOver = jest.fn();

      // Card with no adjacent cards - Same can't trigger
      const card = {
        owner: "player",
        data: {
          strength: { left: 5, right: 5, up: 5, down: 5 },
          originalStrength: { left: 5, right: 5, up: 5, down: 5 },
        },
        cardLeft: undefined,
        cardRight: undefined,
        cardUp: undefined,
        cardDown: undefined,
        setOwner: jest.fn(),
      };

      ctrl.flipCardsCheck(card);

      expect(ctrl.view.showRulePopup).not.toHaveBeenCalled();
    });
  });
});
