import GameOverController from "../game-over/game-over-controller.js";
import CardClaimModel from "./card-claim-model.js";
import CardClaimView from "./card-claim-view.js";
import { Game } from "../../shared/game/game.js";

/**
 * CardClaimController
 * Manages the card-claim phase where the player can select one
 * of the AI's 5 initial cards to claim as their own, shown only
 * after a victory.
 */
export default class CardClaimController {
  /**
   * Creates a CardClaimController instance.
   * @param {Object} localDeps - dependencies provided by the state machine
   * @param {Function} transition - function to request phase transitions
   */
  constructor(localDeps = {}, transition) {
    this.transition = transition;
    this.model = new CardClaimModel(localDeps);
    this.view = new CardClaimView(Game.stage);
    this._keyHandler = undefined;
  }

  /**
   * Activate the card-claim phase: build the UI and attach key listeners.
   */
  async activate() {
    console.log("[Card Claim] Activating card-claim phase");

    // Build the UI with the AI's initial cards (preloads images first)
    await this.view.build(this.model.aiInitialCards, this.model.selectedIndex);

    // Attach keyboard listeners
    this._attachKeyHandler();
  }

  /**
   * Deactivate the card-claim phase: clean up UI and listeners.
   */
  async deactivate() {
    this._detachKeyHandler();
    this.view.cleanup();
  }

  /**
   * Attach a keydown handler for navigation and selection.
   */
  _attachKeyHandler() {
    if (this._keyHandler) {
      return;
    }

    /**
     * Handle keydown events for navigating the card selection and confirming/skipping.
     * ArrowLeft/ArrowRight: move selection left/right (wrap around)
     * Enter: claim the currently selected card
     * Escape: skip claiming a card
     */
    this._keyHandler = (event) => {
      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          this.model.selectPrev();
          this.view.updateSelection(this.model.selectedIndex);
          break;
        }

        case "ArrowRight": {
          event.preventDefault();
          this.model.selectNext();
          this.view.updateSelection(this.model.selectedIndex);
          break;
        }

        case "Enter": {
          event.preventDefault();
          this._claimCard();
          break;
        }

        case "Escape": {
          event.preventDefault();
          this._skipClaim();
          break;
        }

        default: {
          break;
        }
      }
    };

    document.addEventListener("keydown", this._keyHandler);
  }

  /**
   * Detach the keydown handler.
   */
  _detachKeyHandler() {
    if (this._keyHandler) {
      document.removeEventListener("keydown", this._keyHandler);
      this._keyHandler = undefined;
    }
  }

  /**
   * Transition back to game-over directly (matching the codebase pattern).
   * @param {string} result - "claimed" or "skipped"
   */
  _goToGameOver(result) {
    // Deactivate ourselves
    this.deactivate();

    // Show the final game-over overlay with the result flag
    // so it doesn't redirect to card-claim again
    const gameOver = new GameOverController(
      {
        playerModel: Game.models.playerModel,
        aiTurnModel: Game.models.aiTurnModel,
        result,
      },
      undefined,
    );
    gameOver.activate();
  }

  /**
   * Handle the player claiming the currently selected card.
   * Adds a copy of the card to the player's deck, plays the
   * claim animation, then transitions away.
   */
  _claimCard() {
    const selectedCard = this.model.getSelectedCard();
    if (!selectedCard) {
      console.warn("[Card Claim] No card selected to claim");
      return;
    }

    console.log("[Card Claim] Player claimed card:", selectedCard.data.name);

    // Add a clone of the claimed card to the player's deck
    const playerModel = Game.models.playerModel;
    if (playerModel && playerModel.deck) {
      const claimedCard = selectedCard.clone({ owner: "player", count: 1 });
      playerModel.deck.push(claimedCard);
    }

    // Animate the claim, then transition back to game-over
    this.view.animateClaim(this.model.selectedIndex, () => {
      this._goToGameOver("claimed");
    });
  }

  /**
   * Handle the player skipping the card-claim opportunity.
   */
  _skipClaim() {
    console.log("[Card Claim] Player skipped claiming a card");
    this._goToGameOver("skipped");
  }
}
