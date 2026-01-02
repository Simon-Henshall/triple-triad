/**
 * Fallback card dataset used for testing and as a safe fallback when
 * server-provided card data cannot be loaded.
 *
 * This module exports a single constant `fallBackCardsForTesting` containing
 * an array of card descriptors. Each descriptor describes the card id,
 * the image key/path (usually without extension) and the available count.
 *
 * @module fallback-cards
 */

/**
 * A single fallback card descriptor.
 *
 * @typedef {Object} CardFallback
 * @property {number} card - Numeric card identifier (usually 1-based id).
 * @property {string} image - Image key or filename (without extension) used to resolve the card image.
 * @property {number} count - Quantity of this card available in the fallback dataset.
 */

/**
 * Array of fallback card descriptors used by the front-end when real card data
 * is unavailable (for testing or offline use).
 *
 * Each array element conforms to the `CardFallback` typedef above.
 *
 * @type {CardFallback[]}
 * @example
 * import { fallBackCardsForTesting } from './fallback-cards.js';
 * // iterate and log card ids
 * fallBackCardsForTesting.forEach(({ card, image, count }) => {
 *   console.log(card, image, count);
 * });
 */
export const fallBackCardsForTesting = [
  { card: 1, image: "card0", count: 6 },
  { card: 2, image: "card1", count: 4 },
  { card: 3, image: "card2", count: 8 },
  { card: 4, image: "card3", count: 2 },
  { card: 5, image: "card4", count: 4 },
  { card: 6, image: "card5", count: 4 },
  { card: 7, image: "card6", count: 7 },
  { card: 8, image: "card7", count: 4 },
  { card: 9, image: "card8", count: 4 },
  { card: 10, image: "card9", count: 7 },
  { card: 11, image: "card10", count: 2 },
  { card: 12, image: "card11", count: 4 },
  { card: 13, image: "card12", count: 9 },
  { card: 14, image: "card13", count: 8 },
  { card: 15, image: "card14", count: 1 },
  { card: 16, image: "card15", count: 3 },
  { card: 17, image: "card16", count: 7 },
  { card: 18, image: "card17", count: 7 },
  { card: 19, image: "card18", count: 9 },
  { card: 20, image: "card19", count: 4 },
  { card: 21, image: "card20", count: 6 },
  { card: 22, image: "card21", count: 6 },
  { card: 23, image: "card22", count: 1 },
  { card: 24, image: "card23", count: 7 },
  { card: 25, image: "card24", count: 2 },
  { card: 26, image: "card25", count: 0 },
  { card: 27, image: "card26", count: 6 },
  { card: 28, image: "card27", count: 1 },
  { card: 29, image: "card28", count: 5 },
  { card: 30, image: "card29", count: 5 },
  { card: 31, image: "card30", count: 0 },
  { card: 32, image: "card31", count: 0 },
  { card: 33, image: "card32", count: 1 },
  { card: 34, image: "card33", count: 5 },
  { card: 35, image: "card34", count: 8 },
  { card: 36, image: "card35", count: 8 },
  { card: 37, image: "card36", count: 4 },
  { card: 38, image: "card37", count: 3 },
  { card: 39, image: "card38", count: 7 },
  { card: 40, image: "card39", count: 4 },
  { card: 41, image: "card40", count: 1 },
  { card: 42, image: "card41", count: 4 },
  { card: 43, image: "card42", count: 2 },
  { card: 44, image: "card43", count: 9 },
  { card: 45, image: "card44", count: 3 },
  { card: 46, image: "card45", count: 7 },
  { card: 47, image: "card46", count: 7 },
  { card: 48, image: "card47", count: 2 },
  { card: 49, image: "card48", count: 9 },
  { card: 50, image: "card49", count: 9 },
  { card: 51, image: "card50", count: 4 },
  { card: 52, image: "card51", count: 5 },
  { card: 53, image: "card52", count: 2 },
  { card: 54, image: "card53", count: 1 },
  { card: 55, image: "card54", count: 2 },
  { card: 56, image: "card55", count: 9 },
  { card: 57, image: "card56", count: 3 },
  { card: 58, image: "card57", count: 6 },
  { card: 59, image: "card58", count: 1 },
  { card: 60, image: "card59", count: 7 },
  { card: 61, image: "card60", count: 5 },
  { card: 62, image: "card61", count: 8 },
  { card: 63, image: "card62", count: 2 },
  { card: 64, image: "card63", count: 5 },
  { card: 65, image: "card64", count: 5 },
  { card: 66, image: "card65", count: 0 },
  { card: 67, image: "card66", count: 7 },
  { card: 68, image: "card67", count: 2 },
  { card: 69, image: "card68", count: 4 },
  { card: 70, image: "card69", count: 1 },
  { card: 71, image: "card70", count: 5 },
  { card: 72, image: "card71", count: 6 },
  { card: 73, image: "card72", count: 9 },
  { card: 74, image: "card73", count: 1 },
  { card: 75, image: "card74", count: 8 },
  { card: 76, image: "card75", count: 5 },
  { card: 77, image: "card76", count: 8 },
  { card: 78, image: "card77", count: 1 },
  { card: 79, image: "card78", count: 1 },
  { card: 80, image: "card79", count: 7 },
  { card: 81, image: "card80", count: 6 },
  { card: 82, image: "card81", count: 1 },
  { card: 83, image: "card82", count: 6 },
  { card: 84, image: "card83", count: 9 },
  { card: 85, image: "card84", count: 6 },
  { card: 86, image: "card85", count: 8 },
  { card: 87, image: "card86", count: 1 },
  { card: 88, image: "card87", count: 6 },
  { card: 89, image: "card88", count: 4 },
  { card: 90, image: "card89", count: 0 },
  { card: 91, image: "card90", count: 3 },
  { card: 92, image: "card91", count: 6 },
  { card: 93, image: "card92", count: 9 },
  { card: 94, image: "card93", count: 8 },
  { card: 95, image: "card94", count: 6 },
  { card: 96, image: "card95", count: 7 },
  { card: 97, image: "card96", count: 8 },
  { card: 98, image: "card97", count: 9 },
  { card: 99, image: "card98", count: 7 },
  { card: 100, image: "card99", count: 8 },
  { card: 101, image: "card100", count: 9 },
  { card: 102, image: "card101", count: 8 },
  { card: 103, image: "card102", count: 7 },
  { card: 104, image: "card103", count: 0 },
  { card: 105, image: "card104", count: 2 },
  { card: 106, image: "card105", count: 8 },
  { card: 107, image: "card106", count: 2 },
  { card: 108, image: "card107", count: 4 },
  { card: 109, image: "card108", count: 7 },
  { card: 110, image: "card109", count: 5 },
];
