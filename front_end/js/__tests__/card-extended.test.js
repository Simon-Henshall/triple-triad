/**
 * @module card-extended
 * @description Extended unit tests for the Card class.
 */

import { jest } from "@jest/globals";
import { Card } from "../shared/card/card.js";

function buildMockImage(width = 100, height = 100, complete = true) {
  return {
    width,
    height,
    complete,
    naturalWidth: width,
    naturalHeight: height,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

function buildMockFaceBitmap(image) {
  return {
    image,
    name: "faceBitmap",
    x: 0,
    y: 0,
  };
}

function buildMockBackBitmap() {
  return { name: "backBitmap", x: 0, y: 0, visible: true };
}

function buildMockColourBitmap() {
  return { name: "colourBitmap", x: 0, y: 0, visible: true };
}

function buildMockContainer(children = []) {
  const containerChildren = [...children];
  return {
    children: containerChildren,
    name: "cardContainer",
    scaleX: 1,
    scaleY: 1,
    addChild: jest.fn(function (...kids) {
      containerChildren.push(...kids);
    }),
    removeAllChildren: jest.fn(),
    getChildByName: function (name) {
      return containerChildren.find((c) => c.name === name);
    },
    clone: function () {
      return {
        children: containerChildren.map((c) => ({ ...c })),
        getChildByName: function (name) {
          return this.children.find((c) => c.name === name);
        },
      };
    },
  };
}

describe("Card extended", () => {
  const sampleData = {
    id: 1,
    name: "Test",
    element: undefined,
    strength: { up: 1, down: 2, left: 3, right: 4 },
    imagePath: "test.png",
  };

  test("initVisuals sets up bitmaps and container", () => {
    const card = new Card(sampleData, "player", 1);
    const img = buildMockImage();
    const originalBitmap = globalThis.createjs.Bitmap;
    let bitmapCallIndex = 0;
    globalThis.createjs.Bitmap = jest.fn(function () {
      bitmapCallIndex++;
      if (bitmapCallIndex === 1) {
        return { image: img, name: "faceBitmap", x: 0, y: 0 };
      }
      if (bitmapCallIndex === 2) {
        return { name: "backBitmap", x: 0, y: 0 };
      }
      return { name: "colourBitmap", x: 0, y: 0 };
    });

    card.initVisuals();

    expect(card.visuals.faceBitmap).toBeDefined();
    expect(card.visuals.backBitmap).toBeDefined();
    expect(card.visuals.colourBitmap).toBeDefined();
    expect(card.visuals.container).toBeDefined();

    globalThis.createjs.Bitmap = originalBitmap;
  });

  test("setOwner sets owner and triggers container update", () => {
    const card = new Card(sampleData, "player", 1);
    const container = buildMockContainer([
      buildMockFaceBitmap(buildMockImage()),
      buildMockBackBitmap(),
      buildMockColourBitmap(),
    ]);
    container.stage = { update: jest.fn() };
    card.visuals.container = container;

    const result = card.setOwner("ai");
    expect(result).toBe("ai");
    expect(card.owner).toBe("ai");
  });

  test("setOwner handles container without matching child", () => {
    const card = new Card(sampleData, "player", 1);
    const container = buildMockContainer([
      buildMockFaceBitmap(buildMockImage()),
    ]);
    container.stage = { update: jest.fn() };
    card.visuals.container = container;

    const result = card.setOwner("ai");
    expect(result).toBe("ai");
    expect(card.owner).toBe("ai");
  });

  test("setCount updates count value", () => {
    const card = new Card(sampleData, "player", 1);
    card.setCount(99);
    expect(card.count).toBe(99);
  });

  test("clone copies data and optional owner/count", () => {
    const card = new Card(sampleData, "player", 5);
    card.visuals.container = buildMockContainer([
      buildMockFaceBitmap(buildMockImage()),
      buildMockBackBitmap(),
      buildMockColourBitmap(),
    ]);

    const copy = card.clone({ owner: "ai", count: 1 });
    expect(copy).toBeInstanceOf(Card);
    expect(copy.data.id).toBe(1);
    expect(copy.owner).toBe("ai");
    expect(copy.count).toBe(1);
    expect(copy.visuals.container).toBeDefined();
  });

  test("clone without container still creates a Card", () => {
    const card = new Card(sampleData, "player", 5);
    card.visuals.container = undefined;

    const copy = card.clone();
    expect(copy).toBeInstanceOf(Card);
    expect(copy.data.id).toBe(1);
    expect(copy.owner).toBe("player");
    expect(copy.count).toBe(5);
  });
});