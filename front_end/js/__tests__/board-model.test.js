/**
 * @typedef {import("../shared/board/board-model.js").BoardModel} BoardModelType
 */

/** @type {BoardModelType | null} */
let BoardModel;

/**
 * Global mock for createjs – provides minimal stubs for Container and Bitmap
 * so that importing {@link module:../shared/board/board-model} does not throw.
 *
 * @global
 * @type {object}
 * @property {typeof Container} Container
 * @property {typeof Bitmap}    Bitmap
 */
beforeAll(async () => {
  // Minimal createjs mock so modules that instantiate containers/bitmaps don't throw
  globalThis.createjs = {
    Container: class Container {
      /** Creates a new mock Container instance. */
      constructor() {}

      /**
       * Mock for addChild – no-op.
       *
       * @param {*} child The child to add (ignored).
       */
      addChild() {}

      /**
       * Returns a new empty {@link Container} instance.
       *
       * @returns {Container} A cloned Container.
       */
      clone() {
        return new Container();
      }
    },
    Bitmap: class Bitmap {
      /**
       * Creates a mock Bitmap instance with a pre-set image stub so that
       * `.complete`, `.width`, `.height`, `.naturalWidth` are all valid.
       */
      constructor() {
        this.image = { complete: true, width: 1, height: 1, naturalWidth: 1 };
      }
    },
  };

  const module_ = await import("../shared/board/board-model.js");
  BoardModel = module_.BoardModel;
});

/**
 * Reset the board model before each test to ensure test isolation.
 */
beforeEach(() => {
  BoardModel.resetBoard();
});

/**
 * Verifies that {@link BoardModel.cellOccupied} and
 * {@link BoardModel.getOccupant} correctly reflect the occupant state of a
 * cell.
 */
test("cellOccupied and getOccupant", () => {
  const occupant = { id: "a" };
  BoardModel.boardArray[0].occupant = occupant;

  expect(BoardModel.cellOccupied(0)).toBe(true);
  expect(BoardModel.getOccupant(0)).toBe(occupant);
});

/**
 * Verifies that {@link BoardModel.isGameOver} returns `false` when the board
 * is empty and `true` when every cell is occupied.
 */
test("isGameOver false when empty and true when full", () => {
  expect(BoardModel.isGameOver()).toBe(false);

  for (const cell of BoardModel.boardArray) {
    cell.occupant = {};
  }
  expect(BoardModel.isGameOver()).toBe(true);
});

/**
 * Verifies that calling {@link BoardModel.updateUISelection} with an index
 * correctly sets the selected square, row, column, and the four adjacent
 * square indices.
 */
test("updateUISelection sets row/col/adjacency", () => {
  BoardModel.updateUISelection(5);
  expect(BoardModel.selectedSquare).toBe(5);
  expect(BoardModel.selectedRow).toBe(2);
  expect(BoardModel.selectedColumn).toBe(2);
  expect(BoardModel.squareLeft).toBe(4);
  expect(BoardModel.squareUp).toBe(2);
  expect(BoardModel.squareRight).toBe(6);
  expect(BoardModel.squareDown).toBe(8);
});

/**
 * Verifies that {@link BoardModel.generateElements} returns an array of
 * exactly 9 numbers, with between 1 and 3 non-zero values, and that every
 * element is a number.
 */
test("generateElements returns 9 entries with 1-3 non-zero elements", () => {
  const array = BoardModel.generateElements();
  expect(array).toHaveLength(9);
  const nonZero = array.filter((v) => v !== 0);
  expect(nonZero.length).toBeGreaterThanOrEqual(1);
  expect(nonZero.length).toBeLessThanOrEqual(3);
  expect(array.every((n) => typeof n === "number")).toBe(true);
});
