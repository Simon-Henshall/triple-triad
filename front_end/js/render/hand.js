import { utils } from '../game/utils.js';
import { offsets } from './offsets.js';

export function createPlayerHandContainers(cards) {
  return cards.map((card, index) =>
    utils.createCardContainer(card, 'blue', offsets.handOffsetX, offsets.handOffsetY + index * offsets.handCardOffset)
  );
}
