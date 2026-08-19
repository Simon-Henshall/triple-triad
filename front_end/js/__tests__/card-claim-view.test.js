import { jest } from "@jest/globals";
import CardClaimView from "../phases/card-claim/card-claim-view.js";

const makeStage = () => ({
  canvas: { width: 800, height: 600 },
  addChild: jest.fn(),
  removeChild: jest.fn(),
  update: jest.fn(),
});

const makeCard = (imagePath = "") => ({
  data: { imagePath },
});

describe("CardClaimView", () => {
  let stage;
  let view;

  beforeEach(() => {
    jest.clearAllMocks();
    stage = makeStage();
    view = new CardClaimView(stage);
  });

  test("builds the claim screen and renders cards", async () => {
    const cards = [makeCard(), makeCard(), makeCard()];

    await view.build(cards, 1);

    expect(stage.addChild).toHaveBeenCalledWith(view.container);
    expect(view.container.children).toHaveLength(7);
    expect(view.cardContainers).toHaveLength(3);
    expect(view.cardContainers[0].highlight.visible).toBe(false);
    expect(view.cardContainers[1].highlight.visible).toBe(true);
    expect(createjs.Tween.get).toHaveBeenCalledWith(view.container);
    expect(stage.update).toHaveBeenCalled();
  });

  test("handles empty cards and updates selection", async () => {
    await view.build([], 0);
    expect(view.cardContainers).toEqual([]);

    view.cardContainers = [
      { highlight: { visible: true } },
      { highlight: { visible: false } },
      undefined,
    ];
    view.updateSelection(1);

    expect(view.cardContainers[0].highlight.visible).toBe(false);
    expect(view.cardContainers[1].highlight.visible).toBe(true);
    expect(stage.update).toHaveBeenCalled();
  });

  test("preloads image paths and resolves load events", async () => {
    const image = {
      addEventListener: jest.fn((event, callback) => {
        if (event === "load") {
          callback();
        }
      }),
    };
    const originalImage = globalThis.Image;
    globalThis.Image = jest.fn(() => image);

    await expect(view._preloadImages([makeCard("card.png")])).resolves.toEqual(
      [],
    );
    expect(image.addEventListener).toHaveBeenCalledWith(
      "load",
      expect.any(Function),
    );
    expect(image.src).toBe("card.png");

    globalThis.Image = originalImage;
  });

  test("animates a selected card and completes for missing cards", () => {
    const onComplete = jest.fn();
    view.cardContainers = [{ wrapper: {} }];

    view.animateClaim(0, onComplete);
    expect(createjs.Tween.get).toHaveBeenCalledWith(
      view.cardContainers[0].wrapper,
    );
    expect(stage.update).toHaveBeenCalled();

    view.animateClaim(10, onComplete);
    expect(onComplete).toHaveBeenCalled();
  });

  test("cleanup removes an existing container and resets state", () => {
    const container = {};
    view.container = container;
    view.cardContainers = [{ wrapper: {} }];

    view.cleanup();

    expect(stage.removeChild).toHaveBeenCalledWith(container);
    expect(view.container).toBeUndefined();
    expect(view.cardContainers).toEqual([]);
  });
});
