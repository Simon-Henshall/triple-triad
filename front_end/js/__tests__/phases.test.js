/**
 * @module phases
 * @description Unit tests for the phases module.
 */

import phases, { PhaseChecker } from "../game/phases.js";

/**
 * A mock transition function for testing phase factories.
 */
const transition = () => {};

describe("PhaseChecker", () => {
  test("initial state is all false", () => {
    expect(PhaseChecker.playerSelectingHand).toBe(false);
    expect(PhaseChecker.playerConfirming).toBe(false);
    expect(PhaseChecker.playerChoosingCard).toBe(false);
    expect(PhaseChecker.playerSelectingPlacement).toBe(false);
  });

  test("can set each flag independently", () => {
    PhaseChecker.playerSelectingHand = true;
    expect(PhaseChecker.playerSelectingHand).toBe(true);
    expect(PhaseChecker.playerConfirming).toBe(false);

    PhaseChecker.playerConfirming = true;
    expect(PhaseChecker.playerConfirming).toBe(true);

    PhaseChecker.playerChoosingCard = true;
    expect(PhaseChecker.playerChoosingCard).toBe(true);

    PhaseChecker.playerSelectingPlacement = true;
    expect(PhaseChecker.playerSelectingPlacement).toBe(true);
  });

  test("can reset flags to false", () => {
    PhaseChecker.playerSelectingHand = true;
    PhaseChecker.playerConfirming = true;
    PhaseChecker.playerChoosingCard = true;
    PhaseChecker.playerSelectingPlacement = true;

    PhaseChecker.playerSelectingHand = false;
    PhaseChecker.playerConfirming = false;
    PhaseChecker.playerChoosingCard = false;
    PhaseChecker.playerSelectingPlacement = false;

    expect(PhaseChecker.playerSelectingHand).toBe(false);
    expect(PhaseChecker.playerConfirming).toBe(false);
    expect(PhaseChecker.playerChoosingCard).toBe(false);
    expect(PhaseChecker.playerSelectingPlacement).toBe(false);
  });
});

describe("phases registry", () => {
  test("has all required phase keys", () => {
    const expectedPhases = [
      "deck-selection",
      "confirmation",
      "hand-select",
      "placement",
      "resolution",
      "end-turn",
      "ai-turn",
      "game-over",
    ];
    for (const phaseName of expectedPhases) {
      expect(phases).toHaveProperty(phaseName);
    }
  });

  test("each phase has deps and factory functions", () => {
    const expectedPhases = [
      "deck-selection",
      "confirmation",
      "hand-select",
      "placement",
      "resolution",
      "end-turn",
      "ai-turn",
      "game-over",
    ];
    for (const phaseName of expectedPhases) {
      expect(phases[phaseName]).toHaveProperty("deps");
      expect(phases[phaseName]).toHaveProperty("factory");
      expect(typeof phases[phaseName].deps).toBe("function");
      expect(typeof phases[phaseName].factory).toBe("function");
    }
  });

  test("deps returns an object", () => {
    const rootDeps = {
      playerDeck: [],
      playerModel: {},
      selectionUI: {},
      cursorController: {},
    };
    const deps = phases["deck-selection"].deps(rootDeps);
    expect(deps).toBeInstanceOf(Object);
    expect(deps).toHaveProperty("deck");
    expect(deps).toHaveProperty("playerModel");
  });

  test("factory returns an instance", () => {
    const instance = phases["deck-selection"].factory({}, () => {});
    expect(instance).toBeDefined();
  });

  test("placement phase deps includes payload fields", () => {
    const rootDeps = {
      boardModel: {},
      boardView: {},
      cardFactory: {},
      placementView: {},
      playerModel: {},
      aiModel: {},
      cursorController: {},
    };
    const payload = {
      selectedCard: { id: 1 },
      selectedSquare: 5,
    };
    const deps = phases.placement.deps(rootDeps, payload);
    expect(deps.selectedCard).toEqual({ id: 1 });
    expect(deps.selectedSquare).toBe(5);
  });

  test("every phase factory can be called without error except confirmation (object not class)", () => {
    /**
     * Helper function to test that a phase factory can be instantiated without throwing an error. The confirmation phase is an object literal, so we expect it to throw if we try to instantiate it with `new`.
     * @param {string} phaseName - The name of the phase to test.
     */
    const phaseNames = Object.keys(phases);
    for (const name of phaseNames) {
      if (name === "confirmation") {
        // ConfirmationController is an object literal, not a class, so `new` fails
        expect(() => phases[name].factory({}, transition)).toThrow();
      } else {
        expect(() => phases[name].factory({}, transition)).not.toThrow();
      }
    }
  });

  test("resolution phase deps includes scoreboard and boardModel", () => {
    const rootDeps = {
      boardModel: { boardArray: [] },
      resolutionView: {},
      scoreboard: {
        /**
         * Mock implementation of update for testing. In a real test, this would be more complex and might involve checking calls to this method.
         * @param {object} changes - The changes to update the scoreboard with.
         */
        update: () => {},
      },
    };
    const deps = phases.resolution.deps(rootDeps, {
      lastPlacement: { card: {}, square: 5 },
    });
    expect(deps.boardModel).toBe(rootDeps.boardModel);
    expect(deps.scoreboard).toBe(rootDeps.scoreboard);
    expect(deps.lastPlacement).toBeDefined();
  });

  test("game-over phase deps includes all expected fields", () => {
    const rootDeps = {
      playerModel: {},
      aiTurnModel: {},
      gameOverUI: {},
      scoreboard: {},
      boardModel: {},
    };
    const deps = phases["game-over"].deps(rootDeps, { result: "win" });
    expect(deps.result).toBe("win");
    expect(deps.playerModel).toBe(rootDeps.playerModel);
    expect(deps.ui).toBe(rootDeps.gameOverUI);
  });
});
