/**
 * @module deck-selection-view
 * @description Unit tests for DeckSelectionView
 */

import { jest } from "@jest/globals";
import { Game } from "../shared/game/game.js";

describe("DeckSelectionView", () => {
  let DeckSelectionView;
  let DeckSelectionModel;

  beforeAll(async () => {
    const module_ = await import(
      "../phases/deck-selection/deck-selection-view.js"
    );
    DeckSelectionView = module_.DeckSelectionView;

    const modelModule = await import(
      "../phases/deck-selection/deck-selection-model.js"
    );
    DeckSelectionModel = modelModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    Game.stage = {
      addChild: jest.fn(),
      removeChild: jest.fn(),
      update: jest.fn(),
      numChildren: 0,
      getNumChildren: jest.fn().mockReturnValue(0),
      getChildIndex: jest.fn().mockReturnValue(0),
      setChildIndex: jest.fn(),
      contains: jest.fn().mockReturnValue(false),
    };

    Game.models = {
      playerModel: {
        playerHandSelectionCursor: {
          x: 0,
          y: 0,
          visible: false,
        },
      },
    };

    // Reset DeckSelectionModel singleton state
    DeckSelectionModel.container = new createjs.Container();
    DeckSelectionModel.shownCards = undefined;
    DeckSelectionModel.cardIcons = undefined;
    DeckSelectionModel.cardNameTexts = undefined;
    DeckSelectionModel.cardCountTexts = undefined;
    DeckSelectionModel.background = {
      x: 100,
      y: 100,
    };
    DeckSelectionModel.pageDisplay = undefined;
  });

  describe("populate", () => {
    test("returns early if container is not set", () => {
      DeckSelectionModel.container = undefined;

      expect(() =>
        DeckSelectionView.populate({
          visibleCards: [],
          selectedIndexOnPage: 0,
          currentPage: 1,
        }),
      ).not.toThrow();
    });

    test("creates shownCards container if not already present", () => {
      DeckSelectionModel.shownCards = undefined;
      DeckSelectionModel.cardIcons = undefined;
      DeckSelectionModel.cardNameTexts = undefined;
      DeckSelectionModel.cardCountTexts = undefined;

      const mockController = {
        visibleCards: [],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      expect(DeckSelectionModel.shownCards).toBeDefined();
      expect(DeckSelectionModel.cardIcons).toEqual([]);
      expect(DeckSelectionModel.cardNameTexts).toEqual([]);
      expect(DeckSelectionModel.cardCountTexts).toEqual([]);
    });

    test("calls removeAllChildren on shownCards", () => {
      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      expect(mockShownCards.removeAllChildren).toHaveBeenCalled();
    });

    test("creates card rows for visible cards", () => {
      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [
          { data: { name: "Card A" }, remaining: 3 },
          { data: { name: "Card B" }, remaining: 0 },
        ],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      // Each card row calls addChild(icon, nameText, countText) - 1 call per row
      expect(mockShownCards.addChild).toHaveBeenCalledTimes(2);
    });

    test("creates card rows with zero remaining cards", () => {
      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [{ data: { name: "Empty Card" }, remaining: 0 }],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      // 1 card row = 1 addChild call with 3 args
      expect(mockShownCards.addChild).toHaveBeenCalledTimes(1);
    });

    test("updates page display text", () => {
      DeckSelectionModel.pageDisplay = { text: "" };

      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [],
        selectedIndexOnPage: 0,
        currentPage: 5,
      };

      DeckSelectionView.populate(mockController);

      expect(DeckSelectionModel.pageDisplay.text).toBe("5");
    });

    test("adds shownCards to container if not already a child", () => {
      const mockContainer = {
        addChild: jest.fn(),
        children: [],
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;

      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      expect(mockContainer.addChild).toHaveBeenCalledWith(mockShownCards);
    });

    test("does not add shownCards to container if already a child", () => {
      // Create the mockShownCards object first so we can reference it
      const mockShownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };

      // Create the cursor reference that _updateCursor will look up
      const cursor = {
        x: 0,
        y: 0,
        visible: false,
      };
      Game.models.playerModel.playerHandSelectionCursor = cursor;

      // Put both shownCards AND cursor in the container's children array
      // so Array.includes() will find them
      const mockContainer = {
        addChild: jest.fn(),
        children: [mockShownCards, cursor],
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;
      DeckSelectionModel.shownCards = mockShownCards;
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const mockController = {
        visibleCards: [],
        selectedIndexOnPage: 0,
        currentPage: 1,
      };

      DeckSelectionView.populate(mockController);

      // Neither shownCards nor cursor should be added since both are already children
      expect(mockContainer.addChild).not.toHaveBeenCalled();
    });
  });

  describe("_addCardRow", () => {
    test("creates icon when not cached", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Test Card" }, remaining: 2 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 2);

      expect(DeckSelectionModel.cardIcons[0]).toBeDefined();
    });

    test("reuses cached icon", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      const existingIcon = { x: 0, y: 0 };
      DeckSelectionModel.cardIcons = [existingIcon];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Test Card" }, remaining: 2 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 2);

      expect(DeckSelectionModel.cardIcons[0]).toBe(existingIcon);
    });

    test("updates existing name text", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      const existingNameText = { text: "", x: 0, y: 0 };
      DeckSelectionModel.cardNameTexts = [existingNameText];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Updated Name" }, remaining: 2 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 2);

      expect(DeckSelectionModel.cardNameTexts[0]).toBe(existingNameText);
    });

    test("updates existing count text", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      const existingCountText = {
        text: "",
        x: 0,
        y: 0,
        color: "#ffffff",
      };
      DeckSelectionModel.cardCountTexts = [existingCountText];

      const card = { data: { name: "Test Card" }, remaining: 5 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 5);

      expect(DeckSelectionModel.cardCountTexts[0]).toBe(existingCountText);
      expect(DeckSelectionModel.cardCountTexts[0].color).toBe("#ffffff");
    });

    test("uses grey color for zero remaining cards", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Test Card" }, remaining: 0 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 0);

      expect(DeckSelectionModel.cardCountTexts[0].color).toBe("#888");
    });

    test("uses white color for non-zero remaining cards", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Test Card" }, remaining: 3 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 3);

      expect(DeckSelectionModel.cardCountTexts[0].color).toBe("#ffffff");
    });

    test("adds icon, nameText, and countText to shownCards", () => {
      DeckSelectionModel.shownCards = {
        removeAllChildren: jest.fn(),
        addChild: jest.fn(),
        children: [],
      };
      DeckSelectionModel.cardIcons = [];
      DeckSelectionModel.cardNameTexts = [];
      DeckSelectionModel.cardCountTexts = [];

      const card = { data: { name: "Test Card" }, remaining: 3 };

      DeckSelectionView._addCardRow(DeckSelectionModel, card, 0, 3);

      // addChild is called once with 3 arguments (icon, nameText, countText)
      expect(DeckSelectionModel.shownCards.addChild).toHaveBeenCalledTimes(1);
    });
  });

  describe("_updateCursor", () => {
    test("returns early if cursor is not set", () => {
      Game.models.playerModel.playerHandSelectionCursor = undefined;

      expect(() =>
        DeckSelectionView._updateCursor({
          selectedIndexOnPage: 0,
        }),
      ).not.toThrow();
    });

    test("positions cursor based on selectedIndexOnPage", () => {
      const mockContainer = {
        children: [],
        addChild: jest.fn(),
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;

      const cursor = { x: 0, y: 0, visible: false };
      Game.models.playerModel.playerHandSelectionCursor = cursor;

      DeckSelectionView._updateCursor({
        selectedIndexOnPage: 2,
      });

      expect(cursor.x).toBeDefined();
      expect(cursor.y).toBeDefined();
      expect(cursor.visible).toBe(true);
    });

    test("adds cursor to container if not already a child", () => {
      const mockContainer = {
        children: [],
        addChild: jest.fn(),
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;

      const cursor = { x: 0, y: 0, visible: false };
      Game.models.playerModel.playerHandSelectionCursor = cursor;

      DeckSelectionView._updateCursor({
        selectedIndexOnPage: 0,
      });

      expect(mockContainer.addChild).toHaveBeenCalledWith(cursor);
    });

    test("does not add cursor to container if already a child", () => {
      // Create the cursor first so we can reference the same object
      const cursor = { x: 0, y: 0, visible: false };

      const mockContainer = {
        children: [cursor], // same reference
        addChild: jest.fn(),
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;
      Game.models.playerModel.playerHandSelectionCursor = cursor;

      DeckSelectionView._updateCursor({
        selectedIndexOnPage: 0,
      });

      expect(mockContainer.addChild).not.toHaveBeenCalled();
    });

    test("sets cursor to top of z-order", () => {
      const mockContainer = {
        children: [],
        addChild: jest.fn(),
        setChildIndex: jest.fn(),
      };
      DeckSelectionModel.container = mockContainer;

      const cursor = { x: 0, y: 0, visible: false };
      Game.models.playerModel.playerHandSelectionCursor = cursor;

      DeckSelectionView._updateCursor({
        selectedIndexOnPage: 0,
      });

      expect(mockContainer.setChildIndex).toHaveBeenCalled();
    });
  });
});
