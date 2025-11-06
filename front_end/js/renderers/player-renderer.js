import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { offsets } from "../constants/offsets.js";

/**
 * Handles all visual rendering and animation of the player's hand.
 */
export class PlayerRenderer {
  /**
   * @param {PlayerManager} playerManager - instance of PlayerManager
   */
  constructor(playerManager) {
    this.manager = playerManager;

    /** @type {Array<createjs.Container>} visual containers for hand cards */
    this.cardsInPlayerHand = [];

    /** X/Y offsets for hand stack */
    this.stackOffsetX = offsets.gameOffsetX + 515; // right-hand side offset
    this.stackOffsetY = offsets.handOffsetY || 50;
    this.stackSpacing = offsets.handCardOffset || 95;
  }

  /**
   * TODO: UNCALLED
   * Populate the player's hand visually.
   * @param {Array<Object>} playerCards
   */
  populateHand() {
    this.resetHand();

    for (const [index, card] of this.manager.cardsInHand.entries()) {
      const container = this._createCardContainer(card, index);
      this.cardsInPlayerHand.push(container);
      Game.stage.addChild(container);
    }

    // Default selection
    const firstCard = this.cardsInPlayerHand[0];
    if (firstCard) {
      UIManager.selectedCard = firstCard;
      UIManager.previouslySelectedCard = [];
      this.indentSelectedCard(firstCard);
    }

    // Ready state
    UIManager.playerConfirming = false;
    UIManager.playerChoosingCard = true;

    Game.stage.update();
  }

  /**
   * Animate a card to the hand (or remove it)
   * @param {createjs.Container} cardContainer
   * @param {number} index - target index
   * @param {boolean} remove - true if removing
   */
  animateCardToHand(cardContainer, index, remove = false) {
    const targetX = this.stackOffsetX;
    const targetY = this.stackOffsetY + index * this.stackSpacing;

    if (!remove) {
      cardContainer.x = targetX;
      cardContainer.y = Game.stage.canvas.height + 200;
      Game.stage.addChild(cardContainer);
      this.cardsInPlayerHand.push(cardContainer);
    }

    const finalY = remove ? Game.stage.canvas.height + 200 : targetY;

    createjs.Tween.get(cardContainer, { override: true })
      .to({ y: finalY }, 600, createjs.Ease.quadOut)
      .call(() => {
        if (remove) {
          const index_ = this.cardsInPlayerHand.indexOf(cardContainer);
          if (index_ !== -1) {
            this.cardsInPlayerHand.splice(index_, 1);
          }
          if (Game.stage.contains(cardContainer)) {
            Game.stage.removeChild(cardContainer);
          }
        }

        this._updateHandAndPreviewZOrder(!remove);
        Game.stage.update();
      });

    // Optional: keep preview on top while animating
    if (!remove) {
      this._attachPreviewTicker(cardContainer);
    }
  }

  /**
   * Visually indent the selected card
   * @param {createjs.Container} selectedCard
   */
  indentSelectedCard(selectedCard) {
    const previousCard = UIManager.previouslySelectedCard;

    if (selectedCard) {
      selectedCard.x -= 30;
    }

    if (previousCard && previousCard.x !== undefined) {
      previousCard.x += 30;
    }

    UIManager.previouslySelectedCard = selectedCard;
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
   * Internal: create a container for a card
   * @param {Object} card
   * @param {number} index
   * @returns {createjs.Container}
   */
  _createCardContainer(card, index) {
    // Assume utilities.createCardContainer exists
    return utilities.createCardContainer(
      card,
      "blue",
      this.stackOffsetX,
      this.stackOffsetY + index * this.stackSpacing,
    );
  }

  /**
   * Internal: ensures hand cards and preview are stacked correctly in z-order
   * @param {boolean} updatePreview
   */
  _updateHandAndPreviewZOrder(updatePreview = true) {
    const previewCard = UIManager.selectionBoard?.displayedCard;
    let topIndex = Game.stage.numChildren;

    const confirmationContainer = UIManager.confirmation?.container;
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
    const previewCard = UIManager.selectionBoard?.displayedCard;
    if (!previewCard) {
      return;
    }

    const tickHandler = () => {
      const confirmationContainer = UIManager.confirmation?.container;
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
