// -------------------------
// KEY HANDLING
// -------------------------

function checkKey(e) {
  e = e || window.event;

  // -------------------------
  // Player Selecting Hand
  // -------------------------
  if (Game.ui.playerSelectingHand) {
    // Left
    if (e.keyCode === 37) moveSelectionCursor("left");
    // Up
    else if (e.keyCode === 38) moveSelectionCursor("up");
    // Right
    else if (e.keyCode === 39) moveSelectionCursor("right");
    // Down
    else if (e.keyCode === 40) moveSelectionCursor("down");
    // Enter
    else if (e.keyCode === 13) {
      const card =
      Game.player.cardsInPlayerHand?.[Game.ui.selectedHandCardNumber] || null;
      if (!card) return; // ignore if no card is selected
      if (card.count > 0) {
        card.count--;
        Game.player.playerCards.push(Game.ui.selectedHandCard);
        updateHandCards();
      }
      if (Game.player.playerCards.length === 5) {
        Game.ui.playerSelectingHand = false;
        displayConfirmationBox();
      }
    }
    // Esc / Backspace
    else if (e.keyCode === 27 || e.keyCode === 8) {
      if (Game.player.playerCards.length > 0) {
        const lastCard = Game.player.playerCards.pop();
        lastCard.count++;
        updateHandCards();
      }
    }
  }

  // -------------------------
  // Player Confirming
  // -------------------------
  else if (Game.ui.playerConfirming) {
    if (e.keyCode === 38) moveConfirmationCursor("up");
    else if (e.keyCode === 40) moveConfirmationCursor("down");
    else if (e.keyCode === 13 && Game.ui.selectedConfirmationChoice === 0) {
      Game.stage.removeChild(Game.ui.selectionBoard);
      Game.stage.removeChild(Game.ui.confirmation);
      removeConfirmationCursor();
      Game.startGame();
    } else if (
      e.keyCode === 27 ||
      e.keyCode === 8 ||
      (e.keyCode === 13 && Game.ui.selectedConfirmationChoice === 1)
    ) {
      for (let i = 0; i < 5; i++) {
        const lastCard = Game.player.playerCards.pop();
        lastCard.count++;
        updateHandCards();
      }
      Game.stage.removeChild(Game.ui.confirmation);
      moveConfirmationCursor("up");
      removeConfirmationCursor();
      Game.ui.playerSelectingHand = true;
    }
  }

  // -------------------------
  // Player Choosing Card
  // -------------------------
  else if (Game.ui.playerChoosingCard) {
    if (e.keyCode === 38) movePlayerHandCursor("up");
    else if (e.keyCode === 40) movePlayerHandCursor("down");
    else if (e.keyCode === 13) {
      removePlayerHandCursor();
      placeGridCursor();
      Game.ui.selectedRow = 2;
      Game.ui.selectedColumn = 2;
      Game.stage.removeChild(Game.player.playerHandCursor);
    }
  }

  // -------------------------
  // Player Selecting Placement
  // -------------------------
  else if (Game.ui.playerSelectingPlacement) {
    Game.ui.infoBox.visible = false;

    if (e.keyCode === 37) moveGridCursor("left");
    else if (e.keyCode === 38) moveGridCursor("up");
    else if (e.keyCode === 39) moveGridCursor("right");
    else if (e.keyCode === 40) moveGridCursor("down");
    else if (e.keyCode === 13) {
      if (!cellOccupied()) {
        Game.player.cardsInPlayerHand.splice(Game.ui.selectedHandCardNumber, 1);
        removeGridCursor();
        CardPlacer.placeCard(
          Game.ui.selectedHandCard,
          Game.offsets.gameOffsetX + Game.offsets.cellWidth * (Game.ui.selectedColumn - 1) + Game.offsets.cardOffsetX,
          Game.offsets.gameOffsetY + Game.offsets.cellHeight * (Game.ui.selectedRow - 1) + Game.offsets.cardOffsetY
        );
      }
    }
    else if (e.keyCode === 27 || e.keyCode === 8) {
      removeGridCursor();
      placePlayerHandCursor();
    }
  }
}
