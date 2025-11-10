import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { shuffle } from "./shuffle.js";
import { SelectionBoardUI } from "../renderers/selection-board-ui.js";
import { cards } from "../constants/cards.js";
import { fallBackCardsForTesting } from "../constants/fallback-cards.js";

/**
 * Process player's owned cards and initialize either random mode or selection board.
 * @param {string} deckJSON
 */
export function pickPlayerCards(selectedIndex) {
  const { playerManager, gameDeck } = Game.managers;

  // Ensure player deck is initialized if not already
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

  // Update UI (selection board display, counts, etc.)
  // TODO: Implement updateCounts method
  // UIManager.selectionBoard.updateCounts(
  //   playerManager.deck.length,
  //   playerManager.hand.length,
  // );

  // Optional: update preview card
  gameDeck.setPreviewCard(playerManager.deck[selectedIndex]);
}

/** Reset selection board state before picking cards */
function _resetSelectionBoardState() {
  UIManager.selectionBoard.page = 1;
  UIManager.selectionBoard.selectedHandCardNumber = 0;
  UIManager.selectionBoard.displayedCards = [];
  UIManager.selectionBoard.displayedCard = undefined;
}

/**
 * Parse owned cards JSON with fallback to hardcoded deck.
 * @param {string} deckJSON
 * @returns {Array} parsed card objects
 */
function _parseDeck(json) {
  try {
    return JSON.parse(json);
  } catch {
    console.warn("Failed to parse deckJSON, falling back to hardcoded deck");
    return fallBackCardsForTesting;
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

/**
 * Shuffle player's cards, populate AI hand, and start the game in random mode.
 * @param {Object} playerManager
 */
function _initialiseRandomMode(playerManager) {
  const aiManager = Game.managers.aiManager;
  playerManager.hand = shuffle($.extend(true, [], playerManager.deck));

  if (!aiManager.hand || aiManager.hand.length === 0) {
    aiManager.hand.populate();
  }

  Game.startGame();
}
