// -------------------------
// PLAYER HAND SELECTION CURSOR
// -------------------------

/**
 * Place the small hand selection cursor at its initial position
 */
function placePlayerHandSelectionCursor() {
  Game.player.playerHandSelectionCursor.x = selectionBoardBackground.x - 40;
  Game.player.playerHandSelectionCursor.y = selectionBoardBackground.y + 48;

  Game.ui.selectionBoard.addChild(Game.player.playerHandSelectionCursor);
  Game.stage.update();

  console.log(`Player hand selection cursor placed at X:${Game.player.playerHandSelectionCursor.x}, Y:${Game.player.playerHandSelectionCursor.y}`);
}

/**
 * moveSelectionCursor - move selection cursor and update displayed card
 */
function moveSelectionCursor(direction) {
  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    Game.player.playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((Game.ui.page != totalPages && selectedHandCardNumber % 11 != 10) ||
      (Game.ui.page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    Game.player.playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (direction == "left" && Game.ui.page != 1) {
    Game.ui.page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateHandCards();
    this.updateDisplayedCard();
  } else if (direction == "right" && Game.ui.page != Game.ui.totalPages - 1) {
    if (Game.ui.page != totalPages) {
      Game.ui.page++;
      selectedHandCardNumber += 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateHandCards();
      this.updateDisplayedCard();
    }
  } else if (direction == "right" && Game.ui.page == Game.ui.totalPages - 1) {
    Game.ui.page++;
    if (selectedHandCardNumber > window.ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (selectedHandCardNumber % 11) + 1
      );
      Game.player.playerHandSelectionCursor.y -=
        35 * (selectedHandCardNumberForPage - remainingCards);
      selectedHandCardNumber = window.ownedCards.length - 1;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
    } else {
      selectedHandCardNumber += 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
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

  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    Game.player.playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (
    direction == "down" &&
    ((Game.ui.page != Game.ui.totalPages && selectedHandCardNumber % 11 != 10) ||
      (Game.ui.page == Game.ui.totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    Game.player.playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (direction == "left" && Game.ui.page != 1) {
    Game.ui.page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  } else if (direction == "right" && Game.ui.page != Game.ui.totalPages - 1) {
    Game.ui.page++;
    selectedHandCardNumber += 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  }

  Game.stage.update();

  if (moved) {
    console.log(`Moved hand selection cursor ${direction} -> Card index: ${selectedHandCardNumber}`);
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
  confirmationCursor.x = confirmationBackground.x + 50;
  confirmationCursor.y = confirmationBackground.y + 60;

  Game.stage.addChild(confirmationCursor);
  Game.stage.update();

  console.log(`Confirmation cursor placed at X:${confirmationCursor.x}, Y:${confirmationCursor.y}`);
}

/**
 * Remove the confirmation cursor
 */
function removeConfirmationCursor() {
  Game.stage.removeChild(confirmationCursor);
  Game.stage.update();

  console.log("Confirmation cursor removed");
}

/**
 * Move the confirmation cursor up/down between Yes/No
 */
function moveConfirmationCursor(direction) {
  if (direction == "up" && window.selectedConfirmationChoice != 0) {
    confirmationCursor.y -= 30;
    window.selectedConfirmationChoice -= 1;
  } else if (direction == "down" && window.selectedConfirmationChoice != 1) {
    confirmationCursor.y += 30;
    window.selectedConfirmationChoice += 1;
  }

  Game.stage.update();
  console.log(`Confirmation cursor moved ${direction} -> Choice index: ${window.selectedConfirmationChoice}`);
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
    (Game.ui.selectedCardNumber + 1 + playedPlayerCardCount) * (Game.offsets.cardHeight / 2);

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
  indentSelectedCard();

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

  checkSelectedSquare();
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