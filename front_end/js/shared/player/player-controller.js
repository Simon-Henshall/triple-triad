import { DeckSelectionUI } from "../../phases/deck-selection/deck-selection-ui.js";

/**
 * Controller that mediates between the `PlayerModel` and `PlayerView`.
 * Handles actions such as adding/removing cards from the hand, syncing
 * UI components (like the deck selection UI), and delegating animations
 * to the view or model where appropriate.
 *
 * @class PlayerController
 */
export class PlayerController {
  /**
   * Create a PlayerController.
   * @param {PlayerModel} playerModel - The player model instance managing logical state (deck, hand, counts).
   * @param {PlayerView} playerView - The view instance responsible for rendering and animating the player's hand.
   */
  constructor(playerModel, playerView) {
    this.model = playerModel;
    this.view = playerView;
  }

  /**
   * Adds a card instance to the player's hand.
   * Delegates the logical add to the model, triggers view animation when a
   * visual container exists, and refreshes the deck-selection UI counts.
   *
   * @param {Card} card - Card instance to add to the hand.
   * @returns {boolean} Returns `true` when the card was successfully added, `false` otherwise.
   */
  addCardToHand(card) {
    const added = this.model.addCardToHand(card);
    if (!added) {
      return false;
    }

    const index = this.model.hand.indexOf(card);
    const container = card.visuals?.container;
    if (container) {
      this.view.animateCardToHand(container, index, false);
    }

    // Keep selection book in sync
    DeckSelectionUI.populate();

    return true;
  }

  /**
   * Removes the most recently added card from the player's hand.
   * The underlying `PlayerModel` will trigger the appropriate removal
   * animation on the view when necessary. This method also refreshes the
   * deck-selection UI counts.
   *
   * @returns {Card|false} The removed `Card` instance, or `false` if the hand was empty.
   */
  removeLastCardFromHand() {
    const card = this.model.removeLastCardFromHand();
    if (!card) {
      return false;
    }

    // model.removeLastCardFromHand triggers the view animation when appropriate,
    // so avoid duplicating the animation here.

    // Refresh selection book UI counts
    DeckSelectionUI.populate();

    return card;
  }

  /**
   * Visually indent the provided selected card and remember it as the
   * previously selected card in the model. This delegates the visual change
   * to the `PlayerView` so that animation and z-ordering are handled there.
   *
   * @param {Card|Object} selectedCard - The card instance (or visual container)
   *   to indent as selected. May be `undefined` to clear selection.
   * @returns {void}
   */
  indentSelectedCard(selectedCard) {
    this.view.indentSelectedCard(selectedCard);
    this.model.previouslySelectedCard = selectedCard;
  }

  /**
   * Reset the player's hand in both model and view, and refresh the
   * deck-selection UI so counts and selection state remain consistent.
   *
   * @returns {void}
   */
  resetHand() {
    this.model.resetHand();
    this.view.resetHand();

    // Keep deck selection UI in sync after a reset
    DeckSelectionUI.populate();
  }

  /**
   * Shift visual hand cards down by a vertical offset. Delegates to the
   * `PlayerModel` implementation which performs the tweens.
   *
   * @param {number} offset - Vertical pixel offset to move each shifted card.
   * @returns {void}
   */
  shiftCardsDown(offset) {
    return this.model.shiftCardsDown(offset);
  }

  /**
   * @unimplemented TODO: Unimplemented
   * Retrieve a card from the player's hand by index.
   *
   * @param {number} index - Index of the card to return (0-based).
   * @returns {Card|undefined} The `Card` at the requested index or `undefined` if out of range.
   */
  getHandCard(index) {
    return this.model.getHandCard(index);
  }
}
