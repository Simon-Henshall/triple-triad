/**
 * @module state-machine-extended
 * @description Extended unit tests for the StateMachine class.
 */

import { jest } from "@jest/globals";
import StateMachine from "../game/game-state-machine.js";

describe("StateMachine extended", () => {
  test("getCurrentPhaseName returns current phase name", async () => {
    const sm = new StateMachine(
      {
        phase1: {
          deps: () => ({}),
          factory: () => ({ activate: jest.fn(), deactivate: jest.fn() }),
        },
      },
      { allowedTransitions: { phase1: ["phase1"] } },
    );
    expect(sm.getCurrentPhaseName()).toBeUndefined();
    await sm.transitionTo("phase1");
    expect(sm.getCurrentPhaseName()).toBe("phase1");
  });

  test("getCurrentPhase returns current phase instance", async () => {
    const instance = { activate: jest.fn(), deactivate: jest.fn() };
    const sm = new StateMachine(
      {
        phase1: {
          deps: () => ({}),
          factory: () => instance,
        },
      },
      {},
    );
    expect(sm.getCurrentPhase()).toBeUndefined();
    await sm.transitionTo("phase1");
    expect(sm.getCurrentPhase()).toBe(instance);
  });

  test("canTransitionTo allows transition if no allowedTransitions list", () => {
    const sm = new StateMachine(
      {
        a: { deps: () => ({}), factory: () => ({ activate: jest.fn() }) },
        b: { deps: () => ({}), factory: () => ({ activate: jest.fn() }) },
      },
      {},
    );
    // No allowedTransitions entries for a, so any transition is allowed
    expect(sm.canTransitionTo("b")).toBe(true);
  });

  test("canTransitionTo denies unknown phase", () => {
    const sm = new StateMachine(
      { a: { deps: () => ({}), factory: () => ({}) } },
      {},
    );
    expect(sm.canTransitionTo("unknown")).toBe(false);
  });

  test("phase transition function from factory calls state machine", async () => {
    let transitionFn;
    const sm = new StateMachine(
      {
        phase1: {
          deps: () => ({}),
          factory: (deps, transition) => {
            transitionFn = transition;
            return { activate: jest.fn(), deactivate: jest.fn() };
          },
        },
        phase2: {
          deps: () => ({}),
          factory: () => ({ activate: jest.fn(), deactivate: jest.fn() }),
        },
      },
      { allowedTransitions: { phase1: ["phase2"] } },
    );

    await sm.transitionTo("phase1");
    await transitionFn("phase2", { foo: 1 });
    expect(sm.getCurrentPhaseName()).toBe("phase2");
  });

  test("onChange unsubscribe stops listener", async () => {
    const sm = new StateMachine(
      {
        a: { deps: () => ({}), factory: () => ({ activate: jest.fn() }) },
      },
      {},
    );
    const listener = jest.fn();
    const unsub = sm.onChange(listener);
    await sm.transitionTo("a");
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    await sm.transitionTo("a");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("shutdown clears state and listeners", async () => {
    const sm = new StateMachine(
      {
        a: { deps: () => ({}), factory: () => ({ activate: jest.fn() }) },
      },
      {},
    );
    sm.onChange(jest.fn());
    await sm.transitionTo("a");
    await sm.shutdown();
    expect(sm.currentPhase).toBeUndefined();
    expect(sm.currentPhaseName).toBeUndefined();
  });
});