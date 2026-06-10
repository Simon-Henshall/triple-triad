/**
 * @module game-extended
 * @description Additional unit tests for Game
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { BoardView } from "../shared/board/board-view.js";
import { PreviewCard } from "../shared/ui/preview-card.js";
import { InfoBox } from "../shared/ui/info-box.js";
import DeckSelectionModel from "../phases/deck-selection/deck-selection-model.js";
import { PhaseChecker } from "../game/phases.js";

describe("Game (extended)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      setChildIndex: jest.fn(),
      numChildren: 5,
      getNumChildren: jest.fn().mockReturnValue(5),
      contains: jest.fn().mockReturnValue(false),
    };
    Game.models = {};
    Game.controllers = {};
    Game.views = {};
    Game.ui = {};
    Game.stageWidth = 800;
    Game.stageHeight = 600;
    Game.cards = {};
  });

  describe("startGame", () => {
    test("removes selection UI containers and generates board", () => {
      DeckSelectionModel.container = { id: "deck" };
      const removeChildSpy = jest.spyOn(Game.stage, "removeChild");
      BoardView.generateGrid = jest.fn();
      Game.models.playerModel = { hand: [{ data: { name: "C" } }] };
      Game.views.playerView = {
        renderHand: jest.fn(),
        indentSelectedCard: jest.fn(),
      };
      Game.ui.scoreBoard = { draw: jest.fn(), container: { id: "score" } };
      Game.controllers.cursorController = {
        playerHand: { place: jest.fn() },
      };

      Game.startGame();
      expect(removeChildSpy).toHaveBeenCalledWith(DeckSelectionModel.container);
      expect(BoardView.generateGrid).toHaveBeenCalled();
      expect(Game.ui.scoreBoard.draw).toHaveBeenCalled();
    });

    test("warns when player hand is empty", () => {
      const logWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
      BoardView.generateGrid = jest.fn();
      Game.models.playerModel = { hand: [] };
      Game.ui.scoreBoard = { draw: jest.fn(), container: {} };
      Game.startGame();
      expect(logWarn).toHaveBeenCalled();
      logWarn.mockRestore();
    });

    test("sets first card and updates info box when player has cards", () => {
      const firstCard = { data: { name: "FirstCard" } };
      BoardView.generateGrid = jest.fn();
      Game.models.playerModel = { hand: [firstCard] };
      Game.views.playerView = {
        renderHand: jest.fn(),
        indentSelectedCard: jest.fn(),
      };
      Game.ui.scoreBoard = { draw: jest.fn(), container: {} };
      Game.controllers.cursorController = {
        playerHand: { place: jest.fn() },
      };
      const drawSpy = jest.spyOn(InfoBox, "drawInfoBox");
      const updateSpy = jest.spyOn(InfoBox, "updateInfoBox");

      Game.startGame();
      expect(Game.models.playerModel.selectedCard).toBe(firstCard);
      expect(Game.views.playerView.indentSelectedCard).toHaveBeenCalledWith(
        firstCard,
      );
      expect(drawSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(PhaseChecker.playerConfirming).toBe(false);
      expect(PhaseChecker.playerChoosingCard).toBe(true);
    });

    test("does not throw when cursorController is missing", () => {
      BoardView.generateGrid = jest.fn();
      Game.models.playerModel = { hand: [] };
      Game.ui.scoreBoard = { draw: jest.fn(), container: {} };
      Game.controllers = {};
      expect(() => Game.startGame()).not.toThrow();
    });
  });

  describe("setupSelectionBook", () => {
    test("calls DeckSelectionUI.initialise and shows preview card", async () => {
      const deckSelectionUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "initialise")
        .mockImplementation(() => {});
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue({ data: { name: "X" }, visuals: {} });
      jest.spyOn(PreviewCard, "showPreviewCard").mockImplementation(() => {});

      const playerModel = { deck: [] };
      Game.controllers.cursorController = {
        selection: { place: jest.fn() },
      };
      await Game.setupSelectionBook(playerModel);
      expect(PhaseChecker.playerSelectingHand).toBe(true);
    });

    test("waits for image load before previewing if image is not complete", async () => {
      const deckSelectionUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "initialise")
        .mockImplementation(() => {});
      const card = {
        data: { name: "Loading" },
        visuals: {
          faceBitmap: {
            image: { complete: false, addEventListener: jest.fn() },
          },
        },
      };
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue(card);
      const showSpy = jest
        .spyOn(PreviewCard, "showPreviewCard")
        .mockImplementation(() => {});

      const playerModel = { deck: [] };
      Game.controllers.cursorController = {
        selection: { place: jest.fn() },
      };
      await Game.setupSelectionBook(playerModel);
      // The image had a load listener attached, but showPreviewCard not called yet
      expect(
        card.visuals.faceBitmap.image.addEventListener,
      ).toHaveBeenCalledWith("load", expect.any(Function));
    });

    test("handles missing getSelectedCard result gracefully", async () => {
      const deckSelectionUI = await import(
        "../phases/deck-selection/deck-selection-ui.js"
      );
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "initialise")
        .mockImplementation(() => {});
      jest
        .spyOn(deckSelectionUI.DeckSelectionUI, "getSelectedCard")
        .mockReturnValue();
      const playerModel = { deck: [] };
      Game.controllers.cursorController = {
        selection: { place: jest.fn() },
      };
      expect(() => Game.setupSelectionBook(playerModel)).not.toThrow();
    });
  });
});
