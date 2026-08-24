/**
 * @module input-model-extended
 * @description Unit tests for InputModel (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { PhaseChecker } from "../game/phases.js";
import DeckSelectionModel from "../phases/deck-selection/deck-selection-model.js";
import { ConfirmationController } from "../phases/confirmation/confirmation-controller.js";
import { PreviewCard } from "../shared/ui/preview-card.js";

describe("InputModel (extended)", () => {
  let InputModel;

  beforeAll(async () => {
    // Set up minimal state
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      canvas: { width: 800, height: 600 },
    };
    Game.models = {
      playerModel: {
        hand: [],
        handOffsetX: 100,
        selectedCard: undefined,
      },
    };
    Game.controllers = {
      playerController: {
        addCardToHand: jest.fn().mockReturnValue(true),
        removeLastCardFromHand: jest.fn().mockReturnValue({}),
        resetHand: jest.fn(),
      },
      handSelectController: {
        playSelectedCard: jest.fn(),
      },
      cursorController: {
        confirmation: { move: jest.fn(), remove: jest.fn() },
        playerHand: { move: jest.fn(), restorePlayerHandCursor: jest.fn() },
        grid: { move: jest.fn(), remove: jest.fn() },
      },
      placementController: { model: { placeCardOnBoard: jest.fn() } },
    };
    Game.ui = {};
    Game.startGame = jest.fn();

    const module_ = await import("../shared/input/input-model.js");
    InputModel = module_.InputModel;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    PhaseChecker.playerSelectingHand = false;
    PhaseChecker.playerConfirming = false;
    PhaseChecker.playerChoosingCard = false;
    PhaseChecker.playerSelectingPlacement = false;
  });

  test("constructor stores dependencies", () => {
    const playerView = { animateCardToHand: jest.fn() };
    const model = new InputModel({}, playerView, {});
    expect(model.playerModel).toBeDefined();
    expect(model.playerView).toBe(playerView);
    expect(model.placementController).toBeDefined();
  });

  describe("handleSelectionBookInput", () => {
    test("ArrowDown calls DeckSelectionUI.moveSelection and updates preview", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckUI.DeckSelectionUI, "moveSelection")
        .mockImplementation(() => {});
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue({ data: { name: "C" } });
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});
      const model = new InputModel({}, {}, {});
      model.handleSelectionBookInput({ key: "ArrowDown" });
      expect(deckUI.DeckSelectionUI.moveSelection).toHaveBeenCalledWith(true);
      expect(PreviewCard.showPreviewCard).toHaveBeenCalled();
    });

    test("ArrowUp calls DeckSelectionUI.moveSelection false", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckUI.DeckSelectionUI, "moveSelection")
        .mockImplementation(() => {});
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue({ data: { name: "C" } });
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});
      const model = new InputModel({}, {}, {});
      model.handleSelectionBookInput({ key: "ArrowUp" });
      expect(deckUI.DeckSelectionUI.moveSelection).toHaveBeenCalledWith(false);
    });

    test("ArrowLeft paginates left", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckUI.DeckSelectionUI, "paginate")
        .mockImplementation(() => {});
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue({ data: { name: "C" } });
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});
      const model = new InputModel({}, {}, {});
      model.handleSelectionBookInput({ key: "ArrowLeft" });
      expect(deckUI.DeckSelectionUI.paginate).toHaveBeenCalledWith("left");
    });

    test("Enter selects card from book", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest.spyOn(deckUI.DeckSelectionUI, "getSelectedCard").mockReturnValue({
        data: { name: "C" },
        visuals: {
          container: {
            /**
             * Mock implementation of clone for testing. In a real test, this would return a proper clone of the container.
             * @return {object} A mock container clone with x and y properties.
             */
            clone: () => ({ x: 0, y: 0 }),
          },
        },
        /**
         * Mock implementation of clone for testing. In a real test, this would return a proper clone of the card.
         * @return {object} A mock card clone with visuals and data properties.
         */
        clone: () => ({ visuals: { container: {} }, data: {} }),
      });
      const model = new InputModel(
        Game.models.playerModel,
        { animateCardToHand: jest.fn() },
        {},
      );
      model.selectCardFromBook();
    });

    test("Escape cancels last selection", () => {
      const model = new InputModel(Game.models.playerModel, {}, {});
      model.cancelLastSelection();
      expect(
        Game.controllers.playerController.removeLastCardFromHand,
      ).toHaveBeenCalled();
    });

    test("Backspace cancels last selection", () => {
      const model = new InputModel(Game.models.playerModel, {}, {});
      model.handleSelectionBookInput({ key: "Backspace" });
      expect(
        Game.controllers.playerController.removeLastCardFromHand,
      ).toHaveBeenCalled();
    });
  });

  describe("updatePreview", () => {
    test("hides preview card when no card is selected", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest.spyOn(deckUI.DeckSelectionUI, "getSelectedCard").mockReturnValue();
      jest.spyOn(PreviewCard, "hidePreviewCard").mockImplementation(() => {});
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});
      const model = new InputModel({}, {}, {});
      model.updatePreview();
      expect(PreviewCard.hidePreviewCard).toHaveBeenCalled();
    });
  });

  describe("selectCardFromBook", () => {
    test("does nothing when no selected card", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest.spyOn(deckUI.DeckSelectionUI, "getSelectedCard").mockReturnValue();
      const model = new InputModel({}, {}, {});
      model.selectCardFromBook();
      expect(
        Game.controllers.playerController.addCardToHand,
      ).not.toHaveBeenCalled();
    });

    test("triggers confirmation when hand is full", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      const card = {
        data: { name: "C", id: 1 },
        visuals: {
          container: {
            /**
             * Mock implementation of clone for testing. In a real test, this would return a proper clone of the container.
             * @return {object} A mock container clone with x and y properties.
             */
            clone: () => ({ x: 0, y: 0 }),
          },
        },
        clone: jest
          .fn()
          .mockReturnValue({ visuals: { container: {} }, data: {} }),
      };
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue(card);
      const showSpy = jest
        .spyOn(ConfirmationController, "show")
        .mockImplementation(() => {});
      const model = new InputModel(
        { hand: [{}, {}, {}, {}, {}] },
        { animateCardToHand: jest.fn() },
        {},
      );
      model.selectCardFromBook();
      expect(PhaseChecker.playerSelectingHand).toBe(false);
      expect(showSpy).toHaveBeenCalled();
    });

    test("does not add when addCardToHand returns false", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      Game.controllers.playerController.addCardToHand = jest
        .fn()
        .mockReturnValue(false);
      const card = {
        data: { name: "C", id: 1 },
        visuals: {
          container: {
            /**
             * Mock implementation of clone for testing. In a real test, this would return a proper clone of the container.
             * @return {object} A mock container clone with x and y properties.
             */
            clone: () => ({ x: 0, y: 0 }),
          },
        },
        clone: jest
          .fn()
          .mockReturnValue({ visuals: { container: {} }, data: {} }),
      };
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue(card);
      const model = new InputModel(
        { hand: [] },
        { animateCardToHand: jest.fn() },
        {},
      );
      model.selectCardFromBook();
      expect(PhaseChecker.playerSelectingHand).toBe(false);
    });
  });

  describe("cancelLastSelection", () => {
    test("sets flags when removed card exists and hand is small", () => {
      Game.models.playerModel.hand = [{}];
      const model = new InputModel(Game.models.playerModel, {}, {});
      model.cancelLastSelection();
      expect(PhaseChecker.playerSelectingHand).toBe(true);
    });

    test("does nothing when removeLastCardFromHand returns falsy", () => {
      Game.controllers.playerController.removeLastCardFromHand = jest
        .fn()
        .mockReturnValue();
      const model = new InputModel(Game.models.playerModel, {}, {});
      model.cancelLastSelection();
      // No assertions needed; just ensure no throw
    });
  });

  describe("handleConfirmation", () => {
    test("ArrowDown moves confirmation cursor down", () => {
      const model = new InputModel({}, {}, {});
      model.handleConfirmation({ key: "ArrowDown" });
      expect(
        Game.controllers.cursorController.confirmation.move,
      ).toHaveBeenCalledWith("down");
    });

    test("ArrowUp moves confirmation cursor up", () => {
      const model = new InputModel({}, {}, {});
      model.handleConfirmation({ key: "ArrowUp" });
      expect(
        Game.controllers.cursorController.confirmation.move,
      ).toHaveBeenCalledWith("up");
    });

    test("Enter triggers handleConfirmationChoice", () => {
      const model = new InputModel({}, {}, {});
      const handleSpy = jest
        .spyOn(model, "handleConfirmationChoice")
        .mockImplementation(() => {});
      model.handleConfirmation({ key: "Enter" });
      expect(handleSpy).toHaveBeenCalled();
    });

    test("Escape triggers handleConfirmationChoice with 'no'", () => {
      const model = new InputModel({}, {}, {});
      const handleSpy = jest
        .spyOn(model, "handleConfirmationChoice")
        .mockImplementation(() => {});
      model.handleConfirmation({ key: "Escape" });
      expect(handleSpy).toHaveBeenCalledWith("no");
    });
  });

  describe("handleConfirmationChoice", () => {
    test("yes choice starts game and inits cursor", () => {
      ConfirmationController.model = { selectedIndex: 0 };
      DeckSelectionModel.container = { id: "deck" };
      const model = new InputModel({}, {}, {});
      model.handleConfirmationChoice("yes");
      expect(Game.startGame).toHaveBeenCalled();
    });

    test("no choice resets hand and updates flags", async () => {
      const deckUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue({ data: { name: "C" } });
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});
      const model = new InputModel({}, {}, {});
      model.handleConfirmationChoice("no");
      expect(PhaseChecker.playerConfirming).toBe(false);
      expect(PhaseChecker.playerSelectingHand).toBe(true);
    });
  });

  describe("handlePlayerCardChoice", () => {
    test("ArrowUp moves player hand cursor up", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlayerCardChoice({ key: "ArrowUp" });
      expect(
        Game.controllers.cursorController.playerHand.move,
      ).toHaveBeenCalledWith("up");
    });

    test("ArrowDown moves player hand cursor down", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlayerCardChoice({ key: "ArrowDown" });
      expect(
        Game.controllers.cursorController.playerHand.move,
      ).toHaveBeenCalledWith("down");
    });

    test("Enter plays selected card", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlayerCardChoice({ key: "Enter" });
      expect(
        Game.controllers.handSelectController.playSelectedCard,
      ).toHaveBeenCalled();
    });
  });

  describe("handlePlacement", () => {
    test("ArrowLeft moves grid cursor left", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "ArrowLeft" });
      expect(Game.controllers.cursorController.grid.move).toHaveBeenCalledWith(
        "left",
      );
    });

    test("ArrowRight moves grid cursor right", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "ArrowRight" });
      expect(Game.controllers.cursorController.grid.move).toHaveBeenCalledWith(
        "right",
      );
    });

    test("ArrowUp moves grid cursor up", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "ArrowUp" });
      expect(Game.controllers.cursorController.grid.move).toHaveBeenCalledWith(
        "up",
      );
    });

    test("ArrowDown moves grid cursor down", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "ArrowDown" });
      expect(Game.controllers.cursorController.grid.move).toHaveBeenCalledWith(
        "down",
      );
    });

    test("Enter places card on board", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "Enter" });
      expect(
        Game.controllers.placementController.model.placeCardOnBoard,
      ).toHaveBeenCalled();
    });

    test("Escape restores player hand cursor", () => {
      const model = new InputModel({}, {}, {});
      model.handlePlacement({ key: "Escape" });
      expect(
        Game.controllers.cursorController.playerHand.restorePlayerHandCursor,
      ).toHaveBeenCalled();
    });
  });

  test("playSelectedCard delegates to handSelectController", () => {
    const model = new InputModel({}, {}, {});
    model.playSelectedCard();
    expect(
      Game.controllers.handSelectController.playSelectedCard,
    ).toHaveBeenCalled();
  });
});
