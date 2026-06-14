/**
 * ai-hand-generator.js
 *
 * Generates the AI's hand of 5 cards using the rare-card system with an LCG PRNG.
 *
 * Flow:
 *  1. Check three binary flag conditions (A, B, C) for rare card eligibility
 *  2. If eligible, consume one PRNG advance and test against a threshold
 *  3. If the rare card is selected, place it in slot 1 then fill 4 common slots
 *  4. If no rare card, fill all 5 common slots
 *
 * Special cases:
 *  - Galbadian Bartender (opponent id 47): Doomtrain threshold lowered to 13/256
 *  - Left Diamond CC Group (opponent id 112): 100% rare card choice rate
 */

import { RNG } from "./rng.js";

/** Standard rare-card threshold: 26 out of 256 = ~10.16% */
const STANDARD_RARE_THRESHOLD = 26;

/** Doomtrain-suppressed threshold for Galbadian Bartender */
const DOOMTRAIN_RARE_THRESHOLD = 13;

/** Left Diamond CC Group threshold – bypasses probability gate */
const LEFT_DIAMOND_RARE_THRESHOLD = 256; // Always passes

/**
 * Generate a 5-card AI hand using the rare-card rules.
 *
 * @param {Array} commonCards - Card objects available as common draws (from the NPC's allowed levels)
 * @param {Object|null} rareCard - The NPC's rare Card object (has .data.id), or null/undefined if none
 * @param {number[]} playerCardIds - Array of card IDs owned by player 1
 * @param {Object} opponent - Opponent data object { id, name, location, unique_card_id, ... }
 * @param {RNG} rng - RNG instance to consume PRNG advances
 * @returns {Array} Array of 5 Card objects
 */
export function generateAIHand(
  commonCards,
  rareCard,
  playerCardIds,
  opponent,
  rng,
) {
  const hand = [];

  // ---- Step 1: Try to place a rare card (1 slot) ----
  const rareSlotFilled = tryPlaceRareCard(
    hand,
    rareCard,
    playerCardIds,
    opponent,
    rng,
  );

  // ---- Step 2: Fill remaining slots with common cards ----
  const slotsRemaining = 5 - hand.length;
  fillCommonCards(hand, commonCards, slotsRemaining, rng);

  // If somehow we still don't have 5 cards, pad with whatever remains
  while (hand.length < 5 && commonCards.length > 0) {
    const byte = rng.next();
    const index = byte % commonCards.length;
    hand.push(commonCards.splice(index, 1)[0]);
  }

  return hand;
}

/**
 * Attempt to place the rare card into the hand.
 *
 * @param {Array} hand - Hand array to mutate
 * @param {Object|null} rareCard - NPC's rare Card object
 * @param {number[]} playerCardIds - Player 1's owned card IDs
 * @param {Object} opponent - Opponent data
 * @param {RNG} rng - RNG instance
 * @returns {boolean} true if a rare card was placed in the hand
 */
function tryPlaceRareCard(hand, rareCard, playerCardIds, opponent, rng) {
  if (!rareCard) {
    return false;
  }

  // Determine the threshold for this opponent
  let threshold = STANDARD_RARE_THRESHOLD;

  // Special case: Galbadian Bartender (id 47) – Doomtrain (card 97)
  if (opponent.id === 47) {
    threshold = DOOMTRAIN_RARE_THRESHOLD;
  }

  // Special case: Left Diamond CC Group (id 112) – 100% rare card
  if (opponent.id === 112) {
    threshold = LEFT_DIAMOND_RARE_THRESHOLD;
  }

  // Flag A – Ownership Check
  // Does Player 1 currently possess this rare card? If TRUE, NPC cannot choose it.
  const playerOwnsRareCard = playerCardIds.includes(rareCard.data.id);
  if (playerOwnsRareCard) {
    console.log(
      `[AI Hand] Flag A: Player owns rare card "${rareCard.data.name}" (id ${rareCard.data.id}) – NPC cannot use it.`,
    );
    return false;
  }

  // Flag B – Game State Location Check
  // Is the rare card flagged as residing with this exact NPC, or is it unearned in the global pool?
  // In our implementation: does this NPC have a unique_card_id that matches the rare card?
  const rareCardIsWithNPC = opponent.unique_card_id === rareCard.data.id;
  if (!rareCardIsWithNPC) {
    console.log(
      `[AI Hand] Flag B: Rare card "${rareCard.data.name}" is not with this NPC – skipping.`,
    );
    return false;
  }

  // Flag C – The 1-Rare Ceiling
  // Has a rare card already been pushed to the opponent's hand array?
  // Since we generate the hand once, this is always false here.

  // All flags passed – consume one PRNG advance and test against threshold
  const byte = rng.next();
  const rareSelected = byte < threshold;

  if (rareSelected) {
    console.log(
      `[AI Hand] Rare card "${rareCard.data.name}" selected! (RNG byte ${byte} < threshold ${threshold})`,
    );
    hand.push(rareCard);
    return true;
  }

  console.log(
    `[AI Hand] Rare card "${rareCard.data.name}" NOT selected (RNG byte ${byte} >= threshold ${threshold}).`,
  );
  return false;
}

/**
 * Fill the hand with common cards from the available pool.
 * Uses the LCG PRNG to select each card.
 *
 * @param {Array} hand - Hand array to mutate
 * @param {Array} commonCards - Pool of common Card objects (will be cloned/spliced)
 * @param {number} count - Number of common cards to select
 * @param {RNG} rng - RNG instance
 */
function fillCommonCards(hand, commonCards, count, rng) {
  // Work on a shallow copy so the original array is not destroyed
  const pool = [...commonCards];

  for (let index = 0; index < count; index++) {
    if (pool.length === 0) {
      break;
    }

    const byte = rng.next();
    const pickIndex = byte % pool.length;
    const [card] = pool.splice(pickIndex, 1);
    hand.push(card);
  }
}
