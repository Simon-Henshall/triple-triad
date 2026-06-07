/**
 * @module turn
 * @description Unit tests for {@link module:../utilities/turn} turn functions
 * ({@link getPlayerTurn} and {@link swapPlayerTurn}) that depend on the
 * internal `playerTurn` state of {@link module:../game/phases}.PhaseChecker.
 */

/** @type {Function | undefined} */
let getPlayerTurn;

/** @type {Function | undefined} */
let swapPlayerTurn;

/** @type {import("../game/phases.js").PhaseChecker | undefined} */
let PhaseChecker;

/**
 * Dynamically imports the turn and phase modules after setting up a minimal
 * global `createjs` mock so that any transitive references to createjs do not
 * throw during import.
 */
beforeAll(async () => {
  // minimal createjs mock so imports that reference createjs don't throw
  globalThis.createjs = { Container: class {}, Bitmap: class {} };
  const turn = await import("../utilities/turn.js");
  const phases = await import("../game/phases.js");
  getPlayerTurn = turn.getPlayerTurn;
  swapPlayerTurn = turn.swapPlayerTurn;
  PhaseChecker = phases.PhaseChecker;
});

/**
 * Resets `PhaseChecker.playerTurn` to `undefined` before each test to ensure
 * test isolation.
 */
beforeEach(() => {
  PhaseChecker.playerTurn = undefined;
});

/**
 * Verifies that {@link getPlayerTurn} returns `"blue"` when
 * `PhaseChecker.playerTurn` is `undefined`.
 */
test("getPlayerTurn defaults to blue when unset", () => {
  expect(getPlayerTurn()).toBe("blue");
});

/**
 * Verifies that {@link swapPlayerTurn} toggles the `PhaseChecker.playerTurn`
 * value between `"blue"` and `"red"`.
 *
 * - Sets `playerTurn` to `"blue"`, calls `swapPlayerTurn`, and expects `"red"`.
 * - Calls `swapPlayerTurn` again and expects `"blue"`.
 */
test("swapPlayerTurn toggles between blue and red", () => {
  PhaseChecker.playerTurn = "blue";
  swapPlayerTurn();
  expect(PhaseChecker.playerTurn).toBe("red");
  swapPlayerTurn();
  expect(PhaseChecker.playerTurn).toBe("blue");
});
