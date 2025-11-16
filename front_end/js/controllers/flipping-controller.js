import { FlippingRenderer } from "../renderers/flipping-renderer.js";
import { directionMap } from "../constants/directions.js";
import { getPlayerTurn } from "../utilities/turn.js";
import { Game } from "../game/game.js";
import { UIManager } from "../managers/ui-manager.js";
import { debug } from "../debug.js";

/**
 *
 */
export class FlippingController {
  /**
   *
   */
  constructor() {
    this.renderer = new FlippingRenderer(Game.stage);
  }

  /**
   *
   */
  flipCardsCheck(card) {
    console.log("flipCardsCheck()", card);
    console.log(
      "flipCardsCheck() start | card:",
      card.data.name,
      "owner:",
      card.owner,
    );
    for (const [direction, map] of Object.entries(directionMap)) {
      const target = card[map.prop];
      if (!target) {
        continue;
      }

      console.log(
        `flipCardsCheck(), Card: ${card.data.name} | owner: ${card.owner} | ` +
          `Target: ${target.data.name} | target.owner: ${target.owner} | Direction: ${direction}`,
      );

      if (
        card.owner !== target.owner &&
        card.data.strength[direction] >
          target.data.strength[map.opponentStrength]
      ) {
        console.log("Flipping card over!");
        this.flipCardOver(card, direction);
      }
    }
  }

  /**
   *
   */
  flipCardOver(card, direction) {
    const targetCard = card[directionMap[direction].prop];
    if (!targetCard) {
      return;
    }

    console.log(
      "flipCardOver() called | targetCard:",
      targetCard.data.name,
      "currentOwner:",
      targetCard.owner,
      "newOwner (getPlayerTurn()):",
      getPlayerTurn(),
    );

    if (!targetCard.visuals?.colourBitmaps) {
      console.warn(
        `[flipCardOver] colourBitmaps missing for card ${targetCard.data.name}`,
      );
      targetCard.initVisuals(); // initialize now if necessary
    }

    // Update ownership
    targetCard.setOwner(getPlayerTurn());

    // Animate flip visually
    // TODO: FIX THIS
    //this.renderer.flipCard(targetCard.visuals.container, direction);

    // Update counts
    this.updateOwnershipCounts(1);

    // Maintain UI references
    const squareObject = UIManager.squares[targetCard.inCell - 1];
    if (squareObject) {
      squareObject.card = targetCard;
    }
  }

  /**
   *
   */
  updateOwnershipCounts(flippedCount) {
    const turn = getPlayerTurn();
    const playerManager = Game.managers.playerManager;
    const aiManager = Game.managers.aiManager;

    const delta = {
      blue: { player: 1, ai: -1 },
      red: { player: -1, ai: 1 },
    };

    playerManager.totalBlueCards += delta[turn].player * flippedCount;
    aiManager.totalRedCards += delta[turn].ai * flippedCount;

    aiManager.aiCardCount.text = aiManager.totalRedCards;
    playerManager.playerCardCount.text = playerManager.totalBlueCards;

    Game.stage.update();
  }
}
