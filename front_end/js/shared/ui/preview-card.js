import { offsets } from "../../constants/offsets.js";
import { Game } from "../game/game.js";
import { UIModel } from "./ui-model.js";

export const PreviewCard = {
  showPreviewCard(card) {
    if (!card || !card.visuals || !card.visuals.container) {
      return;
    }

    this.hidePreviewCard();

    const original = card.visuals.container;
    const previewContainer = original.clone(true);

    const bounds = original.getBounds();
    if (bounds) {
      previewContainer.scaleX = offsets.scaledPreviewWidth / bounds.width;
      previewContainer.scaleY = offsets.scaledPreviewHeight / bounds.height;
    } else {
      previewContainer.scaleX = previewContainer.scaleY = 1;
    }

    previewContainer.x = offsets.previewX;
    previewContainer.y = offsets.previewY;

    UIModel.previewCardContainer = previewContainer;

    Game.stage.addChild(previewContainer);
    Game.stage.update();
  },

  hidePreviewCard() {
    const preview = UIModel.previewCardContainer;
    if (preview && Game.stage.contains(preview)) {
      Game.stage.removeChild(preview);
    }
    UIModel.previewCardContainer = undefined;
    Game.stage.update();
  },
};
