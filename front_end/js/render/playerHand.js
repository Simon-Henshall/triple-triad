import { ui } from "./ui.js";
import { Game } from "../game/game.js";
import { player } from "./player.js";
import { offsets } from "./offsets.js";
import { utils } from "../game/utils.js";

export const playerHand = {
  cardsInPlayerHand: [],
  stackOffsetX: offsets.gameOffsetX + 515, // right-hand side offset
  stackOffsetY: offsets.handOffsetY || 50,
  stackSpacing: offsets.handCardOffset || 95,

  /**
   * Populate the player's hand with cards.
   * @param {Array<Object>} playerCards - Array of player-owned cards.
   */
  populate() {
    // Draw player hand from the current cards
    player.cardsInPlayerHand = player.playerCards.map((card, index) =>
      utils.createCardContainer(card, "blue", player.handOffsetX, offsets.handOffsetY + index * (offsets.handCardOffset || 95))
    );
    player.cardsInPlayerHand.forEach((container) =>
      Game.stage.addChild(container)
    );

    // TODO: Move this logic

    // Default selection
    ui.selectedCard = player.cardsInPlayerHand[0];
    ui.previouslySelectedCard = [];

    // Indent chosen card
    player.indentSelectedCard();

    // Ready for player to choose
    ui.playerConfirming = false;
    ui.playerChoosingCard = true;

    // END TODO

    Game.stage.update();
  },

  removeCardFromHand() {
    if (this.cardsInPlayerHand.length === 0) {
      return;
    }

    const removedCard = this.cardsInPlayerHand.pop();

    // Animate the removed card sliding back down off-screen
    createjs.Tween.get(removedCard)
      .to({ y: Game.stage.canvas.height + 200 }, 500, createjs.Ease.quadIn)
      .call(() => {
        Game.stage.removeChild(removedCard);
        Game.stage.update();
      });

    // Re-stack the remaining cards (optional smooth shift-up)
    this.cardsInPlayerHand.forEach((card, i) => {
      const targetY = this.stackOffsetY + i * this.stackSpacing;
      createjs.Tween.get(card).to({ y: targetY }, 300, createjs.Ease.quadOut);
    });
  },

  animateCardToHand(cardContainer, index, remove = false) {
    const targetX = this.stackOffsetX;
    const targetY = this.stackOffsetY + index * this.stackSpacing;

    if (!remove) {
      // Start offscreen for addition
      cardContainer.x = targetX;
      cardContainer.y = Game.stage.canvas.height + 200;
      Game.stage.addChild(cardContainer);
      this.cardsInPlayerHand.push(cardContainer);
    }

    const finalY = remove ? Game.stage.canvas.height + 200 : targetY;

    // Tween card
    createjs.Tween.get(cardContainer, { override: true })
      .to({ y: finalY }, 600, createjs.Ease.quadOut)
      .call(() => {
        if (remove) {
          const idx = this.cardsInPlayerHand.indexOf(cardContainer);
          if (idx >= 0) this.cardsInPlayerHand.splice(idx, 1);
          if (Game.stage.contains(cardContainer)) {
            Game.stage.removeChild(cardContainer);
          }
        }

        // Only update preview card z-order when not removing
        this._updateHandAndPreviewZOrder(!remove);
        Game.stage.update();
      });

    // Tick handler only for additions to keep preview on top
    if (!remove) {
      const previewCard = ui.selectionBoard?.displayedCard;
      if (previewCard) {
        const tickHandler = () => {
          const handCards = this.cardsInPlayerHand.filter((c) =>
            Game.stage.contains(c)
          );
          const confirmationContainer = ui.confirmation?.container;
          const confirmationIndex =
            confirmationContainer && Game.stage.contains(confirmationContainer)
              ? Game.stage.getChildIndex(confirmationContainer)
              : Game.stage.numChildren;

          // Preview above hand but below confirmation
          if (Game.stage.contains(previewCard)) {
            Game.stage.setChildIndex(previewCard, confirmationIndex - 1);
          }

          handCards.forEach((c) => {
            if (Game.stage.contains(c)) {
              Game.stage.setChildIndex(
                c,
                Game.stage.getChildIndex(previewCard) - 1
              );
            }
          });
        };

        createjs.Ticker.addEventListener("tick", tickHandler);
        createjs.Tween.get(cardContainer).call(() => {
          createjs.Ticker.removeEventListener("tick", tickHandler);
        });
      }
    }
  },
  /**
   * Fixes the z-order for all hand cards, preview card, and confirmation box.
   * Can be called after any major stage change.
   */
  _updateHandAndPreviewZOrder(updatePreview = true) {
    const previewCard = ui.selectionBoard?.displayedCard;
    const handCards = this.cardsInPlayerHand.filter((c) =>
      Game.stage.contains(c)
    );
    const confirmationContainer = ui.confirmation?.container;

    let topIndex = Game.stage.numChildren;

    if (confirmationContainer && Game.stage.contains(confirmationContainer)) {
      topIndex = Game.stage.getChildIndex(confirmationContainer);
    }

    if (updatePreview && previewCard && Game.stage.contains(previewCard)) {
      Game.stage.setChildIndex(previewCard, topIndex - 1);
    }

    handCards.forEach((c) => {
      if (Game.stage.contains(c) && previewCard) {
        Game.stage.setChildIndex(c, Game.stage.getChildIndex(previewCard) - 1);
      }
    });
  },

  resetAnimatedHand() {
    this.cardsInPlayerHand.forEach((card) => {
      Game.stage.removeChild(card);
    });
    this.cardsInPlayerHand = [];
    Game.stage.update();
  },
};
