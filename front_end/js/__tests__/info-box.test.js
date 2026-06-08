/**
 * @module info-box
 * @description Unit tests for the InfoBox module.
 */

import { jest } from "@jest/globals";
import { InfoBox } from "../shared/ui/info-box.js";
import { Game } from "../shared/game/game.js";

describe("InfoBox", () => {
  let mockStage;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      setChildIndex: jest.fn(),
      getNumChildren: jest.fn().mockReturnValue(5),
      numChildren: 5,
    };

    Game.stage = mockStage;
    Game.models = { playerModel: { selectedCard: undefined } };

    // Reset InfoBox state
    InfoBox.container = undefined;
    InfoBox.cardName = undefined;

    // Ensure createjs populated
    if (globalThis.createjs === undefined) {
      globalThis.createjs = {
        Container: function () {
          this.removeAllChildren = jest.fn();
          this.addChild = jest.fn();
        },
        Shape: function () {
          this.graphics = {
            beginFill: jest.fn().mockReturnThis(),
            drawRect: jest.fn(),
          };
          this.setBounds = jest.fn();
          this.x = 0;
          this.y = 0;
        },
        Text: jest.fn(function (text, font, color) {
          this.text = text;
          this.font = font;
          this.color = color;
          this.textAlign = "left";
          this.textBaseline = "alphabetic";
          this.x = 0;
          this.y = 0;
        }),
        Stage: function () {
          this.addChild = jest.fn();
          this.update = jest.fn();
          this.numChildren = 0;
          this.getNumChildren = jest.fn().mockReturnValue(0);
          this.setChildIndex = jest.fn();
        },
      };
    }
  });

  test("container is initially undefined", () => {
    expect(InfoBox.container).toBeUndefined();
    expect(InfoBox.cardName).toBeUndefined();
  });

  test("drawInfoBox creates container and adds to stage", () => {
    InfoBox.drawInfoBox(Game);

    expect(InfoBox.container).toBeDefined();
    expect(mockStage.addChild).toHaveBeenCalledWith(InfoBox.container);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("drawInfoBox reuses existing container", () => {
    InfoBox.container = {
      removeAllChildren: jest.fn(),
      addChild: jest.fn(),
    };

    InfoBox.drawInfoBox(Game);

    expect(InfoBox.container.removeAllChildren).toHaveBeenCalled();
    expect(mockStage.addChild).toHaveBeenCalled();
  });

  test("updateInfoBox sets text when cardName exists and card is provided", () => {
    InfoBox.cardName = { text: "old" };

    InfoBox.updateInfoBox(Game, { data: { name: "TestCard" } });

    expect(InfoBox.cardName.text).toBe("TestCard");
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("updateInfoBox sets text from card name when card has no data", () => {
    InfoBox.cardName = { text: "" };

    InfoBox.updateInfoBox(Game, { name: "FallbackCard" });

    expect(InfoBox.cardName.text).toBe("FallbackCard");
  });

  test("updateInfoBox creates cardName if it does not exist", () => {
    InfoBox.cardName = undefined;

    InfoBox.updateInfoBox(Game, { name: "NewCard", data: { name: "NewCard" } });

    expect(InfoBox.cardName).toBeDefined();
    expect(InfoBox.cardName.text).toBe("NewCard");
  });

  test("toggleInfoBox sets visibility when container exists", () => {
    InfoBox.container = { visible: false };

    InfoBox.toggleInfoBox(Game, true);

    expect(InfoBox.container.visible).toBe(true);
    expect(mockStage.update).toHaveBeenCalled();
  });

  test("toggleInfoBox does nothing when container is undefined", () => {
    InfoBox.container = undefined;

    expect(() => InfoBox.toggleInfoBox(Game, true)).not.toThrow();
  });

  test("bringToFront sets child index when container exists", () => {
    InfoBox.container = { visible: false };

    InfoBox.bringToFront();

    expect(mockStage.setChildIndex).toHaveBeenCalledWith(
      InfoBox.container,
      expect.any(Number),
    );
    expect(InfoBox.container.visible).toBe(true);
  });

  test("bringToFront does nothing when container is undefined", () => {
    InfoBox.container = undefined;

    expect(() => InfoBox.bringToFront()).not.toThrow();
  });
});
