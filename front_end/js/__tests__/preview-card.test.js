/**
 * @module preview-card
 * @description Unit tests for the PreviewCard module.
 */

import { jest } from "@jest/globals";
import { PreviewCard } from "../shared/ui/preview-card.js";
import { Game } from "../shared/game/game.js";

describe("PreviewCard", () => {
  let mockStage;

  beforeEach(() => {
    jest.clearAllMocks();
    PreviewCard.shown = undefined;

    mockStage = {
      canvas: { height: 600, width: 800 },
      addChild: jest.fn(),
      removeChild: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
      update: jest.fn(),
    };
    Game.stage = mockStage;
  });

  test("shown is initially undefined", () => {
    PreviewCard.shown = undefined;
    expect(PreviewCard.shown).toBeUndefined();
  });

  test("showPreviewCard with null card does nothing", () => {
    expect(() => PreviewCard.showPreviewCard(null)).not.toThrow();
  });

  test("showPreviewCard with card without visuals does nothing", () => {
    expect(() => PreviewCard.showPreviewCard({})).not.toThrow();
  });

  test("showPreviewCard with valid card adds child to stage", () => {
    const container = {
      clone: jest.fn().mockReturnValue({
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
        getBounds: jest.fn().mockReturnValue({ width: 100, height: 100 }),
      }),
      getBounds: jest.fn().mockReturnValue({ width: 100, height: 100 }),
    };
    const card = { visuals: { container } };

    PreviewCard.showPreviewCard(card);

    expect(container.clone).toHaveBeenCalled();
    expect(mockStage.addChild).toHaveBeenCalled();
  });

  test("hidePreviewCard sets shown to undefined", () => {
    PreviewCard.hidePreviewCard();
    expect(PreviewCard.shown).toBeUndefined();
  });

  test("hidePreviewCard removes from stage if present", () => {
    const preview = { name: "preview" };
    PreviewCard.shown = preview;
    mockStage.contains.mockReturnValue(true);

    PreviewCard.hidePreviewCard();

    expect(mockStage.removeChild).toHaveBeenCalledWith(preview);
    expect(PreviewCard.shown).toBeUndefined();
  });
});