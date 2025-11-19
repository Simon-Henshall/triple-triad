/**
 * StateMachine class
 * Manages the current phase of the game and provides
 * methods for transitioning between phases.
 */
export class StateMachine {
  /**
   * Class representing the state machine for the game.
   * Handles the current phase of the game and provides
   * methods for transitioning between phases.
   */
  constructor(phaseRegistry, deps = {}) {
    this.phaseRegistry = phaseRegistry; // the object from phases.js
    this.deps = deps;
    this.currentPhase = undefined;
  }

  /**
   * Resets the state machine and transitions to the specified phase.
   * @param {string} phaseName The name of the phase to transition to.
   */
  setDependencies(deps) {
    this.deps = deps;
  }

  /**
   * Resets the state machine's dependencies.
   * @param {Object} deps The new dependencies to set.
   */
  transitionTo(phaseName) {
    const factory = this.phaseRegistry[phaseName];
    if (!factory) {
      throw new Error(`Unknown phase: ${phaseName}`);
    }

    // Deactivate current
    if (this.currentPhase?.deactivate) {
      this.currentPhase.deactivate();
    }

    // Create the new phase instance using the factory and deps
    this.currentPhase = factory(this.deps);

    if (this.currentPhase?.activate) {
      this.currentPhase.activate();
    }
  }

  /**
   * Gets the current phase object.
   * @returns {Object} The current phase object.
   */
  getCurrentPhase() {
    return this.currentPhase;
  }
}
