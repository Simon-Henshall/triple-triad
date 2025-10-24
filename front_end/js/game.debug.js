Game.debug = {
  active: true, // Toggle for debug mode

  // -------------------------
  // DEBUG HELPERS
  // -------------------------

  /**
   * Logs detailed info about a cell and its card (if present)
   * @param {createjs.Container|Object} eventOrSquare - Either a click event or square object
   */
  logCell(eventOrSquare) {
    const squareID = eventOrSquare.name ?? eventOrSquare.id;
    const squareObj = Game.ui.squares[squareID - 1];
    const cardHere = board.boardArray[squareID - 1].occupant;

    console.log("======================================================");
    console.log(`CELL DEBUG | Square ID: ${squareID}`);
    console.log(`Element: ${squareObj?.element ?? "None"}`);

    if (cardHere && cardHere !== "Empty") {
      console.log("Card Present:");
      console.log(`  Name: ${cardHere.name}`);
      console.log(`  Owner: ${cardHere.owner}`);
      console.log(`  Element: ${cardHere.element}`);
      console.log(
        `  Strengths -> L:${cardHere.strengthLeft} U:${cardHere.strengthUp} R:${cardHere.strengthRight} D:${cardHere.strengthDown}`
      );
      console.log("  Adjacent Cards:");
      console.log(`    Left: ${cardHere.cardLeft?.name ?? "None"}`);
      console.log(`    Up: ${cardHere.cardUp?.name ?? "None"}`);
      console.log(`    Right: ${cardHere.cardRight?.name ?? "None"}`);
      console.log(`    Down: ${cardHere.cardDown?.name ?? "None"}`);
    } else {
      console.log("Card Present: NONE");
    }

    console.log("======================================================");
  },

  /**
   * Logs the full board state in a 3x3 format
   */
  logBoard() {
    console.log("--------------- BOARD STATE ---------------");
    for (let i = 0; i < 3; i++) {
      const row = board.boardArray.slice(i * 3, i * 3 + 3).map((cell) => {
        const elem = cell.element ? `Cell Element: ${config.elements[cell.element].name}` : "No Element";
        if (!cell.occupant) return `[Empty | ${elem}]`;
        return `[${cell.occupant.name} | ${cell.occupant.owner} | Card Element: ${cell.occupant.element} | Cell Element: ${elem}]`;
      });
      console.log(`Row ${i + 1}: ${row.join(" | ")}`);
    }
    console.log("-------------------------------------------");
  },

  /**
   * Logs current hands of both players
   */
  logHands() {
    console.log("=============== PLAYER HAND ===============");
    Game.player.cardsInPlayerHand.forEach((card, i) => {
      console.log(
        `Card ${i}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`
      );
    });

    console.log("=============== AI HAND ===================");
    Game.ai.cardsInAIHand.forEach((card, i) => {
      console.log(
        `Card ${i}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`
      );
    });
    console.log("==========================================");
  },

  /**
   * Logs current turn info
   */
  logTurn() {
    const currentPlayer = Game.utils.getPlayerTurn();
    console.log(
      `********** CURRENT TURN: ${currentPlayer.toUpperCase()} **********`
    );
    console.log(
      `SCORE | Player: ${Game.player.totalBlueCards} AI: ${Game.ai.totalRedCards}`
    );
    console.log(`Free cells remaining: ${board.freeCells.join(", ")}`);
    console.log("*****************************************");
  },

  /**
   * Combined full game debug log
   */
  logFullState(target) {
    console.log("Logging full state for:", target);
    this.logBoard();
    //this.logHands();
    //this.logTurn();
  },

  /**
   * Click logging
   */
  clickHandler(event) {
    if (Game.debug.active) {
      Game.debug.logFullState(event.currentTarget);
    }
  },
};
