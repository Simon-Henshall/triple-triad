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
      contains: jest.fn().mockReturnValue(false),
    };
    Game.stage = stage;
  });

  test("constructor stores stage reference", () => {
    const view = new AiTurnView(stage);
    expect(view.stage).toBe(stage);
  });

  test("displayHand shows card back when open rule is not active", () => {
    Game.rules = ["elemental"]; // no "open" rule
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
    // Back bitmap was made visible (closed rule behavior)
    expect(card1.visuals.backBitmap.visible).toBe(true);
    expect(card1.visuals.faceBitmap.visible).toBe(false);
    expect(card1.visuals.colourBitmap.visible).toBe(false);
    expect(card2.visuals.backBitmap.visible).toBe(true);
    expect(card2.visuals.faceBitmap.visible).toBe(false);
    expect(card2.visuals.colourBitmap.visible).toBe(false);
    // createjs.Tween.get was called for each card
    expect(createjs.Tween.get).toHaveBeenCalled();
    // Stage was updated
    expect(stage.update).toHaveBeenCalled();
  });

  test("displayHand shows card face when open rule is active", () => {
    Game.rules = ["elemental", "open"]; // "open" rule active
    const view = new AiTurnView(stage);
    const card1 = {
      visuals: {
        container: { x: 0, y: 0, alpha: 0 },
        faceBitmap: { visible: false },
        colourBitmap: { visible: false },
        backBitmap: { visible: true },
      },
    };
    const card2 = {
      visuals: {
        container: { x: 0, y: 0, alpha: 0 },
        faceBitmap: { visible: false },
        colourBitmap: { visible: false },
        backBitmap: { visible: true },
      },
    };
    view.displayHand([card1, card2], 100);
    expect(stage.addChild).toHaveBeenCalledWith(card1.visuals.container);
    expect(stage.addChild).toHaveBeenCalledWith(card2.visuals.container);
    // Face bitmap was made visible (open rule behavior)
    expect(card1.visuals.faceBitmap.visible).toBe(true);
    expect(card1.visuals.colourBitmap.visible).toBe(true);
    expect(card1.visuals.backBitmap.visible).toBe(false);
    expect(card2.visuals.faceBitmap.visible).toBe(true);
    expect(card2.visuals.colourBitmap.visible).toBe(true);
    expect(card2.visuals.backBitmap.visible).toBe(false);
    // createjs.Tween.get was called for each card
    expect(createjs.Tween.get).toHaveBeenCalled();
    // Stage was updated
    expect(stage.update).toHaveBeenCalled();
  });

  test("displayHand uses defaults when no offset is given", () => {
    Game.rules = ["elemental", "open"];
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

  test("showSelection positions the cursor and indents the selected card", () => {
    const view = new AiTurnView(stage);
    view.handOffsetX = 200;
    const card = { visuals: { container: { x: 200, y: 300 } } };

    view.showSelection([card], 0);

    expect(view.aiCursor.x).toBe(150);
    expect(view.aiCursor.y).toBe(380);
    expect(view.aiCursor.visible).toBe(true);
    expect(card.visuals.container.x).toBe(230);
    expect(stage.addChild).toHaveBeenCalledWith(view.aiCursor);
    expect(stage.update).toHaveBeenCalled();
  });

  test("showSelection ignores a missing card container", () => {
    const view = new AiTurnView(stage);
    expect(() => view.showSelection([{}], 0)).not.toThrow();
    expect(stage.addChild).not.toHaveBeenCalled();
  });

  test("hideSelection unindents the selected card and removes cursor", () => {
    const view = new AiTurnView(stage);
    view.handOffsetX = 200;
    const card = { visuals: { container: { x: 230, y: 300 } } };
    view.showSelection([card], 0);
    stage.contains.mockReturnValue(true);

    view.hideSelection([card]);

    expect(card.visuals.container.x).toBe(200);
    expect(stage.removeChild).toHaveBeenCalledWith(view.aiCursor);
    expect(view.aiCursor.visible).toBe(false);
    expect(view._selectedCardIndex).toBe(-1);
  });

  test("clearHand removes a visible cursor and all card containers", () => {
    const view = new AiTurnView(stage);
    const card = { visuals: { container: { id: "card" } } };
    stage.contains.mockReturnValue(true);

    view.clearHand([card]);

    expect(stage.removeChild).toHaveBeenCalledWith(view.aiCursor);
    expect(Game.stage.removeChild).toHaveBeenCalledWith(card.visuals.container);
    expect(view.aiCursor.visible).toBe(false);
    expect(view._selectedCardIndex).toBe(-1);
  });
});
