// -----------------------------
// handRendering.js
// -----------------------------

// Ensure global containers exist
window.AIHand = window.AIHand || new createjs.Container();
window.playerHandCursor = window.playerHandCursor || new createjs.Container();

// -----------------------------
// Initialize AI Hand
function populateAIHand(cards = Game.ai?.cards || []) {
  if (!window.stage) return;

  window.AIHand.removeAllChildren();

  const startX = 200;
  const startY = 50;
  const spacing = 50;

  cards.forEach((card, i) => {
    const bmp = new createjs.Bitmap(Game.config.cardPath + card.image + ".png");
    bmp.x = startX + i * spacing;
    bmp.y = startY;

    // scale
    if (bmp.image?.height) {
      const s = 40 / bmp.image.height;
      bmp.scaleX = bmp.scaleY = s;
    } else if (bmp.image) {
      bmp.image.onload = () => {
        const s = 40 / bmp.image.height;
        bmp.scaleX = bmp.scaleY = s;
        window.stage && window.stage.update();
      };
    }

    window.AIHand.addChild(bmp);
  });

  if (!window.stage.contains(window.AIHand)) {
    window.stage.addChild(window.AIHand);
  }
  window.stage && window.stage.update();
}

// -----------------------------
// Initialize Player Hand Cursor
function placePlayerHandCursor(selectedIndex = 0, cards = Game.player?.cardsInPlayerHand || []) {
  if (!window.stage) return;

  window.playerHandCursor.removeAllChildren();

  if (!cards.length) return;

  const spacing = 50;
  const startX = 200;
  const y = Game.offsets.playerHandY || 450;

  const cursorBmp = new createjs.Bitmap(Game.config.imagePath + "cursor.png");
  const desired = 28;
  if (cursorBmp.image?.height) {
    const sc = desired / cursorBmp.image.height;
    cursorBmp.scaleX = cursorBmp.scaleY = sc;
  } else if (cursorBmp.image) {
    cursorBmp.image.onload = () => {
      const sc = desired / cursorBmp.image.height;
      cursorBmp.scaleX = cursorBmp.scaleY = sc;
      window.stage && window.stage.update();
    };
  }

  cursorBmp.x = startX + selectedIndex * spacing;
  cursorBmp.y = y;

  window.playerHandCursor.addChild(cursorBmp);

  if (!window.stage.contains(window.playerHandCursor)) {
    window.stage.addChild(window.playerHandCursor);
  }

  window.stage && window.stage.update();
}

// -----------------------------
// Move player hand cursor
function movePlayerHandCursor(direction) {
  const cards = Game.player?.cardsInPlayerHand || [];
  if (!cards.length) return;

  let idx = Game.ui.selectedHandCardNumber || 0;

  if (direction === "left" && idx > 0) idx--;
  if (direction === "right" && idx < cards.length - 1) idx++;

  Game.ui.selectedHandCardNumber = idx;

  placePlayerHandCursor(idx, cards);
}

// -----------------------------
// Remove player hand cursor
function removePlayerHandCursor() {
  if (!window.playerHandCursor) return;
  window.playerHandCursor.removeAllChildren();
  window.stage && window.stage.update();
}

// Expose API globally
window.populateAIHand = populateAIHand;
window.placePlayerHandCursor = placePlayerHandCursor;
window.movePlayerHandCursor = movePlayerHandCursor;
window.removePlayerHandCursor = removePlayerHandCursor;
