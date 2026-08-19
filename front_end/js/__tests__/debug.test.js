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

  test("logCell logs details for an occupied cell", () => {
    const card = {
      owner: "player",
      data: {
        name: "Test Card",
        element: 2,
        strength: { left: 1, up: 2, right: 3, down: 4 },
      },
      cardLeft: { name: "Left" },
      cardUp: undefined,
      cardRight: { data: { name: "Right" } },
      cardDown: undefined,
    };
    BoardModel.squares = [{ element: 1 }];
    BoardModel.boardArray = [{ occupant: card }];

    debug.logCell({ id: 1 });

    expect(console.log).toHaveBeenCalledWith("Card Present:");
    expect(console.log).toHaveBeenCalledWith("  Owner: player");
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

  test("logHands and logTurn log both players and current score", () => {
    Game.models = {
      playerModel: {
        hand: [{ data: { name: "Player Card", element: 1 }, owner: "player" }],
        totalBlueCards: 3,
      },
      aiTurnModel: {
        hand: [{ data: { name: "AI Card", element: 2 }, owner: "ai" }],
        currentlyOwnedCards: 2,
      },
    };
    BoardModel.freeCells = [1, 2, 3];

    debug.logHands();
    debug.logTurn();

    expect(console.log).toHaveBeenCalledWith(
      "Card 0: Player Card | Owner: player | Element: 1",
    );
    expect(console.log).toHaveBeenCalledWith(
      "Card 0: AI Card | Owner: ai | Element: 2",
    );
    expect(console.log).toHaveBeenCalledWith("SCORE | Player: 3 AI: 2");
  });

  test("logFullState handles missing Game state", () => {
    Game.models = {};
    expect(() => debug.logFullState("test")).toThrow();
  });

  test("logFullState delegates to board, hand, and turn loggers", () => {
    const boardSpy = jest.spyOn(debug, "logBoard").mockImplementation(() => {});
    const handsSpy = jest.spyOn(debug, "logHands").mockImplementation(() => {});
    const turnSpy = jest.spyOn(debug, "logTurn").mockImplementation(() => {});

    debug.logFullState("board click");

    expect(boardSpy).toHaveBeenCalled();
    expect(handsSpy).toHaveBeenCalled();
    expect(turnSpy).toHaveBeenCalled();
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
