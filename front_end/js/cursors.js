// Place The Player Hand Cursor
function placePlayerHandCursor() {
  playerChoosingCard = true;
  playerHandCursor.x = playerHandOffsetX - 50;
  playerHandCursor.y =
    handOffsetY +
    (selectedCardNumber + 1 + playedPlayerCardCount) * (cardHeight / 2);
  stage.addChild(playerHandCursor);
  stage.update();
}

// Remove The Player Hand Cursor
function removePlayerHandCursor() {
  playerChoosingCard = false;
  stage.removeChild(playerHandCursor);
  stage.update();
}

// Move The Player Hand Cursor
function movePlayerHandCursor(direction) {
  if (direction === "up" && selectedCardNumber > 0) {
    playerHandCursor.y -= handCardOffset;
    selectedCardNumber--;
    cardsAboveSelection--;
    previouslySelectedCard = selectedCard;
    selectedCard = cardsInPlayerHand[selectedCardNumber];
    updateInfoBox();
    indentSelectedCard();
  } else if (
    direction === "down" &&
    selectedCardNumber < cardsInPlayerHand.length - 1
  ) {
    playerHandCursor.y += handCardOffset;
    selectedCardNumber++;
    cardsAboveSelection++;
    previouslySelectedCard = selectedCard;
    selectedCard = cardsInPlayerHand[selectedCardNumber];
    updateInfoBox();
    indentSelectedCard();
  }
  stage.update();
}

// -------------------------
// GRID CURSOR
// -------------------------

function placeGridCursor() {
  playerSelectingPlacement = true;
  gridCursor.x = gameOffsetX + cellWidth + 16;
  gridCursor.y = gameOffsetY + cellHeight + 80;
  stage.addChild(gridCursor);
  stage.update();
}

// Remove The Selection Cursor From The Grid
function removeGridCursor() {
  playerSelectingPlacement = false;
  stage.removeChild(gridCursor);
  stage.update();
}

// Move The Selection Cursor
function moveGridCursor(direction) {
  if (direction === "left" && gridCursor.x > gameOffsetX + 16) {
    gridCursor.x -= cellWidth;
    selectedColumn--;
  } else if (direction === "up" && gridCursor.y > gameOffsetY + 80) {
    gridCursor.y -= cellHeight;
    selectedRow--;
  } else if (
    direction === "right" &&
    gridCursor.x < gameOffsetX + cellWidth * 2 + 16
  ) {
    gridCursor.x += cellWidth;
    selectedColumn++;
  } else if (
    direction === "down" &&
    gridCursor.y < gameOffsetY + cellHeight * 2 + 80
  ) {
    gridCursor.y += cellHeight;
    selectedRow++;
  }
  checkSelectedSquare();
  stage.update();
}
