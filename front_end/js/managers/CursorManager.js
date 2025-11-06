import { UIManager } from "../managers/UIManager.js";
import { offsets } from "../constants/offsets.js";
import { SelectionBoardUI } from "../ui/SelectionBoardUI.js";
import { BoardManager } from "../managers/BoardManager.js";
import { Game } from "../game/game.js";
import { debug } from "../debug.js";

/**
 * Manages the logical state of all cursors in the game.
 * Handles position, movement, and state changes without directly touching the stage.
 */
export const CursorManager = {
  /** Dynamically set in gameInit.all() */
  player: null,

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
        !CursorManager.player ||
        !CursorManager.player.playerHandSelectionCursor
      ) {
        console.warn("CursorManager.player not set yet");
        return;
      }

      CursorManager.player.playerHandSelectionCursor.x =
        UIManager.selectionBoard.background.x - 40;
      CursorManager.player.playerHandSelectionCursor.y =
        UIManager.selectionBoard.background.y + 48;
    },

    /**
     * Move the selection cursor in the specified direction.
     *
     * @param {"up"|"down"|"left"|"right"} direction
     */
    move(direction) {
      const controller = SelectionBoardUI.controller;
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

    /**
     * Clears the selection cursor state.
     */
    clear() {
      // No persistent state to clear; visual removal handled by renderer.
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
      UIManager.confirmation.selectedChoice = 0;
    },

    /**
     * Move the confirmation cursor up or down.
     *
     * @param {"up"|"down"} direction
     * @returns {boolean} True if the selection changed, false otherwise.
     */
    move(direction) {
      const previousChoice = UIManager.confirmation.selectedChoice;

      if (direction === "up") {
        if (UIManager.confirmation.selectedChoice > 0) {
          UIManager.confirmation.selectedChoice -= 1;
        }
      } else if (direction === "down") {
        if (UIManager.confirmation.selectedChoice < 1) {
          UIManager.confirmation.selectedChoice += 1;
        }
      } else {
        console.warn(`Unknown or out-of-bounds direction: ${direction}`);
      }

      // Clamp choice to valid range
      UIManager.confirmation.selectedChoice = Math.max(
        0,
        Math.min(1, UIManager.confirmation.selectedChoice),
      );

      return previousChoice !== UIManager.confirmation.selectedChoice;
    },

    /**
     * Clears the confirmation cursor state.
     */
    clear() {
      // Visual cleanup handled elsewhere
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
      if (!CursorManager.player || !CursorManager.player.playerHandCursor) {
        console.warn("CursorManager.playerHandCursor not available yet");
        return;
      }

      UIManager.playerChoosingCard = true;

      const player = CursorManager.player;
      const cardIndex = UIManager.selectedCardNumber ?? 0;

      player.playerHandCursor.x = player.handOffsetX - 50;
      player.playerHandCursor.y =
        offsets.handOffsetY +
        (cardIndex + 1 + (player.playedCardsCount || 0)) *
          (offsets.cardHeight / 2);

      // TODO: Doesn't seem to be necessary
      player.playerHandCursor.visible = true;

      Game.stage.update();
    },

    /**
     * Move the player hand cursor up or down.
     *
     * @param {"up"|"down"} direction
     * @returns {boolean} True if movement succeeded, false if out of bounds.
     */
    move(direction) {
      const player = CursorManager.player;
      if (!player || !player.playerHandCursor) {
        console.warn("Player or playerHandCursor not found");
        return false;
      }

      const handOffset = offsets.handCardOffset ?? 32;

      if (direction === "up") {
        if (UIManager.selectedCardNumber > 0) {
          player.playerHandCursor.y -= handOffset;
          UIManager.selectedCardNumber--;
          player.cardsAboveSelection--;
        } else {
          console.warn("Cannot move player hand cursor up - out of bounds");
          return false;
        }
      } else if (direction === "down") {
        if (UIManager.selectedCardNumber < player.cardsInHand.length - 1) {
          player.playerHandCursor.y += handOffset;
          UIManager.selectedCardNumber++;
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
      UIManager.playerChoosingCard = false;
      const player = CursorManager.player;
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
      UIManager.playerSelectingPlacement = true;

      UIManager.gridCursor.x = offsets.gameOffsetX + offsets.cellWidth + 16;
      UIManager.gridCursor.y = offsets.gameOffsetY + offsets.cellHeight + 80;

      UIManager.gridCursor.visible = true;
      Game.stage.addChild(UIManager.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor placed at X:${UIManager.gridCursor.x}, Y:${UIManager.gridCursor.y}`,
        );
      }
    },

    /**
     * Move the grid cursor in a specified direction.
     *
     * @param {"left"|"up"|"right"|"down"} direction
     */
    move(direction) {
      const oldX = UIManager.gridCursor.x;
      const oldY = UIManager.gridCursor.y;

      switch (direction) {
        case "left":
          if (UIManager.gridCursor.x > offsets.gameOffsetX + 16) {
            UIManager.gridCursor.x -= offsets.cellWidth;
            UIManager.selectedColumn--;
          } else {
            return console.warn("Cannot move grid cursor left - out of bounds");
          }
          break;

        case "up":
          if (UIManager.gridCursor.y > offsets.gameOffsetY + 80) {
            UIManager.gridCursor.y -= offsets.cellHeight;
            UIManager.selectedRow--;
          } else {
            return console.warn("Cannot move grid cursor up - out of bounds");
          }
          break;

        case "right":
          if (
            UIManager.gridCursor.x <
            offsets.gameOffsetX + offsets.cellWidth * 2 + 16
          ) {
            UIManager.gridCursor.x += offsets.cellWidth;
            UIManager.selectedColumn++;
          } else {
            return console.warn(
              "Cannot move grid cursor right - out of bounds",
            );
          }
          break;

        case "down":
          if (
            UIManager.gridCursor.y <
            offsets.gameOffsetY + offsets.cellHeight * 2 + 80
          ) {
            UIManager.gridCursor.y += offsets.cellHeight;
            UIManager.selectedRow++;
          } else {
            return console.warn("Cannot move grid cursor down - out of bounds");
          }
          break;

        default:
          return console.warn(`Unknown grid move direction: ${direction}`);
      }

      BoardManager.checkSelectedSquare();
      Game.stage.update();

      if (debug.active) {
        console.log(
          `Grid cursor moved ${direction} from X:${oldX}, Y:${oldY} to X:${UIManager.gridCursor.x}, Y:${UIManager.gridCursor.y}`,
        );
      }
    },

    /**
     * Clears the grid cursor state.
     */
    clear() {
      UIManager.playerSelectingPlacement = false;
      Game.stage.removeChild(UIManager.gridCursor);
      Game.stage.update();

      if (debug.active) {
        console.log("Grid cursor removed");
      }
    },
  },
};
