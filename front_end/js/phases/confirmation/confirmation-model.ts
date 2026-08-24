import { PhaseChecker } from "../../game/phases.js";
import { Game } from "../../shared/game/game.js";

/**
 * Model for managing the confirmation dialog state.
 */
export default class ConfirmationModel {
  /**
   * Creates a ConfirmationModel instance.
   * @param {object} view The ConfirmationView instance to sync with
   */
  constructor(view) {
    this.view = view;
    this.choices = ["Yes", "No"];
    this.selectedIndex = 0;
  }

  /** Clamp helper */
  clampIndex(index) {
    if (index < 0) {
      return 0;
    }
    if (index >= this.choices.length) {
      return this.choices.length - 1;
    }
    return index;
  }

  /** Set selection by index and update view/cursor */
  setSelected(index) {
    this.selectedIndex = this.clampIndex(index);
    this.updateCursorPlacement();
  }

  /**
   * Increment selection
   */
  next() {
    this.setSelected(this.selectedIndex + 1);
  }

  /**
   * Decrement selection
   */
  prev() {
    this.setSelected(this.selectedIndex - 1);
  }

  /**
   * Confirm current choice.
   * Returns true for 'Yes', false for 'No'.
   */
  confirm() {
    const isYes = this.selectedIndex === 0;
    PhaseChecker.playerConfirming = false;
    this.hideView();
    return isYes;
  }

  /** Cancel the confirmation (equivalent to selecting 'No') */
  cancel() {
    PhaseChecker.playerConfirming = false;
    this.hideView();
    return false;
  }

  /** Attempt to reposition the confirmation cursor if it exists */
  updateCursorPlacement() {
    // Update the confirmation cursor visuals directly to avoid
    // triggering controller.place() which resets the model and
    // causes recursive updates.
    if (this.view && this.view.cursor && this.view.background && Game.stage) {
      const selected = this.selectedIndex ?? 0;
      this.view.cursor.y = this.view.background.y + 60 + selected * 30;
      if (!Game.stage.contains(this.view.cursor)) {
        Game.stage.addChild(this.view.cursor);
      }
      Game.stage.update();
    }
  }

  /**
   * Hide the confirmation view from the stage.
   */
  hideView() {
    if (this.view && Game.stage && Game.stage.contains(this.view.container)) {
      Game.stage.removeChild(this.view.container);
      Game.stage.update();
    }
  }

  /**
   * Generic input handler: 'up'|'down'|'confirm'|'cancel'
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
