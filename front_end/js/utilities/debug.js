import { BoardManager } from "../shared/board/board-manager.js";
import { UIManager } from "../shared/ui/ui-manager.js";
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
    const squareObject = UIManager.squares[squareID - 1];
    const cardHere = BoardManager.boardArray[squareID - 1].occupant;

    console.log("======================================================");
    console.log(`CELL DEBUG | Square ID: ${squareID}`);
    console.log(`Element: ${squareObject?.element ?? "None"}`);

    if (cardHere && cardHere !== "Empty") {
      console.log("Card Present:");
      console.log(`  Name: ${cardHere.name}`);
      console.log(`  Owner: ${cardHere.owner}`);
      console.log(`  Element: ${cardHere.element}`);
      console.log(
        `  Strengths -> L:${cardHere.strengthLeft} U:${cardHere.strengthUp} R:${cardHere.strengthRight} D:${cardHere.strengthDown}`,
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
    for (let index = 0; index < 3; index++) {
      const row = BoardManager.boardArray
        .slice(index * 3, index * 3 + 3)
        .map((cell) => {
          const element = cell.element
            ? `Cell Element: ${elements[cell.element].name}`
            : "No Element";
          if (!cell.occupant) {
            return `[Empty | ${element}]`;
          }
          return `[${cell.occupant.name} | ${cell.occupant.owner} | Card Element: ${cell.occupant.element} | Cell Element: ${element}]`;
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
    const playerManager = Game.managers.playerManager;
    for (const [index, card] of playerManager.cardsInPlayerHand.entries()) {
      console.log(
        `Card ${index}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`,
      );
    }

    console.log("=============== AI HAND ===================");
    const aiManager = Game.managers.aiManager;
    for (const [index, card] of aiManager.hand.entries()) {
      console.log(
        `Card ${index}: ${card.name} | Owner: ${card.owner} | Element: ${card.element}`,
      );
    }
    console.log("==========================================");
  },

  /**
   * Logs current turn info
   */
  logTurn() {
    const currentPlayer = getPlayerTurn();
    const playerManager = Game.managers.playerManager;
    const aiManager = Game.managers.aiManager;
    console.log(
      `********** CURRENT TURN: ${currentPlayer.toUpperCase()} **********`,
    );
    console.log(
      `SCORE | Player: ${playerManager.totalBlueCards} AI: ${aiManager.totalRedCards}`,
    );
    console.log(`Free cells remaining: ${BoardManager.freeCells.join(", ")}`);
    console.log("*****************************************");
  },

  /**
   * Combined full debug log
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
    if (debug.active) {
      debug.logFullState(event.currentTarget);
    }
  },
};
