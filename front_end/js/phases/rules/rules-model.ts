import { PhaseChecker } from "../../game/phases.js";
import { Game } from "../../shared/game/game.js";

/**
 * RulesModel
 */
export default class RulesModel {
  /**
   * Creates a RulesModel instance.
   * @param {object} view - Reference to the RulesView for updating cursor placement
   */
  constructor(view) {
    this.view = view;
    this.choices = ["Play", "Quit"];
    this.selectedIndex = 0;
  }

  /**
   * Clamp the selected index to ensure it stays within the bounds of the choices array.
   * @param {number} index - The index to clamp
   * @returns {number} - The clamped index
   */
  clampIndex(index) {
    if (index < 0) {
      return 0;
    }
    if (index >= this.choices.length) {
      return this.choices.length - 1;
    }
    return index;
  }

  /**
   * Set the selected index and update the cursor placement in the view accordingly.
   * @param {number} index - The index to set as selected
   */
  setSelected(index) {
    this.selectedIndex = this.clampIndex(index);
    this.updateCursorPlacement();
  }

  /**
   * Navigate to the next option (e.g. when pressing the down key).
   */
  next() {
    this.setSelected(this.selectedIndex + 1);
  }

  /**
   * Navigate to the previous option (e.g. when pressing the up key).
   */
  prev() {
    this.setSelected(this.selectedIndex - 1);
  }

  /**
   * Handle the confirm action (e.g. when pressing the Enter key). Returns true if "Play" is selected, false if "Quit" is selected.
   * Also hides the rules dialog and updates the phase checker to indicate the player is no longer viewing rules.
   */
  confirm() {
    const isPlay = this.selectedIndex === 0;
    PhaseChecker.playerViewingRules = false;
    this.hideView();
    return isPlay;
  }

  /**
   * Handle the cancel action (e.g. when pressing the Escape key). Hides the rules dialog and updates the phase checker to indicate the player is no longer viewing rules. Always returns false to indicate that cancel does not confirm playing.
   */
  cancel() {
    PhaseChecker.playerViewingRules = false;
    this.hideView();
    return false;
  }

  /**
   * Update the cursor placement in the view based on the currently selected index. This should be called whenever the selected index changes to ensure the cursor is positioned correctly next to the selected option.
   */
  updateCursorPlacement() {
    if (this.view && this.view.cursor && this.view.background && Game.stage) {
      const selected = this.selectedIndex ?? 0;
      this.view.cursor.x = this.view.boxX + 55;
      this.view.cursor.y = this.view.optionsStartY + 10 + selected * 40;
      // Re-add cursor to stage to ensure it's on top of the dialog container
      if (Game.stage.contains(this.view.cursor)) {
        Game.stage.removeChild(this.view.cursor);
      }
      Game.stage.addChild(this.view.cursor);
      Game.stage.update();
    }
  }

  /**
   * Hide the rules dialog view by removing it from the stage. This should be called when leaving the rules phase to clean up the view.
   */
  hideView() {
    if (this.view && Game.stage && Game.stage.contains(this.view.container)) {
      Game.stage.removeChild(this.view.container);
      Game.stage.update();
    }
  }

  /**
   * Generic input handler for the rules phase. Maps directional inputs to navigation and confirm/cancel actions. This should be called by the controller when handling user input in the rules phase.
   */
  handleInput(action) {
    switch (action) {
      case "up": {
        this.prev();
        break;
      }
      case "down": {
        this.next();
        break;
      }
      case "confirm": {
        return this.confirm();
      }
      case "cancel": {
        return this.cancel();
      }
      default: {
        break;
      }
    }
    return;
  }
}
