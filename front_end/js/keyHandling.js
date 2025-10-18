// -------------------------
// KEY HANDLING
// -------------------------

function checkKey(e) {
  "use strict";
  e = e || window.event;
  if (Game.ui.playerSelectingHand) {
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
      if (Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count > 0) {
        Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count--;
        Game.player.playerCards.push(Game.ui.selectedHandCard);
        updateHandCards();
      }
      if (Game.player.playerCards.length === 5) {
        Game.ui.playerSelectingHand = false;
        displayConfirmationBox();
      }
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      // Esc / Backspace
      if (Game.player.playerCards.length > 0) {
        Game.player.playerCards[Game.player.playerCards.length - 1].count++;
        updateHandCards();
        Game.player.playerCards.pop();
      }
    }
  } else if (Game.ui.playerConfirming) {
    // Up
    if (e.keyCode === 38) {
      moveConfirmationCursor("up");
      // Down
    } else if (e.keyCode === 40) {
      moveConfirmationCursor("down");
      // Enter
    } else if (e.keyCode === 13 && Game.ui.selectedConfirmationChoice == 0) {
      Game.stage.removeChild(Game.ui.selectionBoard);
      Game.stage.removeChild(Game.ui.confirmation);
      removeConfirmationCursor();
      Game.startGame();
      // Backspace, Esc, And 'No'
    } else if (
      e.keyCode === 27 ||
      e.keyCode === 8 ||
      (e.keyCode === 13 && Game.ui.selectedConfirmationChoice == 1)
    ) {
      for (let i = 0; i < 5; i++) {
        Game.player.playerCards[Game.player.playerCards.length - 1].count++;
        updateHandCards();
        Game.player.playerCards.pop();
      }
      Game.stage.removeChild(Game.ui.confirmation);
      moveConfirmationCursor("up");
      removeConfirmationCursor();
      Game.ui.playerSelectingHand = true;
    }
  } else if (Game.ui.playerChoosingCard) {
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
      Game.ui.selectedRow = 2;
      Game.ui.selectedColumn = 2;
      Game.stage.removeChild(Game.player.playerHandCursor);
    }
  } else if (Game.ui.playerSelectingPlacement) {
    Game.ui.infoBox.visible = false;
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
        Game.player.cardsInPlayerHand.splice(Game.ui.selectedCardNumber, 1);
        removeGridCursor();
        CardPlacer.placeCard(
          Game.ui.selectedCard,
          Game.offsets.gameOffsetX + Game.offsets.cellWidth * (Game.ui.selectedColumn - 1) + Game.offsets.cardOffsetX,
          Game.offsets.gameOffsetY + Game.offsets.cellHeight * (Game.ui.selectedRow - 1) + Game.offsets.cardOffsetY
        );
      }
      // Backspace And Esc
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      removeGridCursor();
      placePlayerHandCursor();
    }
  }
}
