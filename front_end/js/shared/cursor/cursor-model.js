import { UIModel } from "../ui/ui-model.js";
import { offsets } from "../../constants/offsets.js";
import { BoardModel } from "../board/board-model.js";
import { Game } from "../game/game.js";
import { debug } from "../../utilities/debug.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";

/**
 * Manages the logical state of all cursors in the game.
 * Handles position, movement, and state changes without directly touching the stage.
 */
export const CursorModel = {
  /** Dynamically set in gameInit.all() */
  player: undefined,

  /**
   * Handles the player hand selection cursor on the selection board.
   */
  selection: {
    /**
     * Initialise the selection cursor position.
     * Places it relative to the selection board container.
     */
    initPosition() {
      if (
        !CursorModel.player ||
        !CursorModel.player.playerHandSelectionCursor
      ) {
        console.warn("CursorModel.player not set yet");
        return;
      }

      CursorModel.player.playerHandSelectionCursor.x =
        UIModel.selectionBook.background.x - 40;
      CursorModel.player.playerHandSelectionCursor.y =
        UIModel.selectionBook.background.y + 58;
    },

    /**
     * Move the selection cursor in the specified direction.
     *
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      const controller = SelectionBook.controller;
      if (!controller) {
        return;
      }

      const currentPageStart = controller.pageStart;
      const currentPageEnd =
        currentPageStart + controller.displayedCards.length - 1;

      switch (direction) {
        case "up": {
          if (controller.selectedIndex > currentPageStart) {
            controller.selectPrevious();
          }
          break;
        }
        case "down": {
          if (controller.selectedIndex < currentPageEnd) {
            controller.selectNext();
          }
          break;
        }
        case "left": {
          controller.paginate("left");
          break;
        }
        case "right": {
          controller.paginate("right");
          break;
        }
        default: {
          console.warn(`Unknown selection move direction: ${direction}`);
        }
      }
    },
  },

  /**
   * Handles the confirmation cursor (Yes/No dialog).
   */
  confirmation: {
    /**
     * Reset the currently selected choice to default (0).
     */
    resetChoice() {
      ConfirmationView.selectedChoice = 0;
    },

    /**
     * Move the confirmation cursor up or down.
     *
     * @param {"up"|"down"} direction
     * @returns {boolean} True if the selection changed, false otherwise.
     */
    move(direction) {
      const previousChoice = ConfirmationView.selectedChoice;

      if (direction === "up") {
        if (ConfirmationView.selectedChoice > 0) {
          ConfirmationView.selectedChoice -= 1;
        }
      } else if (direction === "down") {
        if (ConfirmationView.selectedChoice < 1) {
          ConfirmationView.selectedChoice += 1;
        }
      } else {
        console.warn(`Unknown or out-of-bounds direction: ${direction}`);
      }

      // Clamp choice to valid range
      ConfirmationView.selectedChoice = Math.max(
        0,
        Math.min(1, ConfirmationView.selectedChoice),
      );

      return previousChoice !== ConfirmationView.selectedChoice;
    },
  },

  /**
   * Handles the player hand cursor in the player's hand.
   */
  playerHand: {
    /**
     * Initialize the player hand cursor position based on selected card index.
     */
    init() {
      if (!CursorModel.player || !CursorModel.player.playerHandCursor) {
        console.warn("CursorModel.playerHandCursor not available yet");
        return;
      }

      UIModel.playerChoosingCard = true;

      const player = CursorModel.player;
      const cardIndex = UIModel.selectedCardNumber ?? 0;

      player.playerHandCursor.x = player.handOffsetX - 50;
      player.playerHandCursor.y =
        offsets.playerCursorOffset +
        (cardIndex + player.playedCardsCount) * (offsets.cardHeight / 2);

      Game.stage.update();
    },

    /**
     * Move the player hand cursor up or down.
     *
     * @param {"up"|"down"} direction
     * @returns {boolean} True if movement succeeded, false if out of bounds.
     */
    move(direction) {
      const player = CursorModel.player;
      if (!player || !player.playerHandCursor) {
        console.warn("Player or playerHandCursor not found");
        return false;
      }

      const handOffset = offsets.handCardOffset;

      if (direction === "up") {
        if (UIModel.selectedCardNumber > 0) {
          player.playerHandCursor.y -= handOffset;
          UIModel.selectedCardNumber--;
          player.cardsAboveSelection--;
        } else {
          console.warn("Cannot move player hand cursor up - out of bounds");
          return false;
        }
      } else if (direction === "down") {
        if (UIModel.selectedCardNumber < player.hand.length - 1) {
          player.playerHandCursor.y += handOffset;
          UIModel.selectedCardNumber++;
          player.cardsAboveSelection++;
        } else {
          console.warn("Cannot move player hand cursor down - out of bounds");
          return false;
        }
      } else {
        console.warn(`Unknown player hand move direction: ${direction}`);
        return false;
      }

      Game.stage.update();
      return true;
    },

    /**
     * Clears the player hand cursor state.
     */
    clear() {
      UIModel.playerChoosingCard = false;
      const player = CursorModel.player;
      if (player?.playerHandCursor) {
        player.playerHandCursor.visible = false;
      }
      Game.stage.update();
    },
  },

  /**
   * Handles the grid cursor on the main board.
   */
  grid: {
    /**
     * Initialize the grid cursor to the starting cell (1,1 visual).
     */
    init() {
      UIModel.playerSelectingPlacement = true;

      UIModel.gridCursor.x = offsets.gameOffsetX + offsets.cellWidth + 16;
      UIModel.gridCursor.y = offsets.gameOffsetY + offsets.cellHeight + 80;

      UIModel.gridCursor.visible = true;
      Game.stage.addChild(UIModel.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor placed at X:${UIModel.gridCursor.x}, Y:${UIModel.gridCursor.y}`,
        );
      }
    },

    /**
     * Move the grid cursor in a specified direction.
     *
     * @param {"left"|"up"|"right"|"down"} direction
     */
    move(direction) {
      const oldX = UIModel.gridCursor.x;
      const oldY = UIModel.gridCursor.y;

      switch (direction) {
        case "left": {
          if (UIModel.gridCursor.x > offsets.gameOffsetX + 16) {
            UIModel.gridCursor.x -= offsets.cellWidth;
            UIModel.selectedColumn--;
          } else {
            return console.warn("Cannot move grid cursor left - out of bounds");
          }
          break;
        }

        case "up": {
          if (UIModel.gridCursor.y > offsets.gameOffsetY + 80) {
            UIModel.gridCursor.y -= offsets.cellHeight;
            UIModel.selectedRow--;
          } else {
            return console.warn("Cannot move grid cursor up - out of bounds");
          }
          break;
        }

        case "right": {
          if (
            UIModel.gridCursor.x <
            offsets.gameOffsetX + offsets.cellWidth * 2 + 16
          ) {
            UIModel.gridCursor.x += offsets.cellWidth;
            UIModel.selectedColumn++;
          } else {
            return console.warn(
              "Cannot move grid cursor right - out of bounds",
            );
          }
          break;
        }

        case "down": {
          if (
            UIModel.gridCursor.y <
            offsets.gameOffsetY + offsets.cellHeight * 2 + 80
          ) {
            UIModel.gridCursor.y += offsets.cellHeight;
            UIModel.selectedRow++;
          } else {
            return console.warn("Cannot move grid cursor down - out of bounds");
          }
          break;
        }

        default: {
          return console.warn(`Unknown grid move direction: ${direction}`);
        }
      }

      // Update selectedSquare based on row/column
      UIModel.selectedSquare =
        (UIModel.selectedRow - 1) * 3 + UIModel.selectedColumn;

      // Update BoardModel/UI
      BoardModel.updateUISelection(UIModel.selectedSquare);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${UIModel.gridCursor.x}, Y:${UIModel.gridCursor.y}, selectedSquare=${UIModel.selectedSquare}`,
        );
      }
    },

    /**
     * Clears the grid cursor state.
     */
    clear() {
      UIModel.playerSelectingPlacement = false;
      Game.stage.removeChild(UIModel.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor removed");
      }
    },
  },
};
