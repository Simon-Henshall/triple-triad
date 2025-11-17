import { UIManager } from "../shared/ui/ui-manager.js";

/**
 * Get the current player's turn colour.
 * @returns {"red" | "blue"} The current player's colour.
 */
export function getPlayerTurn() {
  return UIManager.playerTurn;
}

/**
 * Swap the current player's turn between "blue" and "red".
 */
export function swapPlayerTurn() {
  UIManager.playerTurn = getPlayerTurn() === "blue" ? "red" : "blue";
}
