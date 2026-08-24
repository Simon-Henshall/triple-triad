/**
 * @module end-turn-model
 * @description Unit tests for the EndTurnModel class.
 */

import { jest } from "@jest/globals";
import EndTurnModel from "../phases/end-turn/end-turn-model.js";
import { Game } from "../shared/game/game.js";

describe("EndTurnModel", () => {
  test("constructor stores scoreboard", () => {
    const scoreboard = { update: jest.fn() };
    const model = new EndTurnModel({ scoreboard });
    expect(model.scoreboard).toBe(scoreboard);
  });

  test("constructor accepts empty deps", () => {
    const model = new EndTurnModel();
    expect(model.scoreboard).toBeUndefined();
  });

  test("getScoreboard returns the injected scoreboard", () => {
    const scoreboard = { update: jest.fn() };
    const model = new EndTurnModel({ scoreboard });
    expect(model.getScoreboard()).toBe(scoreboard);
  });

  test("getScoreboard falls back to Game.ui.scoreBoard", () => {
    const globalScoreboard = { name: "global" };
    Game.ui = { scoreBoard: globalScoreboard };
    const model = new EndTurnModel();
    expect(model.getScoreboard()).toBe(globalScoreboard);
  });

  test("getScoreboard returns undefined when no scoreboard is available", () => {
    Game.ui = {};
    const model = new EndTurnModel();
    expect(model.getScoreboard()).toBeUndefined();
  });
});
