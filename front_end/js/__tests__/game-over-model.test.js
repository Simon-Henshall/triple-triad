/**
 * @module game-over-model
 * @description Unit tests for the GameOverModel class.
 */

import { jest } from "@jest/globals";
import GameOverModel from "../phases/game-over/game-over-model.js";

describe("GameOverModel", () => {
  let model;
  let mockPlayerModel;
  let mockAiTurnModel;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlayerModel = {
      totalBlueCards: 5,
    };

    mockAiTurnModel = {
      currentlyOwnedCards: 3,
    };

    model = new GameOverModel({
      playerModel: mockPlayerModel,
      aiTurnModel: mockAiTurnModel,
    });
  });

  test("constructor stores playerModel and aiTurnModel", () => {
    expect(model.playerModel).toBe(mockPlayerModel);
    expect(model.aiTurnModel).toBe(mockAiTurnModel);
  });

  test("constructor handles empty dependencies", () => {
    const emptyModel = new GameOverModel();
    expect(emptyModel.playerModel).toBeUndefined();
    expect(emptyModel.aiTurnModel).toBeUndefined();
  });

  test("constructor handles partial dependencies", () => {
    const partialModel = new GameOverModel({ playerModel: mockPlayerModel });
    expect(partialModel.playerModel).toBe(mockPlayerModel);
    expect(partialModel.aiTurnModel).toBeUndefined();
  });

  describe("determineOutcome", () => {
    test("returns 'win' when player has more cards than AI", () => {
      mockPlayerModel.totalBlueCards = 6;
      mockAiTurnModel.currentlyOwnedCards = 3;
      expect(model.determineOutcome()).toBe("win");
    });

    test("returns 'lose' when AI has more cards than player", () => {
      mockPlayerModel.totalBlueCards = 2;
      mockAiTurnModel.currentlyOwnedCards = 5;
      expect(model.determineOutcome()).toBe("lose");
    });

    test("returns 'draw' when both have equal cards", () => {
      mockPlayerModel.totalBlueCards = 5;
      mockAiTurnModel.currentlyOwnedCards = 5;
      expect(model.determineOutcome()).toBe("draw");
    });

    test("returns 'draw' and logs error when playerModel is missing", () => {
      model.playerModel = undefined;
      expect(model.determineOutcome()).toBe("draw");
    });

    test("returns 'draw' and logs error when aiTurnModel is missing", () => {
      model.aiTurnModel = undefined;
      expect(model.determineOutcome()).toBe("draw");
    });

    test("returns 'draw' when both models are missing", () => {
      model.playerModel = undefined;
      model.aiTurnModel = undefined;
      expect(model.determineOutcome()).toBe("draw");
    });
  });

  describe("getCardCounts", () => {
    test("returns correct card counts", () => {
      mockPlayerModel.totalBlueCards = 4;
      mockAiTurnModel.currentlyOwnedCards = 5;
      expect(model.getCardCounts()).toEqual({
        aiCards: 5,
        playerCards: 4,
      });
    });

    test("returns 0 for missing playerModel", () => {
      model.playerModel = undefined;
      expect(model.getCardCounts()).toEqual({
        aiCards: 3,
        playerCards: 0,
      });
    });

    test("returns 0 for missing aiTurnModel", () => {
      model.aiTurnModel = undefined;
      expect(model.getCardCounts()).toEqual({
        aiCards: 0,
        playerCards: 5,
      });
    });

    test("returns 0 for both when both models are missing", () => {
      model.playerModel = undefined;
      model.aiTurnModel = undefined;
      expect(model.getCardCounts()).toEqual({
        aiCards: 0,
        playerCards: 0,
      });
    });
  });
});
