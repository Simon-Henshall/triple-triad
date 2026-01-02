import { Game } from "../game/game.js";
import { offsets } from "../../constants/offsets.js";
import { ConfirmationView } from "../../phases/confirmation/confirmation-view.js";
import DeckSelectionModel from "../../phases/deck-selection/deck-selection-model.js";

/**
 * Handles all visual rendering and animation of the player's hand.
 */
export class PlayerView {
  /**
   * Creates an instance of PlayerView.
   * @param {PlayerModel} playerModel - The player model instance.
   */
  constructor(playerModel) {
    this.model = playerModel;

    /** @type {Array<createjs.Container>} visual containers for hand cards */
    this.cardsInPlayerHand = [];

    /** X/Y offsets for hand stack */
    this.stackOffsetX = offsets.gameOffsetX + 515; // right-hand side offset
    this.stackOffsetY = offsets.handOffsetY;
    this.stackSpacing = offsets.handCardOffset;
  }

  /**
   * Animate a card to the hand (or remove it)
   * @param {createjs.Container} cardContainer
   * @param {number} index - target index
   * @param {boolean} remove - true if removing
   */
  animateCardToHand(cardContainer, index, isRemoving = false) {
    const targetX = this.stackOffsetX;
    const targetY = this.stackOffsetY + index * this.stackSpacing;

    // console.log(
    //   `[Player View] Animating ${isRemoving ? "removal" : "addition"} at index ${index}:`,
    //   cardContainer,
    // );

    // ADDING: attach to stage and track
    if (!isRemoving) {
      cardContainer.x = targetX;
      cardContainer.y = Game.stage.canvas.height + 200;
      Game.stage.addChild(cardContainer);
      this.cardsInPlayerHand.splice(index, 0, cardContainer);
    }

    const finalY = isRemoving ? Game.stage.canvas.height + 200 : targetY;

    createjs.Tween.get(cardContainer, { override: true })
      .to({ y: finalY }, 600, createjs.Ease.quadOut)
      .call(() => {
        if (isRemoving) {
          // console.log(
          //   "[Player View] Removal tween finished for:",
          //   cardContainer,
          // );

          const index_ = this.cardsInPlayerHand.indexOf(cardContainer);
          if (index_ === -1) {
            console.warn(
              "[Player View] Container not found; array out of sync",
            );
          } else {
            this.cardsInPlayerHand.splice(index_, 1);
          }

          if (Game.stage.contains(cardContainer)) {
            Game.stage.removeChild(cardContainer);
          }
        }

        this._updateHandAndPreviewZOrder(!isRemoving);
        Game.stage.update();
      });

    // Keep preview above during animation
    if (!isRemoving) {
      this._attachPreviewTicker(cardContainer);
    }
  }

  /**
   * Visually indent the selected card
   * @param {createjs.Container} selectedCard
   */
  indentSelectedCard(selectedCard) {
    console.log("Indenting selected card:", selectedCard.data.name);
    const previousCard = this.model.previouslySelectedCard;

    if (selectedCard) {
      console.log(selectedCard);
      selectedCard.visuals.container.x -= 30;
    }

    if (previousCard && previousCard?.visuals?.container?.x !== undefined) {
      console.log(
        "Unindenting previously selected card:",
        previousCard.data.name,
      );
      previousCard.visuals.container.x += 30;
    }

    this.model.previouslySelectedCard = selectedCard;
    Game.stage.update();
  }

  /**
   * Remove all visual cards from stage
   */
  resetHand() {
    for (const card of this.cardsInPlayerHand) {
      if (Game.stage.contains(card)) {
        Game.stage.removeChild(card);
      }
    }
    this.cardsInPlayerHand = [];
    Game.stage.update();
  }

  /**
   * Internal: ensures hand cards and preview are stacked correctly in z-order
   * @param {boolean} updatePreview
   */
  _updateHandAndPreviewZOrder(updatePreview = true) {
    const previewCard = DeckSelectionModel?.displayedCard;
    let topIndex = Game.stage.numChildren;

    const confirmationContainer = ConfirmationView?.container;
    if (confirmationContainer && Game.stage.contains(confirmationContainer)) {
      topIndex = Game.stage.getChildIndex(confirmationContainer);
    }

    if (updatePreview && previewCard && Game.stage.contains(previewCard)) {
      Game.stage.setChildIndex(previewCard, topIndex - 1);
    }

    for (const c of this.cardsInPlayerHand) {
      if (Game.stage.contains(c) && previewCard) {
        Game.stage.setChildIndex(c, Game.stage.getChildIndex(previewCard) - 1);
      }
    }
  }

  /**
   * Internal: attach ticker to maintain preview card above hand during animation
   * @param {createjs.Container} cardContainer
   */
  _attachPreviewTicker(cardContainer) {
    const previewCard = DeckSelectionModel?.displayedCard;
    if (!previewCard) {
      return;
    }

    /**
     * Attaches a ticker to the given card container, which maintains the
     * preview card above the hand during animation.
     * @param {createjs.Container} cardContainer
     */
    const tickHandler = () => {
      const confirmationContainer = ConfirmationView?.container;
      let topIndex = Game.stage.numChildren;
      if (confirmationContainer && Game.stage.contains(confirmationContainer)) {
        topIndex = Game.stage.getChildIndex(confirmationContainer);
      }

      if (Game.stage.contains(previewCard)) {
        Game.stage.setChildIndex(previewCard, topIndex - 1);
      }

      if (Game.stage.contains(cardContainer)) {
        Game.stage.setChildIndex(
          cardContainer,
          Game.stage.getChildIndex(previewCard) - 1,
        );
      }
    };

    createjs.Ticker.addEventListener("tick", tickHandler);
    createjs.Tween.get(cardContainer).call(() => {
      createjs.Ticker.removeEventListener("tick", tickHandler);
    });
  }
}
