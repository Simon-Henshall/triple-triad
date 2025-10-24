import { offsets } from './offsets.js';

// -------------------------
// PLAYER HAND SELECTION CURSOR
// -------------------------
Game.cursors.selection = {
  /**
   * Place the small hand selection cursor at its initial position
   */
  place() {
    Game.player.playerHandSelectionCursor.x =
      Game.ui.selectionBoard.background.x - 40;
    Game.player.playerHandSelectionCursor.y =
      Game.ui.selectionBoard.background.y + 48;

    Game.ui.selectionBoard.container.addChild(
      Game.player.playerHandSelectionCursor
    );
    Game.stage.update();
    if (Game.debug.active) {
      console.log(
        `Player hand selection cursor placed at X:${Game.player.playerHandSelectionCursor.x}, Y:${Game.player.playerHandSelectionCursor.y}`
      );
    }
  },
  /**
   * Move the hand selection cursor up/down/left/right
   */
  move(direction) {
    const sb = Game.ui.selectionBoard;
    const totalCards = Game.player.ownedCards.length;

    // Page boundaries
    const pageStart = (sb.page - 1) * 11;
    const cardsOnPage = sb.page === sb.totalPages ? sb.remainingCards : 11;
    const pageEnd = pageStart + cardsOnPage - 1;

    // Movement per row (vertical spacing)
    const rowStep = 35;

    switch (direction) {
      case "up":
        if (sb.selectedHandCardNumber > pageStart) {
          sb.selectedHandCardNumber--;
          Game.player.playerHandSelectionCursor.y -= rowStep;
          sb.selectedHandCard =
            Game.player.ownedCards[sb.selectedHandCardNumber];
          Game.cards.selectionBoard.updateDisplay();
        }
        break;

      case "down":
        if (sb.selectedHandCardNumber < pageEnd) {
          sb.selectedHandCardNumber++;
          Game.player.playerHandSelectionCursor.y += rowStep;
          sb.selectedHandCard =
            Game.player.ownedCards[sb.selectedHandCardNumber];
          Game.cards.selectionBoard.updateDisplay();
        }
        break;

      case "left":
        if (sb.page > 1) {
          Game.cards.selectionBoard.paginate("left");
        }
        break;

      case "right":
        if (sb.page < sb.totalPages) {
          Game.cards.selectionBoard.paginate("right");
        }
        break;

      default:
        break;
    }

    Game.stage.update();
  },
  /**
   * Remove the hand selection cursor
   */
  remove() {
    Game.stage.removeChild(Game.player.playerHandSelectionCursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log("Player hand selection cursor removed");
    }
  },
};

// -------------------------
// CONFIRMATION CURSOR
// -------------------------
Game.cursors.confirmation = {
  /**
   * Place the confirmation cursor at the default position
   */
  place() {
    Game.ui.confirmation.cursor.x = Game.ui.confirmation.background.x + 50;
    Game.ui.confirmation.cursor.y = Game.ui.confirmation.background.y + 60;

    Game.stage.addChild(Game.ui.confirmation.cursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log(
        `Confirmation cursor placed at X:${Game.ui.confirmation.cursor.x}, Y:${Game.ui.confirmation.cursor.y}`
      );
    }
  },
  /**
   * Move the confirmation cursor up/down between Yes/No
   */
  move(direction) {
    if (direction === "up" && Game.ui.confirmation.selectedChoice > 0) {
      Game.ui.confirmation.cursor.y -= 30;
      Game.ui.confirmation.selectedChoice -= 1;
    } else if (
      direction === "down" &&
      Game.ui.confirmation.selectedChoice < 1
    ) {
      Game.ui.confirmation.cursor.y += 30;
      Game.ui.confirmation.selectedChoice += 1;
    }

    // Ensure the selectedChoice never goes out of bounds
    Game.ui.confirmation.selectedChoice = Math.max(
      0,
      Math.min(1, Game.ui.confirmation.selectedChoice)
    );

    Game.stage.update();
    if (Game.debug.active) {
      console.log(
        `Confirmation cursor moved ${direction} -> Choice index: ${Game.ui.confirmation.selectedChoice}`
      );
    }
  },
  /**
   * Remove the confirmation cursor
   */
  remove() {
    Game.stage.removeChild(Game.ui.confirmation.cursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log("Confirmation cursor removed");
    }
  },
};

// -------------------------
// PLAYER HAND CURSOR
// -------------------------
Game.cursors.playerHand = {
  /**
   * Place the player hand cursor at its initial position
   */
  place() {
    Game.ui.playerChoosingCard = true;
    Game.player.playerHandCursor.x = Game.player.handOffsetX - 50;
    Game.player.playerHandCursor.y =
      offsets.handOffsetY +
      (Game.ui.selectedCardNumber + 1 + Game.player.playedPlayerCardCount) *
        (offsets.cardHeight / 2);

    Game.stage.addChild(Game.player.playerHandCursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log(
        `Player hand cursor placed at X:${Game.player.playerHandCursor.x}, Y:${Game.player.playerHandCursor.y}`
      );
    }
  },
  /**
   * Move the player hand cursor up/down
   * @param {"up"|"down"} direction
   */
  move(direction) {
    if (direction === "up" && Game.ui.selectedCardNumber > 0) {
      Game.player.playerHandCursor.y -= offsets.handCardOffset;
      Game.ui.selectedCardNumber--;
      Game.player.cardsAboveSelection--;
    } else if (
      direction === "down" &&
      Game.ui.selectedCardNumber < Game.player.cardsInPlayerHand.length - 1
    ) {
      Game.player.playerHandCursor.y += offsets.handCardOffset;
      Game.ui.selectedCardNumber++;
      Game.player.cardsAboveSelection++;
    } else {
      console.warn(`Cannot move cursor ${direction} - out of bounds`);
      return;
    }

    Game.ui.previouslySelectedCard = Game.ui.selectedCard;
    Game.ui.selectedCard =
      Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];

    Game.ui.updateInfoBox();
    Game.player.indentSelectedCard();

    Game.stage.update();
    if (Game.debug.active) {
      console.log(
        `Moved player hand cursor ${direction} -> Card index: ${Game.ui.selectedCardNumber}`
      );
    }
  },
  /**
   * Remove the player hand cursor
   */
  remove() {
    Game.ui.playerChoosingCard = false;
    Game.stage.removeChild(Game.player.playerHandCursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log("Player hand cursor removed");
    }
  },
};

// -------------------------
// GRID CURSOR
// -------------------------
Game.cursors.grid = {
  /**
   * Place the selection cursor on the grid
   */
  place() {
    Game.ui.playerSelectingPlacement = true;
    Game.ui.gridCursor.x =
      offsets.gameOffsetX + offsets.cellWidth + 16;
    Game.ui.gridCursor.y =
      offsets.gameOffsetY + offsets.cellHeight + 80;

    Game.stage.addChild(Game.ui.gridCursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log(
        `Grid cursor placed at X:${Game.ui.gridCursor.x}, Y:${Game.ui.gridCursor.y}`
      );
    }
  },
  /**
   * Move the grid cursor in one of four directions
   * @param {"left"|"up"|"right"|"down"} direction
   */
  move(direction) {
    const oldX = Game.ui.gridCursor.x;
    const oldY = Game.ui.gridCursor.y;

    if (
      direction === "left" &&
      Game.ui.gridCursor.x > offsets.gameOffsetX + 16
    ) {
      Game.ui.gridCursor.x -= offsets.cellWidth;
      Game.ui.selectedColumn--;
    } else if (
      direction === "up" &&
      Game.ui.gridCursor.y > offsets.gameOffsetY + 80
    ) {
      Game.ui.gridCursor.y -= offsets.cellHeight;
      Game.ui.selectedRow--;
    } else if (
      direction === "right" &&
      Game.ui.gridCursor.x <
        offsets.gameOffsetX + offsets.cellWidth * 2 + 16
    ) {
      Game.ui.gridCursor.x += offsets.cellWidth;
      Game.ui.selectedColumn++;
    } else if (
      direction === "down" &&
      Game.ui.gridCursor.y <
        offsets.gameOffsetY + offsets.cellHeight * 2 + 80
    ) {
      Game.ui.gridCursor.y += offsets.cellHeight;
      Game.ui.selectedRow++;
    } else {
      console.warn(`Cannot move grid cursor ${direction} - out of bounds`);
      return;
    }

    Game.board.checkSelectedSquare();
    Game.stage.update();

    if (Game.debug.active) {
      console.log(
        `Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${Game.ui.gridCursor.x}, Y:${Game.ui.gridCursor.y}`
      );
    }
  },
  /**
   * Remove the selection cursor from the grid
   */
  remove() {
    Game.ui.playerSelectingPlacement = false;
    Game.stage.removeChild(Game.ui.gridCursor);
    Game.stage.update();

    if (Game.debug.active) {
      console.log("Grid cursor removed");
    }
  },
};
