/**
 * @fileoverview Common pixel offsets and dimensions used by the UI and game rendering.
 *
 * All values are in pixels unless otherwise noted.
 */

/**
 * Offsets and sizes used across the front-end for layout, animation and preview rendering.
 *
 * @typedef {Object} Offsets
 * @property {number} gameOffsetX - X offset (pixels) of the game area from the left edge of the canvas/container.
 * @property {number} gameOffsetY - Y offset (pixels) of the game area from the top edge of the canvas/container.
 * @property {number} handOffsetY - Y offset (pixels) of the player's hand area from the top of the view.
 * @property {number} handCardOffset - Horizontal spacing (pixels) between cards in the hand.
 * @property {number} cardOffsetX - Small X offset (pixels) used when laying out card artwork or borders.
 * @property {number} cardOffsetY - Small Y offset (pixels) used when laying out card artwork or borders.
 * @property {number} playerCursorOffset - Distance (pixels) used to position the player's cursor relative to a card.
 *
 * @property {number} cellWidth - Width (pixels) of a single board cell.
 * @property {number} cellHeight - Height (pixels) of a single board cell.
 *
 * @property {number} offscreenY - Y coordinate (pixels) used to position elements just off-screen for enter/exit animations.
 * @property {number} aiOffscreenX - X coordinate (pixels) used to position AI-owned cards off-screen (for animations).
 * @property {number} playerOffscreenX - X coordinate (pixels) used to position player-owned cards off-screen (for animations).
 *
 * @property {number} cardWidth - Base width (pixels) of a card sprite or thumbnail.
 * @property {number} cardHeight - Base height (pixels) of a card sprite or thumbnail.
 * @property {number} scaledCardWidth - Display width (pixels) of a scaled card used in certain UI states.
 * @property {number} scaledCardHeight - Display height (pixels) of a scaled card used in certain UI states.
 *
 * @property {number} previewX - X coordinate (pixels) where card previews are positioned.
 * @property {number} previewY - Y coordinate (pixels) where card previews are positioned.
 * @property {number} previewWidth - Base width (pixels) of the preview card.
 * @property {number} previewHeight - Base height (pixels) of the preview card.
 * @property {number} scaledPreviewWidth - Display width (pixels) of a scaled preview card.
 * @property {number} scaledPreviewHeight - Display height (pixels) of a scaled preview card.
 */

/** @type {Offsets} */
export const offsets = {
  gameOffsetX: 236,
  gameOffsetY: 50,
  handOffsetY: 50,
  handCardOffset: 95,
  cardOffsetX: 3,
  cardOffsetY: 3,

  playerCursorOffset: 130,

  cellWidth: 159,
  cellHeight: 184,

  offscreenY: -200,
  aiOffscreenX: 120,
  playerOffscreenX: 620,

  cardWidth: 93,
  cardHeight: 120,
  scaledCardWidth: 152,
  scaledCardHeight: 178,

  previewX: 600,
  previewY: 250,
  previewWidth: 93,
  previewHeight: 120,
  scaledPreviewWidth: 152,
  scaledPreviewHeight: 178,
};
