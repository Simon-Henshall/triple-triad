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
  boxHeight: 250,

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
    const title = new createjs.Text("CHOOSE OPPONENT", "16px Arial", "#ffffff");
    title.x = this.boxX + 10;
    title.y = this.boxY + 6;

    // Location name (always visible)
    const locationName = this.model?.currentLocation?.name || "Unknown";
    const locationText = new createjs.Text(
      `Location: ${locationName}`,
      "14px Arial",
      "#ffffff",
    );
    locationText.x = this.boxX + 10;
    locationText.y = this.boxY + 30;

    // Horizontal separator
    const separator = new createjs.Shape();
    separator.graphics
      .beginStroke("#999999")
      .moveTo(this.boxX + 10, this.boxY + 48)
      .lineTo(this.boxX + this.boxWidth - 10, this.boxY + 48);

    // Player list
    const players = this.model?.currentPlayerList || [];
    const selectedIndex = this.model?.playerIndex || 0;
    const maxVisible = 6; // Max players visible in the list
    let startIndex = 0;

    // Scroll the visible window so selected player is visible
    if (selectedIndex >= maxVisible) {
      startIndex = selectedIndex - maxVisible + 1;
    }

    const visiblePlayers = players.slice(startIndex, startIndex + maxVisible);

    const playerTexts = [];
    for (const [index, player] of visiblePlayers.entries()) {
      const actualIndex = startIndex + index;
      const isSelected = actualIndex === selectedIndex;
      const prefix = isSelected ? "> " : "  ";
      const color = isSelected ? "#ffff00" : "#ffffff";

      const playerText = new createjs.Text(
        `${prefix}${player.name}`,
        "14px Arial",
        color,
      );
      playerText.x = this.boxX + 20;
      playerText.y = this.boxY + 55 + index * 22;
      playerTexts.push(playerText);
    }

    // Full location text (always visible, showing full location string)
    const fullLocation = this.model?.selectedPlayer?.location || "";
    const fullLocationText = new createjs.Text(
      fullLocation,
      "10px Arial",
      "#cccccc",
    );
    fullLocationText.x = this.boxX + 10;
    fullLocationText.y = this.boxY + this.boxHeight - 42;

    // Navigation hints
    const hints = new createjs.Text(
      "L/R: Location  U/D: Player  Enter: Select",
      "10px Arial",
      "#aaaaaa",
    );
    hints.x = this.boxX + 10;
    hints.y = this.boxY + this.boxHeight - 22;

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
    this.container.addChild(fullLocationText, hints);
  },

  /**
   * Redraw the dialog (call on navigation change).
   */
  refresh() {
    this.drawDialog();
  },
};
