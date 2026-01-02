export const UIModel = {
  // -------------------------
  // Grid / Selection state
  // -------------------------
  boardContainer: new createjs.Container(),
  squares: [],
  selectedSquare: 5,
  selectedRow: 2,
  selectedColumn: 2,
  squareLeft: "none",
  squareUp: "none",
  squareRight: "none",
  squareDown: "none",
  gridCursor: undefined,

  // -------------------------
  // Player interaction flags
  // -------------------------
  selectedCardNumber: 0,
  selectedCard: undefined,
  previouslySelectedCard: [],
  playerSelectingHand: false,
  playerConfirming: false,
  playerChoosingCard: false,
  playerSelectingPlacement: false,
  playerTurn: "blue",
};
