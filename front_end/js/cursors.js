// -------------------------
// PLAYER HAND SELECTION CURSOR
// -------------------------

/**
 * Place the small hand selection cursor at its initial position
 */
function placePlayerHandSelectionCursor() {
  Game.player.playerHandSelectionCursor.x = Game.ui.selectionBoardBackground.x - 40;
  Game.player.playerHandSelectionCursor.y = Game.ui.selectionBoardBackground.y + 48;

  Game.ui.selectionBoard.addChild(Game.player.playerHandSelectionCursor);
  Game.stage.update();

  console.log(`Player hand selection cursor placed at X:${Game.player.playerHandSelectionCursor.x}, Y:${Game.player.playerHandSelectionCursor.y}`);
}

/**
 * moveSelectionCursor - move selection cursor and update displayed card
 */
function moveSelectionCursor(direction) {
  if (direction == "up" && Game.ui.selectedHandCardNumber % 11 != 0) {
    Game.player.playerHandSelectionCursor.y -= 35;
    Game.ui.selectedHandCardNumber -= 1;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((Game.ui.page != totalPages && Game.ui.selectedHandCardNumber % 11 != 10) ||
      (Game.ui.page == totalPages && Game.ui.selectedHandCardNumber % 11 < Game.ui.remainingCards - 1))
  ) {
    Game.player.playerHandSelectionCursor.y += 35;
    Game.ui.selectedHandCardNumber += 1;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (direction == "left" && Game.ui.page != 1) {
    Game.ui.page--;
    Game.ui.selectedHandCardNumber -= 11;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    this.updateHandCards();
    this.updateDisplayedCard();
  } else if (direction == "right" && Game.ui.page != Game.ui.totalPages - 1) {
    if (Game.ui.page != totalPages) {
      Game.ui.page++;
      Game.ui.selectedHandCardNumber += 11;
      Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
      this.updateHandCards();
      this.updateDisplayedCard();
    }
  } else if (direction == "right" && Game.ui.page == Game.ui.totalPages - 1) {
    Game.ui.page++;
    if (Game.ui.selectedHandCardNumber > Game.player.ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (Game.ui.selectedHandCardNumber % 11) + 1
      );
      Game.player.playerHandSelectionCursor.y -=
        35 * (selectedHandCardNumberForPage - Game.ui.remainingCards);
      Game.ui.selectedHandCardNumber = Game.player.ownedCards.length - 1;
      Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    } else {
      Game.ui.selectedHandCardNumber += 11;
      Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    }
    this.updateHandCards();
    this.updateDisplayedCard();
  }

  Game.stage.update();
}

/**
 * Remove the hand selection cursor
 */
function removePlayerHandSelectionCursor() {
  Game.stage.removeChild(Game.player.playerHandSelectionCursor);
  Game.stage.update();

  console.log("Player hand selection cursor removed");
}

/**
 * Move the hand selection cursor up/down/left/right
 */
function movePlayerHandSelectionCursor(direction) {
  let moved = false;

  if (direction == "up" && Game.ui.selectedHandCardNumber % 11 != 0) {
    Game.player.playerHandSelectionCursor.y -= 35;
    Game.ui.selectedHandCardNumber -= 1;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (
    direction == "down" &&
    ((Game.ui.page != Game.ui.totalPages && Game.ui.selectedHandCardNumber % 11 != 10) ||
      (Game.ui.page == Game.ui.totalPages && Game.ui.selectedHandCardNumber % 11 < Game.ui.remainingCards - 1))
  ) {
    Game.player.playerHandSelectionCursor.y += 35;
    Game.ui.selectedHandCardNumber += 1;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (direction == "left" && Game.ui.page != 1) {
    Game.ui.page--;
    Game.ui.selectedHandCardNumber -= 11;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  } else if (direction == "right" && Game.ui.page != Game.ui.totalPages - 1) {
    Game.ui.page++;
    Game.ui.selectedHandCardNumber += 11;
    Game.ui.selectedHandCard = Game.player.ownedCards[Game.ui.selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  }

  Game.stage.update();

  if (moved) {
    console.log(`Moved hand selection cursor ${direction} -> Card index: ${Game.ui.selectedHandCardNumber}`);
  } else {
    console.warn(`Cannot move hand selection cursor ${direction} - out of bounds`);
  }
}

// -------------------------
// CONFIRMATION CURSOR
// -------------------------

/**
 * Place the confirmation cursor at the default position
 */
function placeConfirmationCursor() {
  Game.ui.confirmationCursor.x = Game.ui.confirmationBackground.x + 50;
  Game.ui.confirmationCursor.y = Game.ui.confirmationBackground.y + 60;

  Game.stage.addChild(Game.ui.confirmationCursor);
  Game.stage.update();

  console.log(`Confirmation cursor placed at X:${Game.ui.confirmationCursor.x}, Y:${Game.ui.confirmationCursor.y}`);
}

/**
 * Remove the confirmation cursor
 */
function removeConfirmationCursor() {
  Game.stage.removeChild(Game.ui.confirmationCursor);
  Game.stage.update();

  console.log("Confirmation cursor removed");
}

/**
 * Move the confirmation cursor up/down between Yes/No
 */
function moveConfirmationCursor(direction) {
  if (direction == "up" && Game.ui.selectedConfirmationChoice != 0) {
    Game.ui.confirmationCursor.y -= 30;
    Game.ui.selectedConfirmationChoice -= 1;
  } else if (direction == "down" && Game.ui.selectedConfirmationChoice != 1) {
    Game.ui.confirmationCursor.y += 30;
    Game.ui.selectedConfirmationChoice += 1;
  }

  Game.stage.update();
  console.log(`Confirmation cursor moved ${direction} -> Choice index: ${Game.ui.selectedConfirmationChoice}`);
}

// -------------------------
// PLAYER HAND CURSOR
// -------------------------

/**
 * Place the player hand cursor at its initial position
 */
function placePlayerHandCursor() {
  Game.ui.playerChoosingCard = true;
  Game.player.playerHandCursor.x = Game.player.handOffsetX - 50;
  Game.player.playerHandCursor.y =
    Game.offsets.handOffsetY +
    (Game.ui.selectedCardNumber + 1 + Game.player.playedPlayerCardCount) * (Game.offsets.cardHeight / 2);

  Game.stage.addChild(Game.player.playerHandCursor);
  Game.stage.update();

  console.log(`Player hand cursor placed at X:${Game.player.playerHandCursor.x}, Y:${Game.player.playerHandCursor.y}`);
}

/**
 * Remove the player hand cursor
 */
function removePlayerHandCursor() {
  Game.ui.playerChoosingCard = false;
  Game.stage.removeChild(Game.player.playerHandCursor);
  Game.stage.update();

  console.log("Player hand cursor removed");
}

/**
 * Move the player hand cursor up/down
 * @param {"up"|"down"} direction
 */
function movePlayerHandCursor(direction) {
  if (direction === "up" && Game.ui.selectedCardNumber > 0) {
    Game.player.playerHandCursor.y -= Game.offsets.handCardOffset;
    Game.ui.selectedCardNumber--;
    Game.player.cardsAboveSelection--;
  } else if (direction === "down" && Game.ui.selectedCardNumber < Game.player.cardsInPlayerHand.length - 1) {
    Game.player.playerHandCursor.y += Game.offsets.handCardOffset;
    Game.ui.selectedCardNumber++;
    Game.player.cardsAboveSelection++;
  } else {
    console.warn(`Cannot move cursor ${direction} - out of bounds`);
    return;
  }

  Game.ui.previouslySelectedCard = Game.ui.selectedCard;
  Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];

  updateInfoBox();
  Game.player.indentSelectedCard();

  Game.stage.update();
  console.log(`Moved player hand cursor ${direction} -> Card index: ${Game.ui.selectedCardNumber}`);
}

// -------------------------
// GRID CURSOR
// -------------------------

/**
 * Place the selection cursor on the grid
 */
function placeGridCursor() {
  Game.ui.playerSelectingPlacement = true;
  Game.ui.gridCursor.x = Game.offsets.gameOffsetX + Game.offsets.cellWidth + 16;
  Game.ui.gridCursor.y = Game.offsets.gameOffsetY + Game.offsets.cellHeight + 80;

  Game.stage.addChild(Game.ui.gridCursor);
  Game.stage.update();

  console.log(`Grid cursor placed at X:${Game.ui.gridCursor.x}, Y:${Game.ui.gridCursor.y}`);
}

/**
 * Move the grid cursor in one of four directions
 * @param {"left"|"up"|"right"|"down"} direction
 */
function moveGridCursor(direction) {
  const oldX = Game.ui.gridCursor.x;
  const oldY = Game.ui.gridCursor.y;

  if (direction === "left" && Game.ui.gridCursor.x > Game.offsets.gameOffsetX + 16) {
    Game.ui.gridCursor.x -= Game.offsets.cellWidth;
    Game.ui.selectedColumn--;
  } else if (direction === "up" && Game.ui.gridCursor.y > Game.offsets.gameOffsetY + 80) {
    Game.ui.gridCursor.y -= Game.offsets.cellHeight;
    Game.ui.selectedRow--;
  } else if (direction === "right" && Game.ui.gridCursor.x < Game.offsets.gameOffsetX + Game.offsets.cellWidth * 2 + 16) {
    Game.ui.gridCursor.x += Game.offsets.cellWidth;
    Game.ui.selectedColumn++;
  } else if (direction === "down" && Game.ui.gridCursor.y < Game.offsets.gameOffsetY + Game.offsets.cellHeight * 2 + 80) {
    Game.ui.gridCursor.y += Game.offsets.cellHeight;
    Game.ui.selectedRow++;
  } else {
    console.warn(`Cannot move grid cursor ${direction} - out of bounds`);
    return;
  }

  Game.board.checkSelectedSquare();
  Game.stage.update();

  console.log(`Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${Game.ui.gridCursor.x}, Y:${Game.ui.gridCursor.y}`);
}

/**
 * Remove the selection cursor from the grid
 */
function removeGridCursor() {
  Game.ui.playerSelectingPlacement = false;
  Game.stage.removeChild(Game.ui.gridCursor);
  Game.stage.update();

  console.log("Grid cursor removed");
}

// -------------------------
// GLOBAL / BACKWARDS-COMPATIBLE EXPORTS
// -------------------------
window.placePlayerHandSelectionCursor = placePlayerHandSelectionCursor;
window.movePlayerHandSelectionCursor = movePlayerHandSelectionCursor;

window.placeConfirmationCursor = placeConfirmationCursor;
window.moveConfirmationCursor = moveConfirmationCursor;

window.placePlayerHandCursor = placePlayerHandCursor;
window.movePlayerHandCursor = movePlayerHandCursor;
window.removePlayerHandCursor = removePlayerHandCursor;

window.placeGridCursor = placeGridCursor;
window.moveGridCursor = moveGridCursor;
window.removeGridCursor = removeGridCursor;