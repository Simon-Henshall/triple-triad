/**
 * @module ai-turn-view-extended
 * @description Unit tests for AITurnView (extended)
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";
import { offsets } from "../constants/offsets.js";

describe("AiTurnView (extended)", () => {
  let AiTurnView;
  let stage;

  beforeAll(async () => {
    const module_ = await import("../phases/ai-turn/ai-turn-view.js");
    AiTurnView = module_.AITurnView;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    stage = {
      canvas: { width: 800, height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };
    Game.stage = stage;
  });

  test("constructor stores stage reference", () => {
    const view = new AiTurnView(stage);
    expect(view.stage).toBe(stage);
  });

  test("displayHand places each card and tweens them in", () => {
    const view = new AiTurnView(stage);
    const card1 = {
      visuals: {
        container: { x: 0, y: 0, alpha: 0 },
        faceBitmap: { visible: true },
        colourBitmap: { visible: true },
        backBitmap: { visible: false },
      },
    };
    const card2 = {
      visuals: {
        container: { x: 0, y: 0, alpha: 0 },
        faceBitmap: { visible: true },
        colourBitmap: { visible: true },
        backBitmap: { visible: false },
      },
    };
    view.displayHand([card1, card2], 100);
    expect(stage.addChild).toHaveBeenCalledWith(card1.visuals.container);
    expect(stage.addChild).toHaveBeenCalledWith(card2.visuals.container);
    // Back bitmap was made visible
    expect(card1.visuals.backBitmap.visible).toBe(true);
    expect(card2.visuals.backBitmap.visible).toBe(true);
    // createjs.Tween.get was called for each card
    expect(createjs.Tween.get).toHaveBeenCalled();
    // Stage was updated
    expect(stage.update).toHaveBeenCalled();
  });

  test("displayHand uses defaults when no offset is given", () => {
    const view = new AiTurnView(stage);
    const card = {
      visuals: {
        container: { x: 0, y: 0 },
        faceBitmap: { visible: true },
        colourBitmap: { visible: true },
        backBitmap: { visible: false },
      },
    };
    view.displayHand([card]);
    // x should be gameOffsetX / 2
    expect(card.visuals.container.x).toBe(offsets.gameOffsetX / 2);
  });

  test("shiftCardsDown animates cards shifting down", () => {
    const view = new AiTurnView(stage);
    const card1 = {
      visuals: { container: { y: 50 } },
    };
    const card2 = {
      visuals: { container: { y: 100 } },
    };
    view.shiftCardsDown([card1, card2], 50, 2);
    expect(createjs.Tween.get).toHaveBeenCalled();
  });

  test("shiftCardsDown handles missing card visuals", () => {
    const view = new AiTurnView(stage);
    view.shiftCardsDown([undefined, undefined], 50, 2);
    // createjs.Tween.get was not called
  });

  test("clearHand removes cards from stage and updates", () => {
    const view = new AiTurnView(stage);
    const card = { visuals: { container: { id: "c1" } } };
    view.clearHand([card]);
    expect(stage.removeChild).toHaveBeenCalledWith(card.visuals.container);
    expect(stage.update).toHaveBeenCalled();
  });

  test("clearHand handles cards without visuals.container", () => {
    const view = new AiTurnView(stage);
    // The code does `if (card?.visuals?.container)` - works for undefined
    const card1 = { visuals: {} };
    const card2 = undefined;
    expect(() => view.clearHand([card1, card2])).not.toThrow();
  });
});
