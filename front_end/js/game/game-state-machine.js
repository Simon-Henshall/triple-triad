import { Game } from "../shared/game/game.js";

export class StateMachine {
  constructor() {}

  getCurrentPhase() {}

  transitionTo(phaseName) {
    switch (phaseName) {
      case "deck-selection": {
        Game.setupSelectionBook(Game.managers.playerManager);
      }
      case "hand-select": {
        //console.log("Transitioning to hand-select");
      }
    }
  }
}
