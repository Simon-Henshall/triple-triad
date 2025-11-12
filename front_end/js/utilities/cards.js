import { config } from "../config.js";
import { offsets } from "../constants/offsets.js";

/**
 * Create a scaled bitmap and call a callback once ready.
 * Handles image loading asynchronously, with fallback if already cached.
 * @param {string} source - Path to image file
 * @param {number} targetWidth - Desired bitmap width
 * @param {number} targetHeight - Desired bitmap height
 * @param {(bmp: createjs.Bitmap) => void} [onReady] - Callback when bitmap is ready
 * @returns {createjs.Bitmap} - The created bitmap
 */
export function createScaledBitmap(source, targetWidth, targetHeight, onReady) {
  const bmp = new createjs.Bitmap(source);
  /**
   *
   */
  const applyScale = () => {
    // Only scale once image dimensions are available
    if (bmp.image.width && bmp.image.height) {
      bmp.scaleX = targetWidth / bmp.image.width;
      bmp.scaleY = targetHeight / bmp.image.height;
    } else {
      // fallback if somehow width/height still 0
      bmp.scaleX = 1;
      bmp.scaleY = 1;
    }

    if (onReady) {
      onReady(bmp);
    }
  };

  // Ensure applyScale runs after image is fully loaded
  bmp.image.addEventListener("load", applyScale);

  // For cached images, onload may never fire in some browsers, so call immediately if complete
  if (bmp.image.complete) {
    // Schedule on next tick to let onload fire first if possible
    setTimeout(applyScale, 0);
  }

  // Optional: handle error
  bmp.image.addEventListener("error", () => {
    console.warn("Failed to load image:", source);
    applyScale();
  });

  return bmp;
}

/**
 * Create a container for a card, including owner image, stats, and optional back face.
 * @param {Object} cardData - Card metadata (strengths, element, displayName)
 * @param {string} ownerColour - "blue" or "red"
 * @param {number} x - X position of the card
 * @param {number} y - Y position of the card
 * @param {Object} options - Optional parameters
 * @param {boolean} [options.showBack=false] - Display back image
 * @param {string} [options.frontImageSrc] - Path for front image
 * @param {string} [options.backImageSrc] - Path for back image
 * @param {(bmp: createjs.Bitmap) => void} [options.onReady] - Callback when bitmap is ready
 * @returns {createjs.Container} - Container holding card graphics and metadata
 */
export function createCardContainer(
  cardData,
  ownerColour,
  x,
  y,
  { showBack = false, frontImageSrc, backImageSrc, onReady } = {},
) {
  if (!cardData) {
    console.warn("[createCardContainer] cardData is undefined!");
    return new createjs.Container();
  }

  const targetW =
    offsets.cardWidth || offsets.cellWidth - (offsets.cardOffsetX || 3) * 2;
  const targetH =
    offsets.cardHeight || offsets.cellHeight - (offsets.cardOffsetY || 3) * 2;

  // Determine front/back image paths
  const frontSource =
    frontImageSrc || `${config.cardPath}${cardData.image}.png`;
  const backSource = backImageSrc || `${config.cardPath}back.png`;

  // Create bitmaps
  const cardImage = createScaledBitmap(
    showBack ? backSource : frontSource,
    targetW,
    targetH,
    onReady,
  );
  const cardColour = createScaledBitmap(
    `${config.cardPath}${ownerColour}.png`,
    targetW,
    targetH,
    onReady,
  );

  // Container holds both background and face
  const container = new createjs.Container();
  container.addChild(cardColour, cardImage);

  // Store relevant card info for gameplay
  container.name = cardData.displayName;
  container.strengthUp = cardData.strengthUp;
  container.strengthRight = cardData.strengthRight;
  container.strengthDown = cardData.strengthDown;
  container.strengthLeft = cardData.strengthLeft;
  container.element = cardData.element;
  container.owner = ownerColour;
  container.background = ownerColour;

  if (showBack) {
    container.frontImage = frontSource;
    container.backImage = backSource;
  }

  container.x = x;
  container.y = y;

  return container;
}
