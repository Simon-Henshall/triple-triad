import { offsets } from "./offsets.js";
import { board } from "./board.js";
import { player } from "./player.js";
import { ui } from "./ui.js";
import { debug } from "../debug.js";
import { selectionBoard } from "./selectionBoard.js";
import { Game } from "../game/game.js";

export const cursors = {
  // -------------------------
  // PLAYER HAND SELECTION CURSOR
  // -------------------------
  //
  selection: {
    /**
     * Place the small hand selection cursor at its initial position
     */
    place() {
      player.playerHandSelectionCursor.x = ui.selectionBoard.background.x - 40;
      player.playerHandSelectionCursor.y = ui.selectionBoard.background.y + 48;

      ui.selectionBoard.container.addChild(player.playerHandSelectionCursor);
      Game.stage.update();
      if (debug.active) {
        console.log(
          `Player hand selection cursor placed at X:${player.playerHandSelectionCursor.x}, Y:${player.playerHandSelectionCursor.y}`
        );
      }
    },
    /**
     * Move the hand selection cursor up/down/left/right
     */
    move(direction) {
      const controller = selectionBoard.controller;
      if (!controller) return;

      const currentPageStart = controller.pageStart;
      const currentPageEnd =
        currentPageStart + controller.displayedCards.length - 1;

      switch (direction) {
        case "up":
          if (controller.selectedIndex > currentPageStart) {
            controller.selectPrevious();
          }
          break;

        case "down":
          if (controller.selectedIndex < currentPageEnd) {
            controller.selectNext();
          }
          break;

        case "left":
          controller.paginate("left");
          break;

        case "right":
          controller.paginate("right");
          break;
      }

      selectionBoard.populate();

      // Move cursor container visually
      const sb = ui.selectionBoard;
      if (player.playerHandSelectionCursor && sb.shownCards && sb.background) {
        const relativeIndex = controller.selectedIndex - controller.pageStart;
        const rowStep = 35;
        player.playerHandSelectionCursor.y =
          sb.background.y + 48 + rowStep * relativeIndex;
      }

      Game.stage.update();
    },
    /**
     * Remove the hand selection cursor
     */
    remove() {
      Game.stage.removeChild(player.playerHandSelectionCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Player hand selection cursor removed");
      }
    },
  },
  // -------------------------
  // CONFIRMATION CURSOR
  // -------------------------
  confirmation: {
    /**
     * Place the confirmation cursor at the default position
     */
    place() {
      ui.confirmation.cursor.x = ui.confirmation.background.x + 50;
      ui.confirmation.cursor.y = ui.confirmation.background.y + 60;

      Game.stage.addChild(ui.confirmation.cursor);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Confirmation cursor placed at X:${ui.confirmation.cursor.x}, Y:${ui.confirmation.cursor.y}`
        );
      }
    },
    /**
     * Move the confirmation cursor up/down between Yes/No
     */
    move(direction) {
      if (direction === "up" && ui.confirmation.selectedChoice > 0) {
        ui.confirmation.cursor.y -= 30;
        ui.confirmation.selectedChoice -= 1;
      } else if (direction === "down" && ui.confirmation.selectedChoice < 1) {
        ui.confirmation.cursor.y += 30;
        ui.confirmation.selectedChoice += 1;
      }

      // Ensure the selectedChoice never goes out of bounds
      ui.confirmation.selectedChoice = Math.max(
        0,
        Math.min(1, ui.confirmation.selectedChoice)
      );

      Game.stage.update();
      if (debug.active) {
        console.log(
          `Confirmation cursor moved ${direction} -> Choice index: ${ui.confirmation.selectedChoice}`
        );
      }
    },
    /**
     * Remove the confirmation cursor
     */
    remove() {
      Game.stage.removeChild(ui.confirmation.cursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Confirmation cursor removed");
      }
    },
  },
  // -------------------------
  // PLAYER HAND CURSOR
  // -------------------------
  playerHand: {
    /**
     * Place the player hand cursor at its initial position
     */
    place() {
      ui.playerChoosingCard = true;
      player.playerHandCursor.x = player.handOffsetX - 50;
      player.playerHandCursor.y =
        offsets.handOffsetY +
        (ui.selectedCardNumber + 1 + player.playedPlayerCardCount) *
          (offsets.cardHeight / 2);

      Game.stage.addChild(player.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Player hand cursor placed at X:${player.playerHandCursor.x}, Y:${player.playerHandCursor.y}`
        );
      }
    },
    /**
     * Move the player hand cursor up/down
     * @param {"up"|"down"} direction
     */
    move(direction) {
      if (direction === "up" && ui.selectedCardNumber > 0) {
        player.playerHandCursor.y -= offsets.handCardOffset;
        ui.selectedCardNumber--;
        player.cardsAboveSelection--;
      } else if (
        direction === "down" &&
        ui.selectedCardNumber < player.cardsInPlayerHand.length - 1
      ) {
        player.playerHandCursor.y += offsets.handCardOffset;
        ui.selectedCardNumber++;
        player.cardsAboveSelection++;
      } else {
        console.warn(`Cannot move cursor ${direction} - out of bounds`);
        return;
      }

      ui.previouslySelectedCard = ui.selectedCard;
      ui.selectedCard = player.cardsInPlayerHand[ui.selectedCardNumber];

      ui.updateInfoBox();
      player.indentSelectedCard();

      Game.stage.update();
      if (debug.active) {
        console.log(
          `Moved player hand cursor ${direction} -> Card index: ${ui.selectedCardNumber}`
        );
      }
    },
    /**
     * Remove the player hand cursor
     */
    remove() {
      ui.playerChoosingCard = false;
      Game.stage.removeChild(player.playerHandCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Player hand cursor removed");
      }
    },
  },
  // -------------------------
  // GRID CURSOR
  // -------------------------
  grid: {
    /**
     * Place the selection cursor on the grid
     */
    place() {
      ui.playerSelectingPlacement = true;
      ui.gridCursor.x = offsets.gameOffsetX + offsets.cellWidth + 16;
      ui.gridCursor.y = offsets.gameOffsetY + offsets.cellHeight + 80;

      Game.stage.addChild(ui.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor placed at X:${ui.gridCursor.x}, Y:${ui.gridCursor.y}`
        );
      }
    },
    /**
     * Move the grid cursor in one of four directions
     * @param {"left"|"up"|"right"|"down"} direction
     */
    move(direction) {
      const oldX = ui.gridCursor.x;
      const oldY = ui.gridCursor.y;

      if (direction === "left" && ui.gridCursor.x > offsets.gameOffsetX + 16) {
        ui.gridCursor.x -= offsets.cellWidth;
        ui.selectedColumn--;
      } else if (
        direction === "up" &&
        ui.gridCursor.y > offsets.gameOffsetY + 80
      ) {
        ui.gridCursor.y -= offsets.cellHeight;
        ui.selectedRow--;
      } else if (
        direction === "right" &&
        ui.gridCursor.x < offsets.gameOffsetX + offsets.cellWidth * 2 + 16
      ) {
        ui.gridCursor.x += offsets.cellWidth;
        ui.selectedColumn++;
      } else if (
        direction === "down" &&
        ui.gridCursor.y < offsets.gameOffsetY + offsets.cellHeight * 2 + 80
      ) {
        ui.gridCursor.y += offsets.cellHeight;
        ui.selectedRow++;
      } else {
        console.warn(`Cannot move grid cursor ${direction} - out of bounds`);
        return;
      }

      board.checkSelectedSquare();
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${ui.gridCursor.x}, Y:${ui.gridCursor.y}`
        );
      }
    },
    /**
     * Remove the selection cursor from the grid
     */
    remove() {
      ui.playerSelectingPlacement = false;
      Game.stage.removeChild(ui.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor removed");
      }
    },
  },
};
