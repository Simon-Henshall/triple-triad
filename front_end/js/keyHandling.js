// -------------------------
// KEY HANDLING
// -------------------------

function checkKey(e) {
  "use strict";
  e = e || window.event;
  if (playerSelectingHand) {
    // Left
    if (e.keyCode === 37) {
      movePlayerHandSelectionCursor("left");
      // Up
    } else if (e.keyCode === 38) {
      movePlayerHandSelectionCursor("up");
      // Right
    } else if (e.keyCode === 39) {
      movePlayerHandSelectionCursor("right");
      // Down
    } else if (e.keyCode === 40) {
      movePlayerHandSelectionCursor("down");
      // Enter
    } else if (e.keyCode === 13) {
      // Enter
      if (displayedCards[selectedHandCardNumber].count > 0) {
        displayedCards[selectedHandCardNumber].count--;
        playerCards.push(selectedHandCard);
        updateHandCards();
      }
      if (playerCards.length === 5) {
        playerSelectingHand = false;
        displayConfirmationBox();
      }
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      // Esc / Backspace
      if (playerCards.length > 0) {
        playerCards[playerCards.length - 1].count++;
        updateHandCards();
        playerCards.pop();
      }
    }
  } else if (playerConfirming) {
    // Up
    if (e.keyCode === 38) {
      moveConfirmationCursor("up");
      // Down
    } else if (e.keyCode === 40) {
      moveConfirmationCursor("down");
      // Enter
    } else if (e.keyCode === 13 && selectedConfirmationChoice == 0) {
      stage.removeChild(selectionBoard);
      stage.removeChild(confirmation);
      removeConfirmationCursor();
      startGame();
      // Backspace, Esc, And 'No'
    } else if (
      e.keyCode === 27 ||
      e.keyCode === 8 ||
      (e.keyCode === 13 && selectedConfirmationChoice == 1)
    ) {
      for (let i = 0; i < 5; i++) {
        playerCards[playerCards.length - 1].count++;
        updateHandCards();
        playerCards.pop();
      }
      stage.removeChild(confirmation);
      moveConfirmationCursor("up");
      removeConfirmationCursor();
      playerSelectingHand = true;
    }
  } else if (playerChoosingCard) {
    // Up
    if (e.keyCode === 38) {
      movePlayerHandCursor("up");
      // Down
    } else if (e.keyCode === 40) {
      movePlayerHandCursor("down");
      // Enter
    } else if (e.keyCode === 13) {
      removePlayerHandCursor();
      placeGridCursor();
      selectedRow = 2;
      selectedColumn = 2;
      stage.removeChild(playerHandCursor);
    }
  } else if (playerSelectingPlacement) {
    infoBox.visible = false;
    // Left
    if (e.keyCode === 37) {
      moveGridCursor("left");
      // Up
    } else if (e.keyCode === 38) {
      moveGridCursor("up");
      // Right
    } else if (e.keyCode === 39) {
      moveGridCursor("right");
      // Down
    } else if (e.keyCode === 40) {
      moveGridCursor("down");
      // Enter
    } else if (e.keyCode === 13) {
      if (!cellOccupied()) {
        cardsInPlayerHand.splice(selectedCardNumber, 1);
        removeGridCursor();
        CardPlacer.placeCard(
          selectedCard,
          gameOffsetX + cellWidth * (selectedColumn - 1) + cardOffsetX,
          gameOffsetY + cellHeight * (selectedRow - 1) + cardOffsetY
        );
      }
      // Backspace And Esc
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      removeGridCursor();
      placePlayerHandCursor();
    }
  }
}
