/**
 * @module debug
 * @description Unit tests for the debug utility module.
 */

import { jest } from "@jest/globals";
import { debug } from "../utilities/debug.js";
import { BoardModel } from "../shared/board/board-model.js";
import { Game } from "../shared/game/game.js";

describe("debug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("has an active flag that defaults to true", () => {
    expect(debug.active).toBe(true);
  });

  test("logCell does not throw when BoardModel.squares is empty and event has name", () => {
    BoardModel.squares = [];
    expect(() => debug.logCell({ name: 1 })).not.toThrow();
  });

  test("logCell throws when eventOrSquare has no name or id (squareID becomes undefined)", () => {
    BoardModel.squares = [];
    // When eventOrSquare has no name or id, squareID is undefined,
    // which leads to accessing BoardModel.squares[NaN], causing a TypeError
    expect(() => debug.logCell({})).toThrow();
  });

  test("logBoard does not throw when boardArray is populated", () => {
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    expect(() => debug.logBoard()).not.toThrow();
  });

  test("logBoard handles cells with occupant", () => {
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: {
        owner: "player",
        data: {
          name: "TestCard",
          element: undefined,
          strength: { left: 1, up: 2, right: 3, down: 4 },
          cardLeft: undefined,
          cardUp: undefined,
          cardRight: undefined,
          cardDown: undefined,
        },
      },
    }));
    expect(() => debug.logBoard()).not.toThrow();
  });

  test("logTurn handles missing Game.models", () => {
    Game.models = {};
    expect(() => debug.logTurn()).toThrow();
  });

  test("logFullState handles missing Game state", () => {
    Game.models = {};
    expect(() => debug.logFullState("test")).toThrow();
  });

  test("clickHandler calls logFullState when active is true", () => {
    const logSpy = jest
      .spyOn(debug, "logFullState")
      .mockImplementation(() => {});
    debug.active = true;
    debug.clickHandler({ currentTarget: "test" });
    expect(logSpy).toHaveBeenCalledWith("test");
    logSpy.mockRestore();
  });

  test("clickHandler does nothing when active is false", () => {
    const logSpy = jest
      .spyOn(debug, "logFullState")
      .mockImplementation(() => {});
    debug.active = false;
    debug.clickHandler({ currentTarget: "test" });
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
