/**
 * @module game-deck
 * @description Unit tests for the {@link GameDeck} class.
 */

import { jest } from "@jest/globals";
import { GameDeck } from "../shared/game/game-deck.js";

/**
 * Helper to create a minimal mock card object
 */
function createMockCard(id, name) {
  return { data: { id, name } };
}

/**
 * Helper to create a mock player model with a hand array
 */
function createMockPlayerModel() {
  return { hand: [] };
}

/**
 * Helper to create a mock AI turn model with a hand array
 */
function createMockAITurnModel() {
  return { hand: [] };
}

describe("GameDeck", () => {
  let playerModel;
  let aiTurnModel;
  let gameDeck;

  beforeEach(() => {
    playerModel = createMockPlayerModel();
    aiTurnModel = createMockAITurnModel();
    gameDeck = new GameDeck(playerModel, aiTurnModel);
  });

  describe("constructor", () => {
    test("sets initial state correctly", () => {
      expect(gameDeck.playerHand).toBe(playerModel.hand);
      expect(gameDeck.aiHand).toBe(aiTurnModel.hand);
      expect(gameDeck.previewCard).toBeUndefined();
      expect(gameDeck.playerModel).toBe(playerModel);
      expect(gameDeck.aiTurnModel).toBe(aiTurnModel);
    });
  });

  describe("moveCardFromDeckToHand", () => {
    test("moves a card from deck to hand", () => {
      const card = createMockCard(1, "TestCard");
      const fromDeck = [card];
      const toHand = [];

      const result = gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(result).toBe(card);
      expect(fromDeck).toHaveLength(0);
      expect(toHand).toHaveLength(1);
      expect(toHand[0]).toBe(card);
    });

    test("returns undefined when index is out of bounds", () => {
      const fromDeck = [];
      const toHand = [];

      const result = gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(result).toBeUndefined();
      expect(fromDeck).toHaveLength(0);
      expect(toHand).toHaveLength(0);
    });

    test("returns undefined when card at index is falsy", () => {
      const fromDeck = [undefined];
      const toHand = [];

      const result = gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(result).toBeUndefined();
    });

    test("updates playerHand symbolic link when moving to player hand", () => {
      const card = createMockCard(1, "TestCard");
      const fromDeck = [card];
      const toHand = gameDeck.playerHand;

      const freshHand = [];
      playerModel.hand = freshHand;

      gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(gameDeck.playerHand).toBe(freshHand);
    });

    test("updates aiHand symbolic link when moving to AI hand", () => {
      const card = createMockCard(1, "TestCard");
      const fromDeck = [card];
      const toHand = gameDeck.aiHand;

      const freshHand = [];
      aiTurnModel.hand = freshHand;

      gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(gameDeck.aiHand).toBe(freshHand);
    });

    test("does not update symbolic links when hand is neither player nor AI", () => {
      const card = createMockCard(1, "TestCard");
      const fromDeck = [card];
      const toHand = [];

      const originalPlayerHand = gameDeck.playerHand;
      const originalAIHand = gameDeck.aiHand;

      gameDeck.moveCardFromDeckToHand(fromDeck, toHand, 0);

      expect(gameDeck.playerHand).toBe(originalPlayerHand);
      expect(gameDeck.aiHand).toBe(originalAIHand);
    });
  });

  describe("moveCardFromHandToDeck", () => {
    test("moves a card from hand back to deck", () => {
      const card = createMockCard(1, "TestCard");
      const toDeck = [];
      const fromHand = [card];

      const result = gameDeck.moveCardFromHandToDeck(fromHand, toDeck, 0);

      expect(result).toBe(card);
      expect(fromHand).toHaveLength(0);
      expect(toDeck).toHaveLength(1);
      expect(toDeck[0]).toBe(card);
    });

    test("returns undefined when index is out of bounds", () => {
      const fromHand = [];

      const result = gameDeck.moveCardFromHandToDeck(fromHand, [], 0);

      expect(result).toBeUndefined();
    });

    test("updates playerHand symbolic link when moving from player hand", () => {
      const card = createMockCard(1, "TestCard");
      const fromHand = [card];
      const toDeck = [];

      // Replace playerModel.hand to a new array. The method iterates fromHand
      // but checks if fromHand === this.playerHand. Since fromHand is a reference
      // to the old hand, we assign playerModel.hand to a new array after passing
      // the reference check.
      const originalHand = playerModel.hand;
      const freshHand = [];
      playerModel.hand = freshHand;

      // The method checks fromHand === this.playerHand — but this.playerHand
      // was set in the constructor and points to the original empty array.
      // We need fromHand to be the actual hand reference from the deck.
      // Actually, the issue is that the splice in moveCardFromHandToDeck
      // operates on the passed in fromHand array, but the symbolic link update
      // looks at playerModel.hand which was changed.
      // For clarity: we need the fromHand argument to be the SAME array as
      // gameDeck.playerHand originally, not the new one.
      // The test setup: gameDeck.playerHand = playerModel.hand (same array ref)
      // After we call moveCardFromHandToDeck with fromHand = that original array,
      // it splices the card out. Then it checks if fromHand === this.playerHand.
      // Since playerModel.hand was replaced, this.playerHand will be updated
      // at the start of the method via the symbolic link sync.
      // Actually, reading the code: the method checks if fromHand === this.playerHand,
      // and if so, re-reads this.playerModel.hand. So when we reassign
      // playerModel.hand to a new array, the code will pick it up.
      // But the problem is that the *passed in* fromHand is the old array.
      // The code does: if fromHand === this.playerHand => this.playerHand = this.playerModel.hand
      // So if we pass fromHand = old hand array, but this.playerHand still equals old hand,
      // then the condition is true and it updates.
      // Let's just make the test clearer: we need to hold the old array.
      const oldHand = gameDeck.playerHand;
      oldHand.push(card); // put the card in the old hand

      gameDeck.moveCardFromHandToDeck(oldHand, toDeck, 0);

      // After the move, this.playerHand should equal playerModel.hand (the freshHand)
      expect(gameDeck.playerHand).toBe(playerModel.hand);
    });

    test("updates aiHand symbolic link when moving from AI hand", () => {
      const card = createMockCard(1, "TestCard");
      const toDeck = [];

      const oldHand = gameDeck.aiHand;
      oldHand.push(card);

      const freshHand = [];
      aiTurnModel.hand = freshHand;

      gameDeck.moveCardFromHandToDeck(oldHand, toDeck, 0);

      expect(gameDeck.aiHand).toBe(aiTurnModel.hand);
    });

    test("does not update symbolic links when hand is neither player nor AI", () => {
      const card = createMockCard(1, "TestCard");
      const fromHand = [card];

      const toDeck = [];

      const originalPlayerHand = gameDeck.playerHand;
      const originalAIHand = gameDeck.aiHand;

      gameDeck.moveCardFromHandToDeck(fromHand, toDeck, 0);

      expect(gameDeck.playerHand).toBe(originalPlayerHand);
      expect(gameDeck.aiHand).toBe(originalAIHand);
    });
  });
});
