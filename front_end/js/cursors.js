// -------------------------
// PLAYER HAND SELECTION CURSOR
// -------------------------

/**
 * Place the small hand selection cursor at its initial position
 */
function placePlayerHandSelectionCursor() {
  playerHandSelectionCursor.x = selectionBoardBackground.x - 40;
  playerHandSelectionCursor.y = selectionBoardBackground.y + 48;

  selectionBoard.addChild(playerHandSelectionCursor);
  stage.update();

  console.log(`Player hand selection cursor placed at X:${playerHandSelectionCursor.x}, Y:${playerHandSelectionCursor.y}`);
}

/**
 * moveSelectionCursor - move selection cursor and update displayed card
 */
function moveSelectionCursor(direction) {
  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (
    direction == "down" &&
    ((page != totalPages && selectedHandCardNumber % 11 != 10) ||
      (page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateDisplayedCard();
  } else if (direction == "left" && page != 1) {
    page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    this.updateHandCards();
    this.updateDisplayedCard();
  } else if (direction == "right" && page != totalPages - 1) {
    if (page != totalPages) {
      page++;
      selectedHandCardNumber += 11;
      selectedHandCard = window.ownedCards[selectedHandCardNumber];
      this.updateHandCards();
      this.updateDisplayedCard();
    }
  } else if (direction == "right" && page == totalPages - 1) {
    page++;
    if (selectedHandCardNumber > window.ownedCards.length - 12) {
      var selectedHandCardNumberForPage = Math.floor(
        (selectedHandCardNumber % 11) + 1
      );
      playerHandSelectionCursor.y -=
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

  stage.update();
}

/**
 * Remove the hand selection cursor
 */
function removePlayerHandSelectionCursor() {
  stage.removeChild(playerHandSelectionCursor);
  stage.update();

  console.log("Player hand selection cursor removed");
}

/**
 * Move the hand selection cursor up/down/left/right
 */
function movePlayerHandSelectionCursor(direction) {
  let moved = false;

  if (direction == "up" && selectedHandCardNumber % 11 != 0) {
    playerHandSelectionCursor.y -= 35;
    selectedHandCardNumber -= 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (
    direction == "down" &&
    ((page != totalPages && selectedHandCardNumber % 11 != 10) ||
      (page == totalPages && selectedHandCardNumber % 11 < remainingCards - 1))
  ) {
    playerHandSelectionCursor.y += 35;
    selectedHandCardNumber += 1;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateDisplayedCard();
    moved = true;
  } else if (direction == "left" && page != 1) {
    page--;
    selectedHandCardNumber -= 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  } else if (direction == "right" && page != totalPages - 1) {
    page++;
    selectedHandCardNumber += 11;
    selectedHandCard = window.ownedCards[selectedHandCardNumber];
    updateHandCards();
    updateDisplayedCard();
    moved = true;
  }

  stage.update();

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

  stage.addChild(confirmationCursor);
  stage.update();

  console.log(`Confirmation cursor placed at X:${confirmationCursor.x}, Y:${confirmationCursor.y}`);
}

/**
 * Remove the confirmation cursor
 */
function removeConfirmationCursor() {
  stage.removeChild(confirmationCursor);
  stage.update();

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

  stage.update();
  console.log(`Confirmation cursor moved ${direction} -> Choice index: ${window.selectedConfirmationChoice}`);
}

// -------------------------
// PLAYER HAND CURSOR
// -------------------------

/**
 * Place the player hand cursor at its initial position
 */
function placePlayerHandCursor() {
  playerChoosingCard = true;
  playerHandCursor.x = playerHandOffsetX - 50;
  playerHandCursor.y =
    handOffsetY +
    (Game.ui.selectedCardNumber + 1 + playedPlayerCardCount) * (cardHeight / 2);

  stage.addChild(playerHandCursor);
  stage.update();

  console.log(`Player hand cursor placed at X:${playerHandCursor.x}, Y:${playerHandCursor.y}`);
}

/**
 * Remove the player hand cursor
 */
function removePlayerHandCursor() {
  playerChoosingCard = false;
  stage.removeChild(playerHandCursor);
  stage.update();

  console.log("Player hand cursor removed");
}

/**
 * Move the player hand cursor up/down
 * @param {"up"|"down"} direction
 */
function movePlayerHandCursor(direction) {
  if (direction === "up" && Game.ui.selectedCardNumber > 0) {
    playerHandCursor.y -= handCardOffset;
    Game.ui.selectedCardNumber--;
    cardsAboveSelection--;
  } else if (direction === "down" && Game.ui.selectedCardNumber < Game.player.cardsInPlayerHand.length - 1) {
    playerHandCursor.y += handCardOffset;
    Game.ui.selectedCardNumber++;
    cardsAboveSelection++;
  } else {
    console.warn(`Cannot move cursor ${direction} - out of bounds`);
    return;
  }

  previouslySelectedCard = Game.ui.selectedCard;
  Game.ui.selectedCard = Game.player.cardsInPlayerHand[Game.ui.selectedCardNumber];

  updateInfoBox();
  indentSelectedCard();

  stage.update();
  console.log(`Moved player hand cursor ${direction} -> Card index: ${Game.ui.selectedCardNumber}`);
}

// -------------------------
// GRID CURSOR
// -------------------------

/**
 * Place the selection cursor on the grid
 */
function placeGridCursor() {
  playerSelectingPlacement = true;
  gridCursor.x = gameOffsetX + cellWidth + 16;
  gridCursor.y = gameOffsetY + cellHeight + 80;

  stage.addChild(gridCursor);
  stage.update();

  console.log(`Grid cursor placed at X:${gridCursor.x}, Y:${gridCursor.y}`);
}

/**
 * Move the grid cursor in one of four directions
 * @param {"left"|"up"|"right"|"down"} direction
 */
function moveGridCursor(direction) {
  const oldX = gridCursor.x;
  const oldY = gridCursor.y;

  if (direction === "left" && gridCursor.x > gameOffsetX + 16) {
    gridCursor.x -= cellWidth;
    selectedColumn--;
  } else if (direction === "up" && gridCursor.y > gameOffsetY + 80) {
    gridCursor.y -= cellHeight;
    selectedRow--;
  } else if (direction === "right" && gridCursor.x < gameOffsetX + cellWidth * 2 + 16) {
    gridCursor.x += cellWidth;
    selectedColumn++;
  } else if (direction === "down" && gridCursor.y < gameOffsetY + cellHeight * 2 + 80) {
    gridCursor.y += cellHeight;
    selectedRow++;
  } else {
    console.warn(`Cannot move grid cursor ${direction} - out of bounds`);
    return;
  }

  checkSelectedSquare();
  stage.update();

  console.log(`Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${gridCursor.x}, Y:${gridCursor.y}`);
}

/**
 * Remove the selection cursor from the grid
 */
function removeGridCursor() {
  playerSelectingPlacement = false;
  stage.removeChild(gridCursor);
  stage.update();

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