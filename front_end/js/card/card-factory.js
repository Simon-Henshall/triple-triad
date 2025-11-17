import { fallBackCardsForTesting } from "../constants/fallback-cards.js";
import { cards } from "../constants/cards.js";
import { config } from "../constants/config.js";
import { Card } from "./card.js";

/**
 * Maps minimal fallback card data to full card definitions
 * and returns an array of fully instantiated Card objects.
 * @param {"player"|"ai"} owner
 * @returns {Card[]}
 */
export function createDeck(owner = "player") {
  const deck = [];

  for (const fallback of fallBackCardsForTesting) {
    const cardMeta = cards.find((c) => c.image === fallback.image);

    if (!cardMeta) {
      console.warn(`[createDeck] No data for ${fallback.image}`);
      continue;
    }

    const strength = {
      up: cardMeta.strengthUp,
      right: cardMeta.strengthRight,
      down: cardMeta.strengthDown,
      left: cardMeta.strengthLeft,
    };

    const cardData = {
      id: fallback.card, // unique ID from fallback
      name: cardMeta.displayName, // map displayName → name
      element: cardMeta.element ?? undefined,
      strength, // mapped directional strength
      imagePath: `${config.imagePath}cards/${cardMeta.image}.png`,
    };

    const card = new Card(cardData, owner, fallback.count);
    card.initVisuals(); // initialise bitmaps immediately
    deck.push(card);
  }

  return deck;
}
