/*
TODO: Make use of this
*/
export class FlipManager {
  constructor(controller, renderer) {
    this.controller = controller;
    this.renderer = renderer;
  }

  flipCardsAround(card) {
    const flipped = this.controller.flipCardsCheck(card);
    for (const { target, direction } of flipped) {
      this.renderer.flipCard(target, direction);
    }
  }
}
