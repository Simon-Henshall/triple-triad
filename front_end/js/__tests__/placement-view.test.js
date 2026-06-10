/**
 * @module placement-view
 * @description Unit tests for PlacementView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("PlacementView", () => {
  let PlacementView;

  beforeAll(async () => {
    const module_ = await import("../phases/placement/placement-view.js");
    PlacementView = module_.PlacementView;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("constructor creates a PlacementView instance", () => {
    const view = new PlacementView();
    expect(view).toBeDefined();
  });

  test("indentAfterPlacement modifies selected card x position", () => {
    const view = new PlacementView();
    Game.models = {
      playerModel: {
        selectedCard: {
          visuals: { container: { x: 100 } },
        },
      },
    };
    view.indentAfterPlacement();
    expect(Game.models.playerModel.selectedCard.visuals.container.x).toBe(70);
  });

  test("indentAfterPlacement does nothing without selected card", () => {
    const view = new PlacementView();
    Game.models = { playerModel: {} };
    expect(() => view.indentAfterPlacement()).not.toThrow();
  });
});
