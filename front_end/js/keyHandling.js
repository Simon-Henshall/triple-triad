// -------------------------
// KEY HANDLING
// -------------------------

function checkKey(e) {
  "use strict";
  e = e || window.event;
  if (Game.ui.playerSelectingHand) {
    // Left
    if (e.keyCode === 37) {
      Game.cursors.selection.move("left");
      // Up
    } else if (e.keyCode === 38) {
      Game.cursors.selection.move("up");
      // Right
    } else if (e.keyCode === 39) {
      Game.cursors.selection.move("right");
      // Down
    } else if (e.keyCode === 40) {
      Game.cursors.selection.move("down");
      // Enter
    } else if (e.keyCode === 13) {
      // Enter
      if (Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count > 0) {
        Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count--;
        Game.player.playerCards.push(Game.ui.selectedHandCard);
        Game.player.cardManagerInstance.updateHandCards();
      }
      if (Game.player.playerCards.length === 5) {
        Game.ui.playerSelectingHand = false;
        displayConfirmationBox();
      }
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      // Esc / Backspace
      if (Game.player.playerCards.length > 0) {
        Game.player.playerCards[Game.player.playerCards.length - 1].count++;
        Game.player.cardManagerInstance.updateHandCards();
        Game.player.playerCards.pop();
      }
    }
  } else if (Game.ui.playerConfirming) {
    // Up
    if (e.keyCode === 38) {
      Game.cursors.confirmation.move("up");
      // Down
    } else if (e.keyCode === 40) {
      Game.cursors.confirmation.move("down");
      // Enter
    } else if (e.keyCode === 13 && Game.ui.selectedConfirmationChoice == 0) {
      Game.stage.removeChild(Game.ui.selectionBoard);
      Game.stage.removeChild(Game.ui.confirmation);
      Game.cursors.confirmation.remove();
      Game.startGame();
      // Backspace, Esc, And 'No'
    } else if (
      e.keyCode === 27 ||
      e.keyCode === 8 ||
      (e.keyCode === 13 && Game.ui.selectedConfirmationChoice == 1)
    ) {
      for (let i = 0; i < 5; i++) {
        Game.player.playerCards[Game.player.playerCards.length - 1].count++;
        Game.player.cardManagerInstance.updateHandCards();
        Game.player.playerCards.pop();
      }
      Game.stage.removeChild(Game.ui.confirmation);
      Game.cursors.confirmation.move("up");
      Game.cursors.confirmation.remove();
      Game.ui.playerSelectingHand = true;
    }
  } else if (Game.ui.playerChoosingCard) {
    // Up
    if (e.keyCode === 38) {
      Game.cursors.playerHand.move("up");
      // Down
    } else if (e.keyCode === 40) {
      Game.cursors.playerHand.move("down");
      // Enter
    } else if (e.keyCode === 13) {
      Game.cursors.playerHand.remove();
      Game.cursors.grid.place();
      Game.ui.selectedRow = 2;
      Game.ui.selectedColumn = 2;
      Game.stage.removeChild(Game.player.playerHandCursor);
    }
  } else if (Game.ui.playerSelectingPlacement) {
    Game.ui.infoBox.visible = false;
    // Left
    if (e.keyCode === 37) {
      Game.cursors.grid.move("left");
      // Up
    } else if (e.keyCode === 38) {
      Game.cursors.grid.move("up");
      // Right
    } else if (e.keyCode === 39) {
      Game.cursors.grid.move("right");
      // Down
    } else if (e.keyCode === 40) {
      Game.cursors.grid.move("down");
      // Enter
    } else if (e.keyCode === 13) {
      if (!Game.board.cellOccupied()) {
        Game.player.cardsInPlayerHand.splice(Game.ui.selectedCardNumber, 1);
        Game.cursors.grid.remove();
        Game.cards.placement.placeCard(
          Game.ui.selectedCard,
          Game.offsets.gameOffsetX + Game.offsets.cellWidth * (Game.ui.selectedColumn - 1) + Game.offsets.cardOffsetX,
          Game.offsets.gameOffsetY + Game.offsets.cellHeight * (Game.ui.selectedRow - 1) + Game.offsets.cardOffsetY
        );
      }
      // Backspace And Esc
    } else if (e.keyCode === 27 || e.keyCode === 8) {
      Game.cursors.grid.remove();
      Game.cursors.playerHand.place();
    }
  }
}
