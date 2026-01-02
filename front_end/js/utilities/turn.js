import { PhaseChecker } from "../game/phases.js";

/**
 * Get the current player's turn colour.
 * @returns {"red" | "blue"} The current player's colour.
 */
export function getPlayerTurn() {
  return PhaseChecker.playerTurn;
}

/**
 * Swap the current player's turn between "blue" and "red".
 */
export function swapPlayerTurn() {
  PhaseChecker.playerTurn = getPlayerTurn() === "blue" ? "red" : "blue";
}
