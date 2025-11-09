import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { shuffle } from "./shuffle.js";
import { ai } from "../game/ai.js";
import { SelectionBoardUI } from "../renderers/selection-board-ui.js";
import { cards } from "../constants/cards.js";
import { fallBackCardsForTesting } from "../constants/fallback-cards.js";

/**
 * Process player's owned cards and initialize either random mode or selection board.
 * @param {string} deckJSON
 */
export function pickPlayerCards(deckJSON) {
  const playerManager = Game.managers.playerManager;

  _resetSelectionBoardState();
  const parsedCards = _parseDeck(deckJSON);
  _populateDeck(playerManager, parsedCards);

  if (Game.rules.includes("random")) {
    _initialiseRandomMode(playerManager);
  } else {
    _setupSelectionBoard(playerManager);
  }
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
  playerManager.hand = shuffle($.extend(true, [], playerManager.deck));

  if (!ai.cardsInAIHand || ai.cardsInAIHand.length === 0) {
    ai.aiHand.populate();
  }

  Game.startGame();
}

/**
 * Setup selection board visuals, AI hand, and allow player to pick cards.
 * @param {Object} playerManager
 */
function _setupSelectionBoard(playerManager) {
  // Populate AI hand and selection board
  ai.aiHand.populate();
  SelectionBoardUI.initialise(playerManager.deck);

  // SelectionBoardUI will now handle drawing background/text
  SelectionBoardUI.initialise(playerManager.deck);

  // Place cursor and enable selection
  Game.controllers.cursorController.selection.place();
  UIManager.playerSelectingHand = true;
}
