import { RulesView } from "./rules-view.js";
import RulesModel from "./rules-model.js";
import { Game } from "../../shared/game/game.js";
import { PhaseChecker } from "../../game/phases.js";
import { config } from "../../constants/config.js";

/**
 * Controller for the rules phase, which displays the game rules and Play/Quit options.
 */
export class RulesController {
  /**
   * Creates a RulesController instance.
   * @param {object} localDeps - Local dependencies (e.g. callbacks)
   * @param {function} transition - Function to call to transition to another phase
   */
  constructor(localDeps = {}, transition) {
    this.transition = transition;
    this.callbacks = localDeps.callbacks || {};
    this.model = new RulesModel(RulesView);
    RulesView.model = this.model;
  }

  /**
   * Activate the rules phase: show the rules dialog and set up the view. Also hides the AI hand while rules are shown.
   */
  activate() {
    console.log("[Rules Controller] Showing rules dialog...");
    PhaseChecker.playerViewingRules = true;

    // Hide the AI hand while rules are shown
    if (
      Game.controllers &&
      Game.controllers.aiTurnController &&
      Game.controllers.aiTurnController.view
    ) {
      const hand = Game.controllers.aiTurnController.model.hand;
      for (const card of hand) {
        if (card?.visuals?.container) {
          card.visuals.container.visible = false;
        }
      }
    }
    this.model.setSelected(0);
    RulesView.drawRulesBox();
    Game.stage.addChild(RulesView.container);

    if (!RulesView.cursor) {
      RulesView.cursor = new createjs.Bitmap(config.imagePath + "cursor.png");
    }
    this.model.updateCursorPlacement();
    Game.stage.update();
  }

  /**
   * Deactivate the rules phase: hide the rules dialog and clean up the view. Also restores the AI hand visibility when leaving rules.
   */
  deactivate() {
    console.log("[Rules Controller] Hiding rules dialog...");
    // Restore AI hand visibility when leaving rules
    if (
      Game.controllers &&
      Game.controllers.aiTurnController &&
      Game.controllers.aiTurnController.view
    ) {
      const hand = Game.controllers.aiTurnController.model.hand;
      for (const card of hand) {
        if (card?.visuals?.container) {
          card.visuals.container.visible = true;
        }
      }
    }
    Game.stage.removeChild(RulesView.container);
    RulesView.hide();
    if (RulesView.cursor) {
      Game.stage.removeChild(RulesView.cursor);
    }
    PhaseChecker.playerViewingRules = false;
  }

  /**
   * Navigate the options (Play/Quit) based on user input (e.g. up/down keys).
   */
  navigate(direction) {
    this.model.handleInput(direction);
    Game.stage.update();
  }

  /**
   * Handle the confirm action (e.g. Enter key): either transition to the next phase if Play is selected, or show an alert if Quit is selected.
   */
  confirm() {
    const isPlay = this.model.confirm();
    if (isPlay) {
      console.log("[Rules Controller] Player chose Play.");
      this.transition("deck-selection");
    } else {
      console.log("[Rules Controller] Player chose Quit.");
      // TODO: Implement proper quit functionality (e.g. return to main menu or close game) instead of just showing an alert
      alert("Quit selected");
    }
  }
}
