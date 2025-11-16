/**
 * Maps card direction keywords to internal properties and strengths
 * @type {Object<string, Object>}
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
