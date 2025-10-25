import { offsets } from './offsets.js';
import { player } from './player.js';
import { confirmationBox } from './confirmationBox.js';
import { ui } from './ui.js';
import { debug } from './debug.js';
import { placementController } from './placementController.js';
import { selectionBoard } from './selectionBoard.js';
import { cursors } from './cursors.js';

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

    if (ui.playerSelectingHand) {
      Game.input._handlePlayerHandSelection(e);
    } else if (ui.playerConfirming) {
      Game.input._handleConfirmation(e);
    } else if (ui.playerChoosingCard) {
      Game.input._handlePlayerCardChoice(e);
    } else if (ui.playerSelectingPlacement) {
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
      left: () => cursors.selection.move("left"),
      up: () => cursors.selection.move("up"),
      right: () => cursors.selection.move("right"),
      down: () => cursors.selection.move("down"),
    });

    const sb = ui.selectionBoard;

    // ENTER: select the currently highlighted card (uses absolute index into ownedCards)
    if (e.key === "Enter") {
      const index = sb.selectedHandCardNumber;
      const card = player.ownedCards[index];

      if (!card) {
        console.warn("No card at selected index:", index);
        return;
      }

      if (card.count > 0) {
        card.count--;
        // store the card object in the player's temporary selection
        player.playerCards.push(card);

        // update visuals / counts on the selection board
        if (
          player.cardManagerInstance &&
          typeof player.cardManagerInstance.updateHandCards === "function"
        ) {
          player.cardManagerInstance.updateHandCards();
        } else {
          // fallback: repopulate the selection board if manager missing
          if (
            Game.cards &&
            selectionBoard &&
            typeof selectionBoard.populate === "function"
          ) {
            selectionBoard.populate();
          }
        }

        // refresh the preview (in case it needs to show updated count/visuals)
        sb.selectedHandCard =
          player.ownedCards[sb.selectedHandCardNumber] || null;
        if (
          Game.cards &&
          selectionBoard &&
          typeof selectionBoard.updateDisplay === "function"
        ) {
          selectionBoard.updateDisplay();
        }

        Game.stage.update();
        if (debug.active) {
          console.log(
            `Selected card: ${card.displayName} (remaining: ${card.count})`
          );
        }
      } else {
        if (debug.active) {
          console.warn(
            "Attempted to select a card with zero count:",
            card.displayName
          );
        }
      }

      // If player has chosen 5 cards, move to confirmation
      if (player.playerCards.length === 5) {
        ui.playerSelectingHand = false;
        confirmationBox.show();
      }

      return; // done handling Enter
    }

    // CANCEL: Backspace / Escape — undo last selection
    if (this._isCancelKey(e.key)) {
      if (player.playerCards.length > 0) {
        const lastCard = player.playerCards.pop();
        if (lastCard) {
          lastCard.count++;
          if (
            player.cardManagerInstance &&
            typeof player.cardManagerInstance.updateHandCards ===
              "function"
          ) {
            player.cardManagerInstance.updateHandCards();
          } else if (
            Game.cards &&
            selectionBoard &&
            typeof selectionBoard.populate === "function"
          ) {
            selectionBoard.populate();
          }
          // Refresh preview for current index (in case it changed)
          sb.selectedHandCard =
            player.ownedCards[sb.selectedHandCardNumber] || null;
          if (
            Game.cards &&
            selectionBoard &&
            typeof selectionBoard.updateDisplay === "function"
          ) {
            selectionBoard.updateDisplay();
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
      up: () => cursors.confirmation.move("up"),
      down: () => cursors.confirmation.move("down"),
    });

    if (e.key === "Enter" && ui.confirmation.selectedChoice === 0) {
      Game.stage.removeChild(ui.selectionBoard.container);
      Game.stage.removeChild(ui.confirmation.container);
      cursors.confirmation.remove();
      Game.startGame();
    } else if (
      this._isCancelKey(e.key) ||
      (e.key === "Enter" && ui.confirmation.selectedChoice === 1)
    ) {
      for (let i = 0; i < 5; i++) {
        const lastCard = player.playerCards.pop();
        lastCard.count++;
        player.cardManagerInstance.updateHandCards();
      }
      Game.stage.removeChild(ui.confirmation.container);
      cursors.confirmation.remove();
      ui.playerSelectingHand = true;
    }
  },

  /** @private */
  _handlePlayerCardChoice(e) {
    Game.input._handleArrowKeys(e.key, {
      up: () => cursors.playerHand.move("up"),
      down: () => cursors.playerHand.move("down"),
    });

    if (e.key === "Enter") {
      cursors.playerHand.remove();
      cursors.grid.place();
      ui.selectedRow = 2;
      ui.selectedColumn = 2;
      Game.stage.removeChild(player.playerHandCursor);
    }
  },

  /** @private */
  _handlePlacement(e) {
    ui.infoBox.container.visible = false;

    Game.input._handleArrowKeys(e.key, {
      left: () => cursors.grid.move("left"),
      up: () => cursors.grid.move("up"),
      right: () => cursors.grid.move("right"),
      down: () => cursors.grid.move("down"),
    });

    if (e.key === "Enter") {
      if (!board.cellOccupied()) {
        player.cardsInPlayerHand.splice(ui.selectedCardNumber, 1);
        cursors.grid.remove();
        placementController.placeCard(
          ui.selectedCard,
          offsets.gameOffsetX +
            offsets.cellWidth * (ui.selectedColumn - 1) +
            offsets.cardOffsetX,
          offsets.gameOffsetY +
            offsets.cellHeight * (ui.selectedRow - 1) +
            offsets.cardOffsetY
        );
      }
    } else if (this._isCancelKey(e.key)) {
      cursors.grid.remove();
      cursors.playerHand.place();
    }
  },
};
