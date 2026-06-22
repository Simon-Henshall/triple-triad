import { Game } from "../../shared/game/game.js";

/**
 * @fileoverview View component for the opponent selection phase.
 * Renders a gray box at the center of the screen showing the
 * current location and opponent list, similar to the confirmation dialog.
 */
export const OpponentSelectionView = {
  /** @type {object|undefined} Set at runtime by OpponentSelectionController */
  model: undefined,
  /** @type {createjs.Container|undefined} Initialised lazily */
  container: undefined,
  /** @type {createjs.Shape|undefined} Initialised lazily */
  background: undefined,

  // Box dimensions and position (centered)
  boxX: 300,
  boxY: 200,
  boxWidth: 360,
  boxHeight: 280,

  // Cursor and row settings (matching hand card selection style)
  CURSOR_X_OFFSET: -40,
  CURSOR_Y_OFFSET: 65,
  ROW_HEIGHT: 35,

  /**
   * Ensure the container and background are initialised.
   */
  _ensureInitialised() {
    if (!this.container) {
      this.container = new createjs.Container();
    }
    if (!this.background) {
      this.background = new createjs.Shape();
    }
  },

  /**
   * Show the opponent selection dialog.
   */
  show() {
    this.drawDialog();
  },

  /**
   * Hide the opponent selection dialog.
   */
  hide() {
    if (this.container) {
      this.container.removeAllChildren();
    }
  },

  /**
   * Draw the full dialog: header, location name, player list, and navigation hints.
   */
  drawDialog() {
    this._ensureInitialised();

    // Clear existing children
    this.container.removeAllChildren();

    // Background shape
    this.background.graphics
      .clear()
      .beginFill("#666666")
      .drawRect(0, 0, this.boxWidth, this.boxHeight);

    this.background.x = this.boxX;
    this.background.y = this.boxY;

    // Border (slightly larger than background)
    const border = new createjs.Shape();
    border.graphics
      .beginFill("#000000")
      .drawRect(-1, -1, this.boxWidth + 2, this.boxHeight + 2);
    border.x = this.boxX;
    border.y = this.boxY;

    // Title
    const title = new createjs.Text(
      "CHOOSE OPPONENT",
      "bold 20px Arial",
      "#ffffff",
    );
    title.x = this.boxX + 10;
    title.y = this.boxY + 6;

    // Location name (always visible)
    const locationName = this.model?.currentLocation?.name || "Unknown";
    const locationText = new createjs.Text(
      `Location: ${locationName}`,
      "bold 16px Arial",
      "#cccccc",
    );
    locationText.x = this.boxX + 10;
    locationText.y = this.boxY + 32;

    // Horizontal separator
    const separator = new createjs.Shape();
    separator.graphics
      .beginStroke("#999999")
      .moveTo(this.boxX + 10, this.boxY + 52)
      .lineTo(this.boxX + this.boxWidth - 10, this.boxY + 52);

    // Player list
    const players = this.model?.currentPlayerList || [];
    const selectedIndex = this.model?.playerIndex || 0;
    const maxVisible = 5; // Max players visible in the list (fits 5 rows with 35px height)
    let startIndex = 0;

    // Scroll the visible window so selected player is visible
    if (selectedIndex >= maxVisible) {
      startIndex = selectedIndex - maxVisible + 1;
    }

    const visiblePlayers = players.slice(startIndex, startIndex + maxVisible);

    // Cursor (using same image as hand card selection)
    const cursor = Game.models?.playerModel?.playerHandSelectionCursor;

    const playerTexts = [];
    for (const [index, player] of visiblePlayers.entries()) {
      const playerText = new createjs.Text(
        player.name,
        "20px Arial",
        "#ffffff",
      );
      playerText.x = this.boxX + 20;
      playerText.y = this.boxY + 62 + index * this.ROW_HEIGHT;
      playerTexts.push(playerText);
    }

    // Compact directional pad in the header area (top-right corner)
    const scrollIndicators = [];
    const dPadX = this.boxX + this.boxWidth - 36;
    const dPadY = this.boxY + 8;
    const dPadSpacing = 14;

    const hasPlayersAbove = startIndex > 0;
    const hasPlayersBelow = startIndex + maxVisible < players.length;
    const totalLocations = this.model?.totalLocations || 0;
    const hasPreviousLocation = totalLocations > 1;
    const hasNextLocation = totalLocations > 1;

    if (hasPlayersAbove) {
      const upArrow = new createjs.Text("▲", "12px Arial", "#cccccc");
      upArrow.x = dPadX - 6;
      upArrow.y = dPadY;
      scrollIndicators.push(upArrow);
    }
    if (hasPreviousLocation) {
      const leftArrow = new createjs.Text("◀", "12px Arial", "#cccccc");
      leftArrow.x = dPadX - 20;
      leftArrow.y = dPadY + dPadSpacing;
      scrollIndicators.push(leftArrow);
    }
    if (hasNextLocation) {
      const rightArrow = new createjs.Text("▶", "12px Arial", "#cccccc");
      rightArrow.x = dPadX + 8;
      rightArrow.y = dPadY + dPadSpacing;
      scrollIndicators.push(rightArrow);
    }
    if (hasPlayersBelow) {
      const downArrow = new createjs.Text("▼", "12px Arial", "#cccccc");
      downArrow.x = dPadX - 6;
      downArrow.y = dPadY + dPadSpacing * 2;
      scrollIndicators.push(downArrow);
    }

    // Bottom separator
    const bottomSeparator = new createjs.Shape();
    bottomSeparator.graphics
      .beginStroke("#999999")
      .moveTo(this.boxX + 10, this.boxY + this.boxHeight - 48)
      .lineTo(this.boxX + this.boxWidth - 10, this.boxY + this.boxHeight - 48);

    // Full location text (always visible, showing full location string)
    const fullLocation = this.model?.selectedPlayer?.location || "";
    const fullLocationText = new createjs.Text(
      fullLocation,
      "12px Arial",
      "#cccccc",
    );
    fullLocationText.x = this.boxX + 10;
    fullLocationText.y = this.boxY + this.boxHeight - 42;

    // Navigation hints (split evenly across the width for justified alignment)
    const hintLeft = new createjs.Text(
      "L/R: Location",
      "12px Arial",
      "#dddddd",
    );
    hintLeft.x = this.boxX + 10;
    hintLeft.y = this.boxY + this.boxHeight - 22;

    const hintCenter = new createjs.Text(
      "U/D: Player",
      "12px Arial",
      "#dddddd",
    );
    hintCenter.x = this.boxX + this.boxWidth / 2 - 40;
    hintCenter.y = this.boxY + this.boxHeight - 22;

    const hintRight = new createjs.Text(
      "Enter: Select",
      "12px Arial",
      "#dddddd",
    );
    hintRight.x = this.boxX + this.boxWidth - 10 - 80;
    hintRight.y = this.boxY + this.boxHeight - 22;

    // Add all elements to container
    this.container.addChild(
      border,
      this.background,
      title,
      locationText,
      separator,
    );
    for (const text of playerTexts) {
      this.container.addChild(text);
    }
    this.container.addChild(
      bottomSeparator,
      fullLocationText,
      ...scrollIndicators,
      hintLeft,
      hintCenter,
      hintRight,
    );

    // Position cursor beside the selected player (added last so it's on top)
    if (cursor) {
      cursor.x = this.boxX + this.CURSOR_X_OFFSET;
      cursor.y =
        this.boxY +
        this.CURSOR_Y_OFFSET +
        this.ROW_HEIGHT * (selectedIndex - startIndex);
      this.container.addChild(cursor);
    }
  },

  /**
   * Redraw the dialog (call on navigation change).
   */
  refresh() {
    this.drawDialog();
  },
};
