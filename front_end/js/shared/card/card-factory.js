import { config } from "../../constants/config.js";
import { Card } from "./card.js";

/**
 * Build a deck of Card objects from the API response returned by
 * get_player_cards.php.
 *
 * Each API card object contains:
 *   { id, display_name, image, strength_up, strength_right,
 *     strength_down, strength_left, element_id, quantity }
 *
 * @param {Array} apiCards - Array of card objects from the API.
 * @param {"player"|"ai"} owner
 * @returns {Card[]}
 */
export function createDeckFromApi(apiCards, owner = "player") {
  const deck = [];

  for (const card of apiCards) {
    const strength = {
      up: card.strength_up,
      right: card.strength_right,
      down: card.strength_down,
      left: card.strength_left,
    };

    const cardData = {
      id: card.id,
      name: card.display_name,
      element: card.element_id ?? undefined,
      strength,
      imagePath: `${config.imagePath}cards/${card.image}.png`,
    };

    const instance = new Card(cardData, owner, card.quantity);
    instance.initVisuals();
    deck.push(instance);
  }

  return deck;
}
