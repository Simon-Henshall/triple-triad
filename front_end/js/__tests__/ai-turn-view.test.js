/**
 * @module ai-turn-view
 * @description Unit tests for the AITurnView class.
 */

import { jest } from "@jest/globals";
import { AITurnView } from "../phases/ai-turn/ai-turn-view.js";
import { Game } from "../shared/game/game.js";

describe("AITurnView", () => {
  let mockStage;
  let view;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStage = {
      canvas: { height: 600 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
    };

    Game.stage = mockStage;
    view = new AITurnView(mockStage);
  });

  test("constructor stores stage", () => {
    expect(view.stage).toBe(mockStage);
  });

  test("displayHand with empty hand does nothing", () => {
    view.displayHand([], 100);
    expect(mockStage.addChild).not.toHaveBeenCalled();
  });

  test("displayHand iterates through cards and calls addChild", () => {
    const cards = [
      { visuals: { container: { x: 0, y: 0, alpha: 1 }, faceBitmap: { visible: true }, colourBitmap: { visible: true }, backBitmap: { visible: false } } },
      { visuals: { container: { x: 0, y: 0, alpha: 1 }, faceBitmap: { visible: true }, colourBitmap: { visible: true }, backBitmap: { visible: false } } },
    ];
    view.displayHand(cards, 100);
    expect(mockStage.addChild).toHaveBeenCalledTimes(2);
  });

  test("displayHand hides face and shows back", () => {
    const faceBitmap = { visible: true };
    const colourBitmap = { visible: true };
    const backBitmap = { visible: false };
    const cards = [
      { visuals: { container: { x: 0, y: 0, alpha: 1 }, faceBitmap, colourBitmap, backBitmap } },
    ];
    view.displayHand(cards, 50);
    expect(faceBitmap.visible).toBe(false);
    expect(colourBitmap.visible).toBe(false);
    expect(backBitmap.visible).toBe(true);
  });

  test("shiftCardsDown does nothing when playedIndex is 0", () => {
    const cards = [{ visuals: { container: { y: 100 } } }];
    expect(() => view.shiftCardsDown(cards, 30, 0)).not.toThrow();
  });

  test("shiftCardsDown iterates through hand up to playedIndex", () => {
    const cards = [
      { visuals: { container: { y: 100 } } },
      { visuals: { container: { y: 100 } } },
      { visuals: { container: { y: 100 } } },
    ];
    expect(() => view.shiftCardsDown(cards, 30, 2)).not.toThrow();
  });

  test("clearHand removes all cards and updates stage", () => {
    const cards = [
      { visuals: { container: { x: 0, y: 0 } } },
      { visuals: { container: { x: 0, y: 0 } } },
    ];
    view.clearHand(cards);
    expect(mockStage.removeChild).toHaveBeenCalledTimes(2);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("clearHand handles empty hand", () => {
    expect(() => view.clearHand([])).not.toThrow();
  });
});