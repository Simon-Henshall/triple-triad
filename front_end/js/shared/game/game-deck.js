/**
 * GameDeck represents the player's and AI's hands, as well as the card
 * currently being previewed on the selection board.
 */
export class GameDeck {
  /**
   * Class representing the player's and AI's hands, as well as the card
   * currently being previewed on the selection board.
   */
  constructor(playerManager, aiTurnModel) {
    /** Symbolic link to PlayerManager.hand */
    this.playerHand = playerManager.hand;

    /** Symbolic link to AITurnModel.hand */
    this.aiHand = aiTurnModel.hand;

    /** Card currently previewed on selection board */
    this.previewCard = undefined;

    /** Keep references to the managers for deck operations */
    this.playerManager = playerManager;
    this.aiTurnModel = aiTurnModel;
  }

  /**
   * Move a card from a deck to a hand.
   * @param {Card[]} fromDeck - playerManager.deck or AITurnModel.deck
   * @param {Card[]} toHand - playerHand or aiHand
   * @param {number} cardIndex - index in the deck
   */
  moveCardFromDeckToHand(fromDeck, toHand, cardIndex) {
    if (!fromDeck[cardIndex]) {
      return;
    }

    const card = fromDeck.splice(cardIndex, 1)[0];
    toHand.push(card);

    // Keep the symbolic link updated automatically
    if (toHand === this.playerHand) {
      this.playerHand = this.playerManager.hand;
    } else if (toHand === this.aiHand) {
      this.aiHand = this.aiTurnModel.hand;
    }

    return card;
  }

  /**
   * Move a card from a hand back to the deck.
   * @param {Card[]} fromHand - playerHand or aiHand
   * @param {Card[]} toDeck - playerManager.deck or AITurnModel.deck
   * @param {number} cardIndex - index in the hand
   */
  moveCardFromHandToDeck(fromHand, toDeck, cardIndex) {
    if (!fromHand[cardIndex]) {
      return;
    }

    const card = fromHand.splice(cardIndex, 1)[0];
    toDeck.push(card);

    // Update symbolic link
    if (fromHand === this.playerHand) {
      this.playerHand = this.playerManager.hand;
    } else if (fromHand === this.aiHand) {
      this.aiHand = this.aiTurnModel.hand;
    }

    return card;
  }
}
