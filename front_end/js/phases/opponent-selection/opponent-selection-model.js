/**
 * Opponent Selection Model
 * Manages state for selecting an opponent during the pre-game phase.
 * Opponents are grouped by location. The player navigates locations
 * (left/right) and players within a location (up/down).
 */
export default class OpponentSelectionModel {
  /**
   * Creates an OpponentSelectionModel instance.
   * @param {Array} locations - Array of { name, players[] } objects
   */
  constructor(locations = []) {
    /** @type {Array<{name: string, players: Array}>} */
    this.locations = locations;
    this.locationIndex = 0;
    this.playerIndex = 0;
  }

  /** Total number of locations */
  get totalLocations() {
    return this.locations.length;
  }

  /** Current location object */
  get currentLocation() {
    return this.locations[this.locationIndex] || undefined;
  }

  /** Players in the current location */
  get currentPlayerList() {
    return this.currentLocation?.players || [];
  }

  /** Total players in the current location */
  get totalPlayers() {
    return this.currentPlayerList.length;
  }

  /** Currently selected player object */
  get selectedPlayer() {
    return this.currentPlayerList[this.playerIndex] || undefined;
  }

  /** Move to next location (wraps around) */
  nextLocation() {
    if (this.totalLocations === 0) {
      return;
    }
    this.locationIndex = (this.locationIndex + 1) % this.totalLocations;
    this.playerIndex = 0;
  }

  /** Move to previous location (wraps around) */
  prevLocation() {
    if (this.totalLocations === 0) {
      return;
    }
    this.locationIndex =
      (this.locationIndex - 1 + this.totalLocations) % this.totalLocations;
    this.playerIndex = 0;
  }

  /** Move to next player (clamped) */
  nextPlayer() {
    if (this.totalPlayers === 0) {
      return;
    }
    this.playerIndex = Math.min(this.playerIndex + 1, this.totalPlayers - 1);
  }

  /** Move to previous player (clamped) */
  prevPlayer() {
    this.playerIndex = Math.max(this.playerIndex - 1, 0);
  }

  /**
   * Generic input handler.
   * @param {"left"|"right"|"up"|"down"|"confirm"} action
   * @returns {boolean} true if 'confirm' was selected
   */
  handleInput(action) {
    switch (action) {
      case "left": {
        this.prevLocation();
        return false;
      }
      case "right": {
        this.nextLocation();
        return false;
      }
      case "up": {
        this.prevPlayer();
        return false;
      }
      case "down": {
        this.nextPlayer();
        return false;
      }
      case "confirm": {
        return true;
      }
      default: {
        return false;
      }
    }
  }
}
