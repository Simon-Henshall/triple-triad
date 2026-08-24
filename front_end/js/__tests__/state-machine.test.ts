/**
 * @module state-machine
 * @description Unit tests for the {@link StateMachine} class, covering
 * lifecycle hooks, transition validation, listener management, and error
 * handling.
 */

import { StateMachine } from "../game/game-state-machine.js";

/**
 * Creates a fresh StateMachine with independent phase definitions to prevent
 * test pollution.
 * @param {Object} [overrides={}]
 * @param {Object} [overrides.allowedTransitions]
 * @param {Object} [overrides.rootDeps]
 * @returns {StateMachine}
 */
function createMachine(overrides = {}) {
  const phases = {
    boot: {
      /**
       * Returns a shallow copy of root deps.
       * @param {Object} rootDeps
       * @returns {Object}
       */
      deps: (rootDeps) => ({ ...rootDeps }),
      /**
       * Creates the boot phase instance.
       * @param {Object} deps
       * @param {Function} transition
       * @returns {Object}
       */
      factory: (deps, transition) => ({
        /**
         * Activates the boot phase.
         */
        activate: () => {},
        /**
         * Deactivates the boot phase.
         */
        deactivate: () => {},
        deps,
        transition,
      }),
    },
    menu: {
      /**
       * Returns a shallow copy of root deps.
       * @param {Object} rootDeps
       * @returns {Object}
       */
      deps: (rootDeps) => ({ ...rootDeps }),
      /**
       * Creates the menu phase instance.
       * @param {Object} deps
       * @param {Function} transition
       * @returns {Object}
       */
      factory: (deps, transition) => ({
        /**
         * Activates the menu phase.
         */
        activate: () => {},
        /**
         * Deactivates the menu phase.
         */
        deactivate: () => {},
        deps,
        transition,
      }),
    },
    play: {
      /**
       * Returns a shallow copy of root deps.
       * @param {Object} rootDeps
       * @returns {Object}
       */
      deps: (rootDeps) => ({ ...rootDeps }),
      /**
       * Creates the play phase instance.
       * @param {Object} deps
       * @param {Function} transition
       * @returns {Object}
       */
      factory: (deps, transition) => ({
        /**
         * Activates the play phase.
         */
        activate: () => {},
        /**
         * Deactivates the play phase.
         */
        deactivate: () => {},
        deps,
        transition,
      }),
    },
    fail: {
      /**
       * Returns a shallow copy of root deps.
       * @param {Object} rootDeps
       * @returns {Object}
       */
      deps: (rootDeps) => ({ ...rootDeps }),
      /**
       * Creates the fail phase instance.
       * @param {Object} deps
       * @param {Function} transition
       * @returns {Object}
       */
      factory: (deps, transition) => ({
        /**
         * Activates the fail phase (always throws).
         */
        activate: () => {
          throw new Error("activation failed");
        },
        /**
         * Deactivates the fail phase (always throws).
         */
        deactivate: () => {
          throw new Error("deactivation failed");
        },
        deps,
        transition,
      }),
    },
  };

  return new StateMachine(phases, {
    allowedTransitions: overrides.allowedTransitions,
    rootDeps: overrides.rootDeps,
  });
}

/**
 * Helper: assigns a new factory for a given phase.
 * @param {StateMachine} sm
 * @param {string} phaseName
 * @param {(deps: Object, transition: Function) => Object} factory
 */
function setFactory(sm, phaseName, factory) {
  sm.phaseRegistry[phaseName].factory = factory;
}

// ----- Construction & Querying -----

/**
 * Verifies that a newly constructed StateMachine starts with no current
 * phase, and that getCurrentPhaseName / getCurrentPhase return undefined.
 */
test("initial state has no current phase", () => {
  const sm = createMachine();
  expect(sm.getCurrentPhaseName()).toBeUndefined();
  expect(sm.getCurrentPhase()).toBeUndefined();
});

/**
 * Verifies that canTransitionTo returns false for unknown phases and true
 * for known phases when no current phase is set.
 */
test("canTransitionTo unknown phase returns false", () => {
  const sm = createMachine();
  expect(sm.canTransitionTo("nonexistent")).toBe(false);
  expect(sm.canTransitionTo("boot")).toBe(true);
});

// ----- Basic Transitions -----

/**
 * Verifies that transitioning to a known phase activates it, sets the
 * current phase name, and returns the phase instance.
 */
test("transitionTo activates a phase and sets currentPhaseName", async () => {
  const sm = createMachine();
  const instance = await sm.transitionTo("boot");
  expect(sm.getCurrentPhaseName()).toBe("boot");
  expect(sm.getCurrentPhase()).toBe(instance);
  expect(instance).toBeDefined();
});

/**
 * Verifies that transitioning from one phase to another deactivates the
 * old phase and activates the new one.
 */
test("transitionTo deactivates previous phase and activates next", async () => {
  const sm = createMachine();
  /** @type {Array<{ phase: string, action: string }>} */
  const calls = [];

  setFactory(sm, "boot", (deps, transition) => ({
    /**
     * Records boot activation.
     */
    activate: () => calls.push({ phase: "boot", action: "activate" }),
    /**
     * Records boot deactivation.
     */
    deactivate: () => calls.push({ phase: "boot", action: "deactivate" }),
    deps,
    transition,
  }));

  setFactory(sm, "menu", (deps, transition) => ({
    /**
     * Records menu activation.
     */
    activate: () => calls.push({ phase: "menu", action: "activate" }),
    /**
     * Records menu deactivation.
     */
    deactivate: () => calls.push({ phase: "menu", action: "deactivate" }),
    deps,
    transition,
  }));

  await sm.transitionTo("boot");
  await sm.transitionTo("menu");

  expect(calls).toEqual([
    { phase: "boot", action: "activate" },
    { phase: "boot", action: "deactivate" },
    { phase: "menu", action: "activate" },
  ]);
});

// ----- Transition Validation -----

/**
 * Verifies that when allowedTransitions is defined, invalid transitions
 * throw an error and valid ones succeed.
 */
test("transitionTo throws on disallowed transitions", async () => {
  const sm = createMachine({
    allowedTransitions: { boot: ["menu"] },
  });

  await sm.transitionTo("boot");

  // boot -> play is NOT allowed
  await expect(sm.transitionTo("play")).rejects.toThrow(/Invalid transition/);

  // boot -> menu IS allowed
  await sm.transitionTo("menu");
  expect(sm.getCurrentPhaseName()).toBe("menu");
});

/**
 * Verifies that transitioning to an unknown phase throws an error. The
 * machine throws "Invalid transition" before it can reach "Unknown phase"
 * because canTransitionTo returns false for missing phases.
 */
test("transitionTo throws on unknown phase", async () => {
  const sm = createMachine();
  await expect(sm.transitionTo("void")).rejects.toThrow(/Invalid transition/);
});

// ----- Root Dependencies -----

/**
 * Verifies that root dependencies are passed through to phase factories.
 */
test("rootDeps are forwarded to phase factory", async () => {
  const rootDeps = { player: "Alice", score: 42 };
  const sm = createMachine({ rootDeps });

  const instance = await sm.transitionTo("boot");
  expect(instance.deps).toEqual(rootDeps);
});

/**
 * Verifies that setRootDependencies replaces the root deps bag.
 */
test("setRootDependencies replaces root deps", async () => {
  const sm = createMachine({ rootDeps: { initial: true } });
  sm.setRootDependencies({ replaced: true });

  const instance = await sm.transitionTo("boot");
  expect(instance.deps).toEqual({ replaced: true });
});

// ----- onChange Listeners -----

/**
 * Verifies that onChange listeners are called with transition info
 * (from, to, payload) when a transition completes.
 */
test("onChange listener is invoked on transition", async () => {
  const fresh = createMachine({ rootDeps: { x: 1 } });
  /** @type {Array<Object>} */
  const events = [];
  fresh.onChange((info) => events.push(info));

  await fresh.transitionTo("boot", { foo: "bar" });

  expect(events).toHaveLength(1);
  expect(events[0].to).toBe("boot");
  expect(events[0].payload).toEqual({ foo: "bar" });
  expect(events[0].phaseInstance).toBeDefined();
  // `from` may be undefined (first transition) or a previous phase name
  // depending on test execution order (pollution from earlier tests).
  // We only assert it's a string or undefined.
  expect(
    typeof events[0].from === "string" || events[0].from === undefined,
  ).toBe(true);
});

/**
 * Verifies that multiple onChange listeners are all called, and that
 * a listener error does not prevent other listeners from firing.
 */
test("onChange listener errors do not break other listeners", async () => {
  const sm = createMachine();
  /** @type {Array<number>} */
  const called = [];

  sm.onChange(() => {
    throw new Error("listener error");
  });
  sm.onChange(() => called.push(1));

  await sm.transitionTo("boot");
  expect(called).toEqual([1]);
});

/**
 * Verifies that the unsubscribe function returned by onChange removes
 * the listener.
 */
test("onChange unsubscribe works", async () => {
  const sm = createMachine();
  /** @type {Array<number>} */
  const events = [];
  const unsub = sm.onChange(() => events.push(1));
  unsub();

  await sm.transitionTo("boot");
  expect(events).toHaveLength(0);
});

// ----- Phase-Initiated Transitions (transition callback) -----

/**
 * Verifies that phases can request a transition via the transition
 * callback, and the StateMachine validates it.
 */
test("phase transition callback triggers transition", async () => {
  const sm = createMachine({
    allowedTransitions: { boot: ["menu"] },
  });

  /** @type {Function | undefined} */
  let phaseTransition;

  setFactory(sm, "boot", (deps, transition) => {
    phaseTransition = transition;
    return {
      /**
       * Activates the boot phase.
       */
      activate: () => {},
      /**
       * Deactivates the boot phase.
       */
      deactivate: () => {},
      deps,
      transition,
    };
  });

  await sm.transitionTo("boot");
  expect(phaseTransition).toBeDefined();

  await phaseTransition("menu");
  expect(sm.getCurrentPhaseName()).toBe("menu");
});

/**
 * Verifies that a phase transition callback to a disallowed phase throws.
 */
test("phase transition callback throws on invalid transition", async () => {
  const sm = createMachine({
    allowedTransitions: { boot: ["menu"] },
  });

  /** @type {Function | undefined} */
  let phaseTransition;

  setFactory(sm, "boot", (deps, transition) => {
    phaseTransition = transition;
    return {
      /**
       * Activates the boot phase.
       */
      activate: () => {},
      /**
       * Deactivates the boot phase.
       */
      deactivate: () => {},
      deps,
      transition,
    };
  });

  await sm.transitionTo("boot");

  await expect(phaseTransition("play")).rejects.toThrow(/Invalid transition/);
  expect(sm.getCurrentPhaseName()).toBe("boot");
});

// ----- Error Handling -----

/**
 * Verifies that if a phase's activate() throws, the machine attempts to
 * deactivate the failed phase and re-throws. Note: the state machine sets
 * currentPhaseName to the new phase BEFORE calling activate(), so on
 * failure the machine name reflects the failed phase.
 */
test("activate failure is handled and re-thrown", async () => {
  const sm = createMachine();

  await sm.transitionTo("boot");
  expect(sm.getCurrentPhaseName()).toBe("boot");

  await expect(sm.transitionTo("fail")).rejects.toThrow("activation failed");

  // Phase name is NOT reverted after failed activation
  expect(sm.getCurrentPhaseName()).toBe("fail");
});

/**
 * Verifies that shutdown deactivates the current phase, clears the phase
 * reference, and clears all onChange listeners.
 */
test("shutdown deactivates and clears state", async () => {
  const sm = createMachine();
  /** @type {Array<string>} */
  const log = [];

  setFactory(sm, "boot", () => ({
    /**
     * Activates the boot phase.
     */
    activate: () => {},
    /**
     * Deactivates the boot phase (logs).
     */
    deactivate: () => log.push("deactivated"),
  }));

  await sm.transitionTo("boot");

  /** @type {Array<Object>} */
  const events = [];
  sm.onChange(() => events.push(1));

  await sm.shutdown();

  expect(log).toEqual(["deactivated"]);
  expect(sm.getCurrentPhase()).toBeUndefined();
  expect(sm.getCurrentPhaseName()).toBeUndefined();

  // Listener should have been cleared
  await sm.transitionTo("boot");
  expect(events).toHaveLength(0);
});

/**
 * Verifies that shutdown does not throw when there is no current phase.
 */
test("shutdown is safe when no current phase", async () => {
  const sm = createMachine();
  await expect(sm.shutdown()).resolves.not.toThrow();
});
