// -----------------------------
// PlayerCardManager
// -----------------------------
class PlayerCardManager {
  // -----------------------------
  // updateHandCards - updates the text/icon list on the selection board
  // -----------------------------
  updateHandCards() {
    var offset = (Game.ui.page - 1) * 11;

    // calculate how many cards are displayed
    if (Game.player.ownedCards.length >= 11) {
      if (Game.ui.page != Game.ui.totalPages) {
        Game.ui.displayedCards.length = 11;
      } else if (Game.ui.page == Game.ui.totalPages) {
        Game.ui.displayedCards.length = Game.ui.remainingCards;
      }
    } else {
      Game.ui.displayedCards.length = Object.keys(Game.player.ownedCards).length;
    }

    // change card colour for none left
    if (Game.ui.displayedCards[Game.ui.selectedHandCardNumber].count == 0) {
      Game.ui.displayedCards[Game.ui.selectedHandCardNumber].colour = "#909497";
    }
    if (Game.player.playerCards.length > 0) {
      if (Game.player.playerCards[Game.player.playerCards.length - 1].count > 0) {
        Game.player.playerCards[Game.player.playerCards.length - 1].colour = "#ffffff";
      }
    }

    // display the card texts and icons - we must operate on Game.ui.shownCards.children
    var j = 0;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[j]) {
        Game.ui.shownCards.children[j].text = Game.player.ownedCards[i + offset].displayName;
        Game.ui.shownCards.children[j].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[j].visible = true;
      }
      j += 3;
    }
    var k = 1;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[k]) {
        Game.ui.shownCards.children[k].text = Game.player.ownedCards[i + offset].count;
        Game.ui.shownCards.children[k].color = Game.player.ownedCards[i + offset].colour;
        Game.ui.shownCards.children[k].visible = true;
      }
      k += 3;
    }
    var l = 2;
    for (var i = 0; i < Game.ui.displayedCards.length; i++) {
      if (Game.ui.shownCards.children[l]) {
        Game.ui.shownCards.children[l].visible = true;
      }
      l += 3;
    }

    // hide excess lines if any
    for (var m = Game.ui.displayedCards.length * 3; m < 31; m++) {
      if (Game.ui.shownCards.children[j]) {
        Game.ui.shownCards.children[j].text = "";
      }
      if (Game.ui.shownCards.children[k]) {
        Game.ui.shownCards.children[k].text = "";
      }
      if (Game.ui.shownCards.children[l]) {
        Game.ui.shownCards.children[l].visible = false;
      }
      j++;
      k++;
      l++;
    }

    if (Game.ui.pageDisplay) {
      Game.ui.pageDisplay.text = Game.ui.page;
    }
  }

  // -----------------------------
  // updateDisplayedCard - update the preview image on the selection board
  // -----------------------------
  updateDisplayedCard() {
    if (!Game.ui.displayedCard) {
      return;
    }
    Game.ui.displayedCard.y = 700;
    if (
      Game.ui.displayedCard.children &&
      Game.ui.displayedCard.children[1] &&
      Game.ui.displayedCard.children[1].image
    ) {
      if (Game.ui.selectedHandCard) {
        Game.ui.displayedCard.children[1].image.src =
          Game.config.cardPath + Game.ui.selectedHandCard.image + ".png";
      }
    }
    createjs.Tween.get(Game.ui.displayedCard).to(
      {
        x: Game.ui.displayedCard.x,
        y: Game.ui.selectionBoardBackground.y + 200,
      },
      100
    );
  }
}

// -----------------------------
// Backwards-compatible function bindings
// -----------------------------
// Create manager instance (single instance to preserve previous single-file behaviour)
var __playerCardManager = window.__playerCardManager || new PlayerCardManager();

// Expose other functions that external files may call (same names as original)
function updateHandCards() {
  return __playerCardManager.updateHandCards();
}
function updateDisplayedCard() {
  return __playerCardManager.updateDisplayedCard();
}

// Also expose the instance for future debugging if required
window.__playerCardManager = __playerCardManager;
