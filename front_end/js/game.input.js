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
    // routing for arrow keys (left/up/right/down)
    Game.input._handleArrowKeys(e.key, {
      left: () => Game.cursors.selection.move("left"),
      up: () => Game.cursors.selection.move("up"),
      right: () => Game.cursors.selection.move("right"),
      down: () => Game.cursors.selection.move("down"),
    });

    const sb = Game.ui.selectionBoard;

    // ENTER: select the currently highlighted card (uses absolute index into ownedCards)
    if (e.key === "Enter") {
      const index = sb.selectedHandCardNumber;
      const card = Game.player.ownedCards[index];

      if (!card) {
        console.warn("No card at selected index:", index);
        return;
      }

      if (card.count > 0) {
        card.count--;
        // store the card object in the player's temporary selection
        Game.player.playerCards.push(card);

        // update visuals / counts on the selection board
        if (
          Game.player.cardManagerInstance &&
          typeof Game.player.cardManagerInstance.updateHandCards === "function"
        ) {
          Game.player.cardManagerInstance.updateHandCards();
        } else {
          // fallback: repopulate the selection board if manager missing
          if (
            Game.cards &&
            Game.cards.selectionBoard &&
            typeof Game.cards.selectionBoard.populate === "function"
          ) {
            Game.cards.selectionBoard.populate();
          }
        }

        // refresh the preview (in case it needs to show updated count/visuals)
        sb.selectedHandCard =
          Game.player.ownedCards[sb.selectedHandCardNumber] || null;
        if (
          Game.cards &&
          Game.cards.selectionBoard &&
          typeof Game.cards.selectionBoard.updateDisplay === "function"
        ) {
          Game.cards.selectionBoard.updateDisplay();
        }

        Game.stage.update();
        if (Game.debug.active) {
          console.log(
            `Selected card: ${card.displayName} (remaining: ${card.count})`
          );
        }
      } else {
        if (Game.debug.active) {
          console.warn(
            "Attempted to select a card with zero count:",
            card.displayName
          );
        }
      }

      // If player has chosen 5 cards, move to confirmation
      if (Game.player.playerCards.length === 5) {
        Game.ui.playerSelectingHand = false;
        if (
          Game.ui.confirmationBox &&
          typeof Game.ui.confirmationBox.show === "function"
        ) {
          Game.ui.confirmationBox.show();
        } else if (
          Game.ui.confirmation &&
          typeof Game.ui.confirmation.container !== "undefined"
        ) {
          // fallback if you used a different API: show the confirmation container
          Game.stage.addChild(Game.ui.confirmation.container);
          Game.cursors.confirmation.place();
        }
      }

      return; // done handling Enter
    }

    // CANCEL: Backspace / Escape — undo last selection
    if (this._isCancelKey(e.key)) {
      if (Game.player.playerCards.length > 0) {
        const lastCard = Game.player.playerCards.pop();
        if (lastCard) {
          lastCard.count++;
          if (
            Game.player.cardManagerInstance &&
            typeof Game.player.cardManagerInstance.updateHandCards ===
              "function"
          ) {
            Game.player.cardManagerInstance.updateHandCards();
          } else if (
            Game.cards &&
            Game.cards.selectionBoard &&
            typeof Game.cards.selectionBoard.populate === "function"
          ) {
            Game.cards.selectionBoard.populate();
          }
          // Refresh preview for current index (in case it changed)
          sb.selectedHandCard =
            Game.player.ownedCards[sb.selectedHandCardNumber] || null;
          if (
            Game.cards &&
            Game.cards.selectionBoard &&
            typeof Game.cards.selectionBoard.updateDisplay === "function"
          ) {
            Game.cards.selectionBoard.updateDisplay();
          }
          Game.stage.update();
        }
      }
      return;
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
