/**
 * @module placement-model
 * @description Unit tests for PlacementModel
 */

import { jest } from "@jest/globals";

describe("PlacementModel", () => {
  let PlacementModel;
  let Game;
  let BoardModel;
  let mockController;
  let mockTransition;

  beforeAll(async () => {
    // Set up BoardModel and Game mocks before importing
    const boardModule = await import("../shared/board/board-model.js");
    BoardModel = boardModule.BoardModel;
    const gameModule = await import("../shared/game/game.js");
    Game = gameModule.Game;

    const module_ = await import("../phases/placement/placement-model.js");
    PlacementModel = module_.PlacementModel;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up BoardModel
    BoardModel.selectedSquare = 5;
    BoardModel.selectedRow = 2;
    BoardModel.selectedColumn = 2;
    BoardModel.squareLeft = 4;
    BoardModel.squareUp = 2;
    BoardModel.squareRight = 6;
    BoardModel.squareDown = 8;
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    BoardModel.freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    BoardModel.lastPlacedSquare = undefined;
    BoardModel.boardContainer = {
      globalToLocal: jest.fn((x, y) => ({ x, y })),
      contains: jest.fn().mockReturnValue(false),
      addChild: jest.fn(),
    };
    BoardModel.cellOccupied = jest.fn().mockReturnValue(false);
    BoardModel.getOccupant = jest.fn().mockReturnValue();
    BoardModel.updateUISelection = jest.fn();

    // Set up Game
    Game.stage = { update: jest.fn() };
    Game.controllers = {
      cursorController: { grid: { remove: jest.fn() } },
    };

    // Mock controller
    mockController = {
      playerModel: {
        hand: [],
        selectedCardNumber: 0,
        playedCardsCount: 0,
      },
      applyElementEffects: jest.fn(),
      playerTurnSwitch: jest.fn(),
    };

    mockTransition = jest.fn();
  });

  test("constructor stores controller, transition, and creates view/resolutionController/resolutionView", () => {
    const model = new PlacementModel(mockController, mockTransition);
    expect(model.controller).toBe(mockController);
    expect(model.transition).toBe(mockTransition);
    expect(model.view).toBeDefined();
    expect(model.resolutionController).toBeDefined();
    expect(model.resolutionView).toBeDefined();
    expect(model.playerModel).toBe(mockController.playerModel);
  });

  describe("placeCardOnBoard", () => {
    test("returns warning when no card is selected", () => {
      const model = new PlacementModel(mockController, mockTransition);
      model.playerModel.hand = [];
      model.playerModel.selectedCardNumber = 0;

      const result = model.placeCardOnBoard();
      expect(result).toBeUndefined();
    });

    test("returns false and warns when target cell is occupied", () => {
      const model = new PlacementModel(mockController, mockTransition);
      model.playerModel.hand = [{ data: { id: 1 } }];
      model.playerModel.selectedCardNumber = 0;
      BoardModel.cellOccupied = jest.fn().mockReturnValue(true);

      const result = model.placeCardOnBoard();
      expect(result).toBe(false);
    });

    test("places the card on the board when valid", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const selectedCard = {
        data: { id: 1, element: 0 },
        element: 0,
        owner: "player",
        visuals: {
          container: {
            /** Get bounding box */
            getBounds: () => ({ width: 100, height: 100 }),
          },
        },
      };
      model.playerModel.hand = [selectedCard];
      model.playerModel.selectedCardNumber = 0;
      // Mock placeCard on the model
      model.placeCard = jest.fn();

      model.placeCardOnBoard();
      // The card was spliced from hand
      expect(model.playerModel.hand).toEqual([]);
      expect(model.placeCard).toHaveBeenCalled();
      expect(Game.controllers.cursorController.grid.remove).toHaveBeenCalled();
    });
  });

  describe("placeCard", () => {
    test("returns early when card has no visuals container", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = { data: { id: 1 } };
      model.placeCard(card, 0, 0);
      // No exception thrown
    });

    test("increments playedCardsCount when player places card", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {
        data: { id: 1, element: 0 },
        element: 0,
        owner: "player",
        visuals: {
          container: {
            /** Get bounding box */
            getBounds: () => ({ width: 100, height: 100 }),
            children: [],
            x: 0,
            y: 0,
          },
        },
      };
      model.playerModel.playedCardsCount = 0;
      // Mock the view's moveCardOffscreen to invoke callback synchronously
      model.view.moveCardOffscreen = jest.fn(
        (card, callback) => callback && callback(card),
      );
      model.view.shiftHandCardsDown = jest.fn();
      model.onCardOffscreenComplete = jest.fn();

      model.placeCard(card, 100, 200);
      expect(model.playerModel.playedCardsCount).toBe(1);
    });

    test("returns when target cell is already occupied", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {
        data: { id: 1, element: 0 },
        element: 0,
        owner: "player",
        visuals: {
          container: {
            /** Get bounding box */
            getBounds: () => ({ width: 100, height: 100 }),
            children: [],
            x: 0,
            y: 0,
          },
        },
      };
      const spyShift = jest.spyOn(model.view, "shiftHandCardsDown");
      // Make board already occupied
      BoardModel.boardArray[4].occupant = { data: { id: 99 } };

      model.placeCard(card, 100, 200);
      // shiftHandCardsDown was not called since we returned early
      expect(spyShift).not.toHaveBeenCalled();
      spyShift.mockRestore();
    });

    test("flips the AI card if owner is ai and open rule is not in rules", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const backBitmap = { name: "backBitmap", visible: true };
      const colourBitmap = { name: "colourBitmap", visible: false };
      const faceBitmap = { name: "faceBitmap", visible: false };
      const card = {
        data: { id: 1, element: 0 },
        element: 0,
        owner: "ai",
        visuals: {
          container: {
            /** Get bounding box */
            getBounds: () => ({ width: 100, height: 100 }),
            children: {
              /** Find child by predicate */
              find: (function_) => {
                const list = [backBitmap, colourBitmap, faceBitmap];
                // eslint-disable-next-line unicorn/no-array-callback-reference
                return list.find(function_);
              },
            },
            x: 0,
            y: 0,
          },
        },
      };
      // Make the view's moveCardOffscreen invoke callback synchronously
      model.view.moveCardOffscreen = jest.fn((c, callback) => callback(c));
      model.view.shiftHandCardsDown = jest.fn();
      model.onCardOffscreenComplete = jest.fn();

      // Default rules don't include "open"
      Game.rules = ["elemental"];

      model.placeCard(card, 100, 200);
      expect(backBitmap.visible).toBe(false);
      expect(colourBitmap.visible).toBe(true);
      expect(faceBitmap.visible).toBe(true);
    });

    test("does not flip AI card if open rule is in rules", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const backBitmap = { name: "backBitmap", visible: true };
      const card = {
        data: { id: 1, element: 0 },
        element: 0,
        owner: "ai",
        visuals: {
          container: {
            /** Get bounding box */
            getBounds: () => ({ width: 100, height: 100 }),
            children: {
              /** Find child by name */
              find: () => backBitmap,
            },
            x: 0,
            y: 0,
          },
        },
      };
      model.view.moveCardOffscreen = jest.fn((c, callback) => callback(c));
      model.view.shiftHandCardsDown = jest.fn();
      model.onCardOffscreenComplete = jest.fn();
      Game.rules = ["open"];

      model.placeCard(card, 100, 200);
      // visibility should not have been changed
      expect(backBitmap.visible).toBe(true);
    });
  });

  describe("setCardAdjacents", () => {
    test("sets all four direction adjacents", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {};
      BoardModel.getOccupant = jest.fn((index) => ({
        id: `occupant-${index}`,
      }));
      BoardModel.squareLeft = 4;
      BoardModel.squareUp = 2;
      BoardModel.squareRight = 6;
      BoardModel.squareDown = 8;

      model.setCardAdjacents(card);
      expect(card.cardLeft).toEqual({ id: "occupant-3" });
      expect(card.cardUp).toEqual({ id: "occupant-1" });
      expect(card.cardRight).toEqual({ id: "occupant-5" });
      expect(card.cardDown).toEqual({ id: "occupant-7" });
    });

    test("sets adjacency to undefined for 'none' squares", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {};
      BoardModel.squareLeft = "none";
      BoardModel.squareUp = "none";
      BoardModel.squareRight = "none";
      BoardModel.squareDown = "none";

      model.setCardAdjacents(card);
      expect(card.cardLeft).toBeUndefined();
      expect(card.cardUp).toBeUndefined();
      expect(card.cardRight).toBeUndefined();
      expect(card.cardDown).toBeUndefined();
    });
  });

  describe("addCardToBoard", () => {
    test("adds card to board and removes from freeCells", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const container = {
        /** Get bounding box */
        getBounds: () => ({ width: 100, height: 200 }),
        scaleX: 0,
        scaleY: 0,
        x: 0,
        y: 0,
      };
      const card = { visuals: { container } };
      BoardModel.freeCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      model.addCardToBoard(card, 5);
      expect(card.inCell).toBe(5);
      expect(BoardModel.boardArray[4].occupant).toBe(card);
      expect(BoardModel.freeCells).not.toContain(5);
      expect(BoardModel.lastPlacedSquare).toBe(5);
    });

    test("does not add container to boardContainer if already there", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const container = {
        /** Get bounding box */
        getBounds: () => ({ width: 100, height: 200 }),
        x: 0,
        y: 0,
      };
      const card = { visuals: { container } };
      BoardModel.boardContainer.contains = jest.fn().mockReturnValue(true);

      model.addCardToBoard(card, 1);
      expect(BoardModel.boardContainer.addChild).not.toHaveBeenCalled();
    });
  });

  describe("applyElementEffects", () => {
    test("returns modified: false when no squareElement", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {
        element: 1,
        data: {
          strength: { left: 1, up: 1, right: 1, down: 1 },
        },
      };
      const result = model.applyElementEffects(card, 0);
      expect(result).toEqual({ modified: false });
    });

    test("returns modified: true with plus_one image when matching element", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {
        element: 1,
        data: { strength: { left: 1, up: 1, right: 1, down: 1 } },
      };
      const result = model.applyElementEffects(card, 1);
      expect(result.modified).toBe(true);
      expect(result.image).toContain("plus_one");
      expect(card.data.strength.left).toBe(2);
      expect(card.data.strength.up).toBe(2);
      expect(card.data.strength.right).toBe(2);
      expect(card.data.strength.down).toBe(2);
    });

    test("returns modified: true with minus_one image when not matching element", () => {
      const model = new PlacementModel(mockController, mockTransition);
      const card = {
        element: 1,
        data: { strength: { left: 5, up: 5, right: 5, down: 5 } },
      };
      const result = model.applyElementEffects(card, 2);
      expect(result.modified).toBe(true);
      expect(result.image).toContain("minus_one");
      expect(card.data.strength.left).toBe(4);
      expect(card.data.strength.up).toBe(4);
      expect(card.data.strength.right).toBe(4);
      expect(card.data.strength.down).toBe(4);
    });
  });

  describe("onCardOffscreenComplete", () => {
    test("calls view.moveCardToBoard with the card and coords", () => {
      const model = new PlacementModel(mockController, mockTransition);
      model.view.moveCardToBoard = jest.fn();
      model.onCardOffscreenComplete({ id: "x" }, 100, 200);
      expect(model.view.moveCardToBoard).toHaveBeenCalled();
    });
  });
});
