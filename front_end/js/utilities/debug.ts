import { BoardModel } from "../shared/board/board-model.js";
import { getPlayerTurn } from "./turn.js";
import { elements } from "../constants/elements.js";
import { Game } from "../shared/game/game.js";

export const debug = {
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
    const squareObject = BoardModel.squares[squareID - 1];
    const cardHere = BoardModel.boardArray[squareID - 1].occupant;

    console.log("======================================================");
    console.log(`CELL DEBUG | Square ID: ${squareID}`);
    console.log(`Element: ${squareObject?.element ?? "None"}`);

    if (cardHere && cardHere !== "Empty") {
      console.log("Card Present:");
      console.log(`  Name: ${cardHere.data?.name ?? cardHere.name}`);
      console.log(`  Owner: ${cardHere.owner}`);
      console.log(`  Element: ${cardHere.data?.element ?? cardHere.element}`);
      console.log(
        `  Strengths -> L:${cardHere.data?.strength?.left ?? "?"} U:${cardHere.data?.strength?.up ?? "?"} R:${cardHere.data?.strength?.right ?? "?"} D:${cardHere.data?.strength?.down ?? "?"}`,
      );
      console.log("  Adjacent Cards:");
      console.log(
        `    Left: ${cardHere.cardLeft?.data?.name ?? cardHere.cardLeft?.name ?? "None"}`,
      );
      console.log(
        `    Up: ${cardHere.cardUp?.data?.name ?? cardHere.cardUp?.name ?? "None"}`,
      );
      console.log(
        `    Right: ${cardHere.cardRight?.data?.name ?? cardHere.cardRight?.name ?? "None"}`,
      );
      console.log(
        `    Down: ${cardHere.cardDown?.data?.name ?? cardHere.cardDown?.name ?? "None"}`,
      );
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
    for (let index = 0; index < 3; index++) {
      const row = BoardModel.boardArray
        .slice(index * 3, index * 3 + 3)
        .map((cell) => {
          const element = cell.element
            ? `Cell Element: ${elements[cell.element].name}`
            : "No Element";
          if (!cell.occupant) {
            return `[Empty | ${element}]`;
          }
          return `[${cell.occupant.data?.name ?? cell.occupant.name} | ${cell.occupant.owner} | Card Element: ${cell.occupant.data?.element ?? cell.occupant.element} | Cell Element: ${element}]`;
        });
      console.log(`Row ${index + 1}: ${row.join(" | ")}`);
    }
    console.log("-------------------------------------------");
  },

  /**
   * Logs current hands of both players
   */
  logHands() {
    console.log("=============== PLAYER HAND ===============");
    const playerModel = Game.models.playerModel;
    // Use the logical hand from the PlayerModel (card objects)
    for (const [index, card] of playerModel.hand.entries()) {
      console.log(
        `Card ${index}: ${card.data?.name ?? card.name} | Owner: ${card.owner} | Element: ${card.data?.element ?? card.element}`,
      );
    }

    console.log("=============== AI HAND ===================");
    const aiTurnModel = Game.models.aiTurnModel;
    for (const [index, card] of aiTurnModel.hand.entries()) {
      console.log(
        `Card ${index}: ${card.data?.name ?? card.name} | Owner: ${card.owner} | Element: ${card.data?.element ?? card.element}`,
      );
    }
    console.log("==========================================");
  },

  /**
   * Logs current turn info
   */
  logTurn() {
    const currentPlayer = getPlayerTurn();
    const playerModel = Game.models.playerModel;
    const aiTurnModel = Game.models.aiTurnModel;
    console.log(
      `********** CURRENT TURN: ${currentPlayer.toUpperCase()} **********`,
    );
    console.log(
      `SCORE | Player: ${playerModel.totalBlueCards} AI: ${aiTurnModel.currentlyOwnedCards}`,
    );
    console.log(`Free cells remaining: ${BoardModel.freeCells.join(", ")}`);
    console.log("*****************************************");
  },

  /**
   * Combined full debug log
   */
  logFullState(target) {
    console.log("*****************************************");
    console.log("Logging full state for:", target);
    this.logBoard();
    this.logHands();
    this.logTurn();
  },

  /**
   * Click logging
   */
  clickHandler(event) {
    if (debug.active) {
      debug.logFullState(event.currentTarget);
    }
  },
};
