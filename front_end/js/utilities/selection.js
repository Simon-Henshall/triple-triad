import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { cards } from "../constants/cards.js";
import { fallBackCardsForTesting } from "../constants/fallback-cards.js";

/**
 * Process player's owned cards and initialize either random mode or selection board.
 * @param {string} deckJSON
 */
export function pickPlayerCards(selectedIndex) {
  const { playerManager, gameDeck } = Game.managers;

  // Ensure player deck is initialised if not already
  if (!playerManager.deck || playerManager.deck.length === 0) {
    const parsedCards = fallBackCardsForTesting;
    _populateDeck(playerManager, parsedCards);
  }

  // If the player is deselecting a card already in their hand
  const existingIndex = playerManager.hand.indexOf(
    playerManager.deck[selectedIndex],
  );

  if (existingIndex !== -1) {
    // Move from hand back to deck
    gameDeck.moveCardFromHandToDeck(
      playerManager.hand,
      playerManager.deck,
      existingIndex,
    );
  } else if (playerManager.hand.length < 5) {
    // Move from deck to hand
    gameDeck.moveCardFromDeckToHand(
      playerManager.deck,
      playerManager.hand,
      selectedIndex,
    );
  }
}

/**
 * Populate player's owned cards array from parsed data.
 * @param {Object} playerManager
 * @param {Array} parsedCards
 */
function _populateDeck(playerManager, parsedCards) {
  const cardsCopy = $.extend({}, cards || []);
  playerManager.deck = [];

  for (const [index, parsedCard] of parsedCards.entries()) {
    if (parsedCard.count > 0 && cardsCopy[index]) {
      UIManager.cardCount = parsedCard.count;
      cardsCopy[index].count = parsedCard.count;
      cardsCopy[index].colour = "#ffffff";
      playerManager.deck.push(cardsCopy[index]);
    }
  }

  console.log("Player deck populated:", playerManager.deck);
}
