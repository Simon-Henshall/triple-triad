/**
 * Maps card direction keywords to internal properties and strengths
 * @type {Object<string, Object>}
 */
export const directionMap = {
  left: {
    prop: "cardLeft",
    playerStrength: "strengthLeft",
    opponentStrength: "strengthRight",
  },
  right: {
    prop: "cardRight",
    playerStrength: "strengthRight",
    opponentStrength: "strengthLeft",
  },
  up: {
    prop: "cardUp",
    playerStrength: "strengthUp",
    opponentStrength: "strengthDown",
  },
  down: {
    prop: "cardDown",
    playerStrength: "strengthDown",
    opponentStrength: "strengthUp",
  },
};
