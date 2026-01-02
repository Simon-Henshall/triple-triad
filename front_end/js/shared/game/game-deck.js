/**
 * GameDeck represents the player's and AI's hands, as well as the card
 * currently being previewed on the selection board.
 */
export class GameDeck {
  /**
   * Class representing the player's and AI's hands, as well as the card
   * currently being previewed on the selection board.
   */
  constructor(playerModel, aiTurnModel) {
    /** Symbolic link to PlayerModel.hand */
    this.playerHand = playerModel.hand;

    /** Symbolic link to AITurnModel.hand */
    this.aiHand = aiTurnModel.hand;

    /** Card currently previewed on selection board */
    this.previewCard = undefined;

    /** Keep references to the models for deck operations */
    this.playerModel = playerModel;
    this.aiTurnModel = aiTurnModel;
  }

  /**
   * Move a card from a deck to a hand.
   * @param {Card[]} fromDeck - playerModel.deck or AITurnModel.deck
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
      this.playerHand = this.playerModel.hand;
    } else if (toHand === this.aiHand) {
      this.aiHand = this.aiTurnModel.hand;
    }

    return card;
  }

  /**
   * Move a card from a hand back to the deck.
   * @param {Card[]} fromHand - playerHand or aiHand
   * @param {Card[]} toDeck - playerModel.deck or AITurnModel.deck
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
      this.playerHand = this.playerModel.hand;
    } else if (fromHand === this.aiHand) {
      this.aiHand = this.aiTurnModel.hand;
    }

    return card;
  }
}
