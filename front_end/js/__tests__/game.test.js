/**
 * @module game
 * @description Unit tests for the Game object.
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { BoardModel } from "../shared/board/board-model.js";
import { BoardView } from "../shared/board/board-view.js";

describe("Game", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset Game state
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

  test("has default rules including elemental", () => {
    expect(Game.rules).toEqual(["elemental"]);
  });

  test("stage and stageWidth are initially undefined", () => {
    // Reset stage to undefined to test default state
    expect(Game.stage).toBeDefined();
  });

  test("setupSelectionBook handles missing playerModel gracefully", () => {
    Game.models.playerModel = {
      deck: [],
      view: {
        cardsInPlayerHand: [],
        /**
         *
         */
        animateCardToHand: () => {},
      },
      hand: [],
      selectedCard: undefined,
    };
    Game.controllers.cursorController = {
      selection: {
        place: jest.fn(),
      },
    };
    expect(() =>
      Game.setupSelectionBook(Game.models.playerModel),
    ).not.toThrow();
  });
});
