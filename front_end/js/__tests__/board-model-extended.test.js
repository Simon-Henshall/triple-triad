/**
 * @module board-model-extended
 * @description Extended unit tests for the BoardModel functions.
 */

import { BoardModel } from "../shared/board/board-model.js";

describe("BoardModel extended", () => {
  beforeEach(() => {
    BoardModel.resetBoard();
  });

  test("resetBoard clears all cells and restores freeCells", () => {
    BoardModel.boardArray[0].occupant = { id: "card1" };
    BoardModel.boardArray[0].element = 5;
    BoardModel.freeCells = [1, 2, 3];

    BoardModel.resetBoard();

    expect(BoardModel.boardArray[0].occupant).toBeUndefined();
    expect(BoardModel.boardArray[0].element).toBe(0);
    expect(BoardModel.freeCells).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("isGameOver returns false when board is empty", () => {
    expect(BoardModel.isGameOver()).toBe(false);
  });

  test("isGameOver returns true when board is full", () => {
    BoardModel.boardArray = Array.from({ length: 9 }).map(() => ({
      element: 0,
      occupant: { id: "card" },
    }));
    expect(BoardModel.isGameOver()).toBe(true);
  });

  test("cellOccupied returns false for empty cell", () => {
    expect(BoardModel.cellOccupied(0)).toBe(false);
  });

  test("cellOccupied returns true for occupied cell", () => {
    BoardModel.boardArray[4].occupant = { id: "card" };
    expect(BoardModel.cellOccupied(4)).toBe(true);
  });

  test("getOccupant returns card or undefined", () => {
    BoardModel.boardArray[3].occupant = { id: "card" };
    expect(BoardModel.getOccupant(3)).toEqual({ id: "card" });
    expect(BoardModel.getOccupant(0)).toBeUndefined();
  });

  test("updateUISelection updates row, col, and adjacency", () => {
    BoardModel.updateUISelection(5);
    expect(BoardModel.selectedSquare).toBe(5);
    expect(BoardModel.selectedRow).toBe(2);
    expect(BoardModel.selectedColumn).toBe(2);
    expect(BoardModel.squareLeft).toBe(4);
    expect(BoardModel.squareUp).toBe(2);
    expect(BoardModel.squareRight).toBe(6);
    expect(BoardModel.squareDown).toBe(8);
  });

  test("updateUISelection handles corners (1 and 9)", () => {
    BoardModel.updateUISelection(1);
    expect(BoardModel.selectedSquare).toBe(1);
    expect(BoardModel.selectedRow).toBe(1);
    expect(BoardModel.selectedColumn).toBe(1);
    expect(BoardModel.squareLeft).toBe("none");
    expect(BoardModel.squareUp).toBe("none");
    expect(BoardModel.squareRight).toBe(2);
    expect(BoardModel.squareDown).toBe(4);

    BoardModel.updateUISelection(9);
    expect(BoardModel.selectedRow).toBe(3);
    expect(BoardModel.selectedColumn).toBe(3);
    expect(BoardModel.squareLeft).toBe(8);
    expect(BoardModel.squareUp).toBe(6);
    expect(BoardModel.squareRight).toBe("none");
    expect(BoardModel.squareDown).toBe("none");
  });

  test("generateElements returns an array of 9 elements", () => {
    const elements = BoardModel.generateElements();
    expect(elements).toHaveLength(9);
  });

  test("generateElements has between 1 and 3 non-zero elements", () => {
    for (let index = 0; index < 20; index++) {
      const elements = BoardModel.generateElements();
      const nonZero = elements.filter((element) => element !== 0).length;
      expect(nonZero).toBeGreaterThanOrEqual(1);
      expect(nonZero).toBeLessThanOrEqual(3);
    }
  });

  test("squareMap has 9 entries with row/col/adjacency", () => {
    expect(BoardModel.squareMap).toHaveLength(9);
    for (const square of BoardModel.squareMap) {
      expect(square).toHaveProperty("row");
      expect(square).toHaveProperty("col");
      expect(square).toHaveProperty("left");
      expect(square).toHaveProperty("up");
      expect(square).toHaveProperty("right");
      expect(square).toHaveProperty("down");
    }
  });
});
