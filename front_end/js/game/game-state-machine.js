/**
 * game-state-machine.js
 *
 * StateMachine that:
 *  - Accepts a "phase registry" where each phase entry exposes:
 *      { deps: (rootDeps) => localDeps, factory: (localDeps, transition) => phaseInstance }
 *  - Enforces allowed transitions (whitelist)
 *  - Calls activate() on new phase and deactivate() on previous
 *  - Provides a transition callback for phases to request next phases:
 *      phaseInstance calls `transition("placement", { foo: 1 })`
 *  - Emits optional listeners on phase changes via onChange()
 */
export class StateMachine {
  /**
   * Creates a new StateMachine instance.
   *
   * @param {Object<string, { deps: (rootDeps) => localDeps, factory: (localDeps, transition) => phaseInstance }>} phaseRegistry
   * Map of phase names to objects containing dependencies and factories.
   * @param {Object<string, { rootDeps: Object<string, *> }} options
   * Object containing options for the StateMachine.
   * rootDeps: Initial root dependency bag.
   * allowedTransitions: Map of lists (phaseName -> [allowedNextPhaseNames])
   */
  constructor(phaseRegistry = {}, options = {}) {
    this.phaseRegistry = phaseRegistry;
    this.allowedTransitions = options.allowedTransitions || {};
    this.rootDeps = options.rootDeps || {};
    this.currentPhaseName = undefined;
    this.currentPhase = undefined;
    this._onChangeListeners = new Set();
  }

  /**
   * Replace root dependencies (e.g., after initialisation).
   * @param {Object} rootDeps
   */
  setRootDependencies(rootDeps = {}) {
    this.rootDeps = rootDeps;
  }

  /**
   * Registers an on-change listener: fn({ from, to, phaseInstance, payload })
   * Returns a function to unsubscribe.
   */
  onChange(function_) {
    this._onChangeListeners.add(function_);
    return () => this._onChangeListeners.delete(function_);
  }

  /**
   * Requests a transition to the next phase.
   * @param {string} nextPhaseName name of the phase to transition to
   * @param {Object} [payload] optional payload to pass to the next phase
   */
  _emitChange(payload = {}) {
    const info = {
      from: this.currentPhaseName,
      to: payload.to,
      phaseInstance: this.currentPhase,
      payload: payload.data,
    };
    for (const function_ of this._onChangeListeners) {
      try {
        function_(info);
      } catch (error) {
        // don't let listener errors break state machine
        console.error("StateMachine onChange listener error:", error);
      }
    }
  }

  /**
   * Checks whether a transition from the current phase to the next phase is allowed.
   *
   * If no whitelist exists for the current phase, any transition is allowed unless the next phase is unknown.
   * @param {string} nextPhaseName
   * @returns {boolean} whether the transition is allowed
   */
  canTransitionTo(nextPhaseName) {
    if (!this.phaseRegistry[nextPhaseName]) {
      return false;
    }
    if (this.currentPhaseName == undefined) {
      return true;
    } // boot
    const allowed = this.allowedTransitions[this.currentPhaseName];
    if (!Array.isArray(allowed)) {
      return true;
    } // no whitelist defined → allow
    return allowed.includes(nextPhaseName);
  }

  /**
   * Phase transition function passed into phases so they can request transitions,
   * but the StateMachine still validates and performs lifecycle actions.
   *
   * @param {string} pName
   * @param {Object} [pPayload] - optional data passed to listeners/next phase
   */
  _phaseTransitionFunction = (pName, pPayload = {}) =>
    this._requestTransition(pName, pPayload);

  /**
   * Transition helper passed into phases so they can request transitions,
   * but the StateMachine still validates and performs lifecycle actions.
   *
   * @param {string} nextPhaseName
   * @param {Object} [payload] - optional data passed to listeners/next phase
   */
  async _requestTransition(nextPhaseName, payload) {
    if (!this.canTransitionTo(nextPhaseName)) {
      throw new Error(
        `Invalid transition attempted: ${String(this.currentPhaseName)} → ${nextPhaseName}`,
      );
    }

    const entry = this.phaseRegistry[nextPhaseName];
    if (!entry) {
      throw new Error(`Unknown phase: ${nextPhaseName}`);
    }

    // Deactivate current phase (if it exists)
    try {
      if (this.currentPhase?.deactivate) {
        // allow deactivate to be async
        await this.currentPhase.deactivate();
      }
    } catch (error) {
      console.error("Error during phase deactivate:", error);
      // proceed — but you might want to fail hard in dev builds
    }

    // Build local deps for the next phase
    const localDeps = entry.deps ? entry.deps(this.rootDeps, payload) : {};

    const instance = entry.factory
      ? entry.factory(localDeps, this._phaseTransitionFunction)
      : undefined;

    // Set currentPhase and name before activate for listeners that rely on meta info
    const previousName = this.currentPhaseName;
    this.currentPhase = instance;
    this.currentPhaseName = nextPhaseName;

    // Activate the new phase (may be async)
    try {
      if (this.currentPhase?.activate) {
        await this.currentPhase.activate();
      }
    } catch (error) {
      console.error("Error during phase activate:", error);
      // If activation fails, attempt to clean up
      if (this.currentPhase?.deactivate) {
        try {
          await this.currentPhase.deactivate();
        } catch (error_) {
          console.error("Error cleaning up failed activation:", error_);
        }
      }
      // Re-throw so callers know activation failed.
      throw error;
    }

    // Notify listeners
    this._emitChange({ to: nextPhaseName, data: payload, from: previousName });
    return instance;
  }

  /**
   * Public: transition to a phase (entry point).
   * This will call deactivate/activate lifecycle hooks and set up the new phase instance.
   *
   * @param {string} nextPhaseName
   * @param {Object} [payload] - optional
   * @returns {Promise<Object>} - the created phase instance
   */
  transitionTo(nextPhaseName, payload = {}) {
    return this._requestTransition(nextPhaseName, payload);
  }

  /**
   * Getters for current phase
   */
  getCurrentPhaseName() {
    return this.currentPhaseName;
  }

  /**
   * Public: get the name of the current phase.
   *
   * @returns {string} - the name of the current phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Shutdown the machine: deactivate current phase and clear listeners.
   * Use this when tearing down a game instance.
   */
  async shutdown() {
    if (this.currentPhase?.deactivate) {
      try {
        await this.currentPhase.deactivate();
      } catch (error) {
        console.error("Error shutting down current phase:", error);
      }
    }
    this.currentPhase = undefined;
    this.currentPhaseName = undefined;
    this._onChangeListeners.clear();
  }
}

export default StateMachine;
