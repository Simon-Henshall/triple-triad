import { UIModel } from "../shared/ui/ui-model.js";

/**
 * Get the current player's turn colour.
 * @returns {"red" | "blue"} The current player's colour.
 */
export function getPlayerTurn() {
  return UIModel.playerTurn;
}

/**
 * Swap the current player's turn between "blue" and "red".
 */
export function swapPlayerTurn() {
  UIModel.playerTurn = getPlayerTurn() === "blue" ? "red" : "blue";
}
