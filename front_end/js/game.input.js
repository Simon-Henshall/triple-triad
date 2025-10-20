// -------------------------
// GAME INPUT HANDLING
// -------------------------
Game.input = {
  /**
   * Handle keydown events and delegate to game modules.
   * @param {KeyboardEvent} e
   */
  checkKey(e) {
    "use strict";

    if (Game.ui.playerSelectingHand) {
      Game.input._handlePlayerHandSelection(e);
    } else if (Game.ui.playerConfirming) {
      Game.input._handleConfirmation(e);
    } else if (Game.ui.playerChoosingCard) {
      Game.input._handlePlayerCardChoice(e);
    } else if (Game.ui.playerSelectingPlacement) {
      Game.input._handlePlacement(e);
    }
  },

  /** @private */
  _isCancelKey: (key) => key === "Backspace" || key === "Escape",

  /** @private */
  _handleArrowKeys: (key, callbacks) => {
    switch (key) {
      case "ArrowLeft":
        if (callbacks.left) callbacks.left();
        break;
      case "ArrowUp":
        if (callbacks.up) callbacks.up();
        break;
      case "ArrowRight":
        if (callbacks.right) callbacks.right();
        break;
      case "ArrowDown":
        if (callbacks.down) callbacks.down();
        break;
    }
  },

  /** @private */
  _handlePlayerHandSelection(e) {
    // Use helper for arrow keys
    Game.input._handleArrowKeys(e.key, {
      left: () => Game.cursors.selection.move("left"),
      up: () => Game.cursors.selection.move("up"),
      right: () => Game.cursors.selection.move("right"),
      down: () => Game.cursors.selection.move("down"),
    });

    // Enter key
    if (e.key === "Enter") {
      const card = Game.ui.selectionBoard.displayedCards[Game.ui.selectionBoard.selectedHandCardNumber];
      if (card.count > 0) {
        card.count--;
        Game.player.playerCards.push(Game.ui.selectionBoard.selectedHandCard);
        Game.player.cardManagerInstance.updateHandCards();
      }
      if (Game.player.playerCards.length === 5) {
        Game.ui.playerSelectingHand = false;
        Game.ui.confirmationBox.show();
      }
    }

    // Cancel key
    else if (this._isCancelKey(e.key)) {
      if (Game.player.playerCards.length > 0) {
        const lastCard = Game.player.playerCards.pop();
        lastCard.count++;
        Game.player.cardManagerInstance.updateHandCards();
      }
    }
  },

  /** @private */
  _handleConfirmation(e) {
    Game.input._handleArrowKeys(e.key, {
      up: () => Game.cursors.confirmation.move("up"),
      down: () => Game.cursors.confirmation.move("down"),
    });

    if (e.key === "Enter" && Game.ui.confirmation.selectedChoice === 0) {
      Game.stage.removeChild(Game.ui.selectionBoard.container);
      Game.stage.removeChild(Game.ui.confirmation.container);
      Game.cursors.confirmation.remove();
      Game.startGame();
    } else if (
      this._isCancelKey(e.key) ||
      (e.key === "Enter" && Game.ui.confirmation.selectedChoice === 1)
    ) {
      for (let i = 0; i < 5; i++) {
        const lastCard = Game.player.playerCards.pop();
        lastCard.count++;
        Game.player.cardManagerInstance.updateHandCards();
      }
      Game.stage.removeChild(Game.ui.confirmation.container);
      Game.cursors.confirmation.remove();
      Game.ui.playerSelectingHand = true;
    }
  },

  /** @private */
  _handlePlayerCardChoice(e) {
    Game.input._handleArrowKeys(e.key, {
      up: () => Game.cursors.playerHand.move("up"),
      down: () => Game.cursors.playerHand.move("down"),
    });

    if (e.key === "Enter") {
      Game.cursors.playerHand.remove();
      Game.cursors.grid.place();
      Game.ui.selectedRow = 2;
      Game.ui.selectedColumn = 2;
      Game.stage.removeChild(Game.player.playerHandCursor);
    }
  },

  /** @private */
  _handlePlacement(e) {
    Game.ui.infoBox.container.visible = false;

    Game.input._handleArrowKeys(e.key, {
      left: () => Game.cursors.grid.move("left"),
      up: () => Game.cursors.grid.move("up"),
      right: () => Game.cursors.grid.move("right"),
      down: () => Game.cursors.grid.move("down"),
    });

    if (e.key === "Enter") {
      if (!Game.board.cellOccupied()) {
        Game.player.cardsInPlayerHand.splice(Game.ui.selectedCardNumber, 1);
        Game.cursors.grid.remove();
        Game.cards.placement.placeCard(
          Game.ui.selectedCard,
          Game.offsets.gameOffsetX +
            Game.offsets.cellWidth * (Game.ui.selectedColumn - 1) +
            Game.offsets.cardOffsetX,
          Game.offsets.gameOffsetY +
            Game.offsets.cellHeight * (Game.ui.selectedRow - 1) +
            Game.offsets.cardOffsetY
        );
      }
    } else if (this._isCancelKey(e.key)) {
      Game.cursors.grid.remove();
      Game.cursors.playerHand.place();
    }
  },
};
