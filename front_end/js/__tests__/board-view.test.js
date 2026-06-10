/**
 * @module board-view
 * @description Unit tests for the BoardView module.
 */

import { jest } from "@jest/globals";
import { BoardView } from "../shared/board/board-view.js";
import { BoardModel } from "../shared/board/board-model.js";
import { Game } from "../shared/game/game.js";

describe("BoardView", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Game.stage = {
      update: jest.fn(),
      addChild: jest.fn(),
      removeChild: jest.fn(),
    };

    BoardModel.boardContainer = {
      removeAllChildren: jest.fn(),
      addChild: jest.fn(),
    };

    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: undefined,
    }));
    BoardModel.squares = [];
  });

  test("generateGrid creates 9 squares and populates boardArray", () => {
    BoardView.generateGrid();

    expect(BoardModel.squares).toHaveLength(9);
    for (let index = 0; index < 9; index++) {
      expect(BoardModel.boardArray[index].element).toBeDefined();
    }
  });

  test("generateGrid resets the boardContainer", () => {
    BoardView.generateGrid();
    expect(BoardModel.boardContainer.removeAllChildren).toHaveBeenCalled();
  });

  test("generateGrid updates the stage", () => {
    BoardView.generateGrid();
    expect(Game.stage.update).toHaveBeenCalled();
  });

  test("redrawSquare does nothing for invalid squareID", () => {
    BoardModel.squares = [];
    expect(() => BoardView.redrawSquare(99)).not.toThrow();
  });

  test("redrawSquare with valid squareID and no element removes graphic", () => {
    const container = {
      contains: jest.fn().mockReturnValue(true),
      removeChild: jest.fn(),
      addChild: jest.fn(),
    };
    BoardModel.squares = [{ id: 1, container, elementGraphic: { name: "x" } }];
    BoardView.redrawSquare(1);
    expect(container.removeChild).toHaveBeenCalled();
  });

  test("clearBoard removes all squares from stage", () => {
    const container1 = { parent: true, remove: jest.fn() };
    const container2 = { parent: true, remove: jest.fn() };
    BoardModel.squares = [
      { id: 1, container: container1 },
      { id: 2, container: container2 },
    ];

    BoardView.clearBoard();

    expect(container1.remove).toHaveBeenCalled();
    expect(container2.remove).toHaveBeenCalled();
    expect(BoardModel.squares).toEqual([]);
  });

  test("clearBoard handles squares with no parent", () => {
    BoardModel.squares = [
      { id: 1, container: { parent: false, remove: jest.fn() } },
    ];
    expect(() => BoardView.clearBoard()).not.toThrow();
  });
});
