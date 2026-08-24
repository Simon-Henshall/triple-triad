/**
 * @typedef {'left'|'right'|'up'|'down'} DirectionKey
 */

/**
 * Information describing how a direction maps to card properties and strength keys.
 *
 * @typedef {Object} DirectionInfo
 * @property {string} prop - The card object property name representing this side (e.g. "cardLeft").
 * @property {DirectionKey} playerStrength - The strength key used for the player's card in this direction.
 * @property {DirectionKey} opponentStrength - The strength key used for the opponent's card (the opposite direction).
 */

/**
 * Mapping of direction keywords to internal card property names and strength keys.
 *
 * Each entry maps a human-readable direction key to a `DirectionInfo` describing:
 * - `prop`: the card object property for that side (used when reading a card's side value),
 * - `playerStrength`: the direction key representing the player's side for comparisons,
 * - `opponentStrength`: the direction key representing the opponent's side (the opposite).
 *
 * @type {Object<DirectionKey, DirectionInfo>}
 *
 * @example
 * // Access the property name and strength keys for the left direction:
 * const info = directionMap.left;
 * // info.prop === "cardLeft"
 * // info.playerStrength === "left"
 * // info.opponentStrength === "right"
 */
export const directionMap = {
  left: {
    prop: "cardLeft",
    playerStrength: "left",
    opponentStrength: "right",
  },
  right: {
    prop: "cardRight",
    playerStrength: "right",
    opponentStrength: "left",
  },
  up: {
    prop: "cardUp",
    playerStrength: "up",
    opponentStrength: "down",
  },
  down: {
    prop: "cardDown",
    playerStrength: "down",
    opponentStrength: "up",
  },
};
