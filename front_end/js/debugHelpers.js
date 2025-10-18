// -------------------------
// DEBUG HELPERS
// -------------------------

/**
 * Logs detailed info about a cell and its card (if present)
 * @param {createjs.Container|Object} eventOrSquare - Either a click event or square object
 */
function logCell(eventOrSquare) {
  const squareID = eventOrSquare.name ?? eventOrSquare.id;
  const squareObj = Game.ui.squares[squareID - 1];
  const cardHere = board[squareID - 1];

  console.log("======================================================");
  console.log(`CELL DEBUG | Square ID: ${squareID}`);
  console.log(`Element: ${squareObj?.element ?? "None"}`);

  if (cardHere && cardHere !== "Empty") {
    console.log("Card Present:");
    console.log(`  Name: ${cardHere.name}`);
    console.log(`  Owner: ${cardHere.owner}`);
    console.log(`  Element: ${cardHere.element}`);
    console.log(`  Strengths -> L:${cardHere.strengthLeft} U:${cardHere.strengthUp} R:${cardHere.strengthRight} D:${cardHere.strengthDown}`);
    console.log("  Adjacent Cards:");
    console.log(`    Left: ${cardHere.cardLeft?.name ?? "None"}`);
    console.log(`    Up: ${cardHere.cardUp?.name ?? "None"}`);
    console.log(`    Right: ${cardHere.cardRight?.name ?? "None"}`);
    console.log(`    Down: ${cardHere.cardDown?.name ?? "None"}`);
  } else {
    console.log("Card Present: NONE");
  }

  console.log("======================================================");
}

/**
 * Logs the full board state in a 3x3 format
 */
function logBoard() {
  console.log("--------------- BOARD STATE ---------------");
  for (let i = 0; i < 3; i++) {
    const row = board.slice(i * 3, i * 3 + 3).map((cell) => {
      if (cell === "Empty") return "[Empty]";
      return `[${cell.name} | ${cell.owner}]`;
    });
    console.log(`Row ${i + 1}: ${row.join(" | ")}`);
  }
  console.log("-------------------------------------------");
}

/**
 * Logs current hands of both players
 */
function logHands() {
  console.log("=============== PLAYER HAND ===============");
  cardsInPlayerHand.forEach((card, i) => {
    console.log(`Card ${i}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`);
  });

  console.log("=============== AI HAND ===================");
  cardsInAIHand.forEach((card, i) => {
    console.log(`Card ${i}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`);
  });
  console.log("==========================================");
}

/**
 * Logs current turn info
 */
function logTurn() {
  const currentPlayer = Game.utils.getPlayerTurn();
  console.log(`********** CURRENT TURN: ${currentPlayer.toUpperCase()} **********`);
  console.log(`SCORE | Player: ${totalBlueCards} AI: ${totalRedCards}`);
  console.log(`Free cells remaining: ${freeCells.join(", ")}`);
  console.log("*****************************************");
}

/**
 * Combined full game debug log
 */
function logFullState(eventOrSquare = null) {
  if (eventOrSquare) logCell(eventOrSquare);
  logBoard();
  logHands();
  logTurn();
}

// -------------------------
// Backwards-compatible click handler
// -------------------------
function clickHandler(event) {
  console.log("CLICK DEBUG TRIGGERED");
  logFullState(event.target);
}

// -------------------------
// Exports / Global Exposure
// -------------------------
window.logCell = logCell;
window.logBoard = logBoard;
window.logHands = logHands;
window.logTurn = logTurn;
window.logFullState = logFullState;
window.clickHandler = clickHandler;
