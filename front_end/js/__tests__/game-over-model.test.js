/**
 * @module game-over-model
 * @description Unit tests for the GameOverModel class.
 */

import { jest } from "@jest/globals";
import GameOverModel from "../phases/game-over/game-over-model.js";

describe("GameOverModel", () => {
  test("constructor stores dependencies", () => {
    const playerModel = { totalBlueCards: 5 };
    const aiTurnModel = { currentlyOwnedCards: 3 };
    const model = new GameOverModel({ playerModel, aiTurnModel });

    expect(model.playerModel).toBe(playerModel);
    expect(model.aiTurnModel).toBe(aiTurnModel);
  });

  test("constructor accepts empty deps", () => {
    const model = new GameOverModel();
    expect(model.playerModel).toBeUndefined();
    expect(model.aiTurnModel).toBeUndefined();
  });

  test("determineOutcome returns win when player has more cards", () => {
    const model = new GameOverModel({
      playerModel: { totalBlueCards: 5 },
      aiTurnModel: { currentlyOwnedCards: 3 },
    });
    expect(model.determineOutcome()).toBe("win");
  });

  test("determineOutcome returns lose when AI has more cards", () => {
    const model = new GameOverModel({
      playerModel: { totalBlueCards: 3 },
      aiTurnModel: { currentlyOwnedCards: 5 },
    });
    expect(model.determineOutcome()).toBe("lose");
  });

  test("determineOutcome returns draw when both have equal cards", () => {
    const model = new GameOverModel({
      playerModel: { totalBlueCards: 5 },
      aiTurnModel: { currentlyOwnedCards: 5 },
    });
    expect(model.determineOutcome()).toBe("draw");
  });

  test("determineOutcome returns draw when models are missing", () => {
    const model = new GameOverModel();
    expect(model.determineOutcome()).toBe("draw");
  });

  test("getCardCounts returns the card counts", () => {
    const model = new GameOverModel({
      playerModel: { totalBlueCards: 5 },
      aiTurnModel: { currentlyOwnedCards: 3 },
    });
    expect(model.getCardCounts()).toEqual({ aiCards: 3, playerCards: 5 });
  });

  test("getCardCounts returns zeros when models are missing", () => {
    const model = new GameOverModel();
    expect(model.getCardCounts()).toEqual({ aiCards: 0, playerCards: 0 });
  });
});