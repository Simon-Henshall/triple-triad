/*
 * @module ai-hand-generator
 * @description Unit tests for AI hand generator
 */

import { jest } from "@jest/globals";
import { generateAIHand } from "../utilities/ai-hand-generator.js";
import { RNG } from "../utilities/rng.js";

describe("generateAIHand", () => {
  let commonCards;
  let rareCard;
  let playerCardIds;
  let opponent;
  let rng;
  beforeEach(() => {
    jest.clearAllMocks();
    commonCards = [
      { data: { id: 1, name: "Geezard" } },
      { data: { id: 2, name: "Funguar" } },
      { data: { id: 3, name: "Bite Bug" } },
      { data: { id: 4, name: "Red Bat" } },
      { data: { id: 5, name: "Blobra" } },
      { data: { id: 6, name: "Caterchipillar" } },
    ];
    rareCard = { data: { id: 10, name: "Ifrit" } };
    playerCardIds = [1, 2, 3, 4, 5];
    opponent = { id: 30, name: "Test Opponent", unique_card_id: 10 };
    rng = new RNG(12_345);
  });

  test("returns an array of 5 cards", () => {
    const hand = generateAIHand(
      commonCards,
      rareCard,
      playerCardIds,
      opponent,
      rng,
    );
    expect(hand).toHaveLength(5);
  });

  test("returns objects with data properties", () => {
    const hand = generateAIHand(
      commonCards,
      rareCard,
      playerCardIds,
      opponent,
      rng,
    );
    for (const card of hand) {
      expect(card).toHaveProperty("data");
      expect(card.data).toHaveProperty("id");
    }
  });

  test("does not include player-owned rare card", () => {
    const playerWithRare = [1, 2, 3, 4, 10];
    const hand = generateAIHand(
      commonCards,
      rareCard,
      playerWithRare,
      opponent,
      rng,
    );
    expect(hand.filter((c) => c.data.id === 10)).toHaveLength(0);
  });

  test("handles no rare card", () => {
    const hand = generateAIHand(
      commonCards,
      undefined,
      playerCardIds,
      opponent,
      rng,
    );
    expect(hand).toHaveLength(5);
    for (const card of hand) {
      expect(card.data.id).not.toBe(10);
    }
  });

  test("handles opponent with no unique_card_id", () => {
    const noRareOpponent = { id: 30, name: "Test", unique_card_id: undefined };
    const hand = generateAIHand(
      commonCards,
      rareCard,
      playerCardIds,
      noRareOpponent,
      rng,
    );
    expect(hand).toHaveLength(5);
  });

  test("Left Diamond (id 112) 100% rare rate", () => {
    const diamondOpponent = {
      id: 112,
      name: "Left Diamond",
      unique_card_id: 10,
    };
    const testRng = new RNG(0);
    const hand = generateAIHand(
      commonCards,
      rareCard,
      [],
      diamondOpponent,
      testRng,
    );
    expect(hand.some((c) => c.data.id === 10)).toBe(true);
  });
});
