import { jest } from "@jest/globals";

globalThis.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock createjs globally for tests that import modules using it
if (globalThis.createjs === undefined) {
  globalThis.createjs = {
    Container: function () {
      this.children = [];
      this.addChild = jest.fn(function (child) {
        this.children.push(child);
      });
      this.removeAllChildren = jest.fn(function () {
        this.children = [];
      });
      this.removeChild = jest.fn();
      this.getChildByName = function () {
        return;
      };
      this.clone = function () {
        return {
          /**
           * Mock implementation of getChildByName for testing. In a real test, this would return the actual child with the specified name.
           * @param {string} name - The name of the child to retrieve.
           * @return {object} A mock child object with x and y properties.
           */
          getChildByName: () => {},
          children: [],
        };
      };
      this.globalToLocal = function (x, y) {
        return { x, y };
      };
      this.contains = jest.fn().mockReturnValue(false);
      this.getNumChildren = jest.fn().mockReturnValue(0);
      this.getChildAt = jest.fn().mockReturnValue();
      this.addChildAt = jest.fn();
      this.getBounds = function () {
        return { width: 100, height: 100 };
      };
      this.addEventListener = jest.fn();
      this.removeEventListener = jest.fn();
      this.remove = jest.fn();
      this.hitArea = undefined;
      this.update = jest.fn();
      this.updateCache = jest.fn();
      this.setChildIndex = jest.fn();
      this.getChildIndex = jest.fn().mockReturnValue(0);
      this.alpha = 1;
      this.visible = true;
      this.x = 0;
      this.y = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.skewY = 0;
    },
    Bitmap: jest.fn(function () {
      this.image = {
        complete: true,
        naturalWidth: 100,
        naturalHeight: 100,
        width: 100,
        height: 100,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      this.name = "";
      this.x = 0;
      this.y = 0;
      this.visible = true;
      this.alpha = 1;
    }),
    Shape: function () {
      this.graphics = {
        beginFill: jest.fn().mockReturnThis(),
        drawRect: jest.fn().mockReturnThis(),
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
    Ticker: {
      setFPS: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Ease: {
      quadIn: "quadIn",
      quadOut: "quadOut",
      linear: "linear",
      backIn: "backIn",
      backOut: "backOut",
    },
    Tween: {
      get: jest.fn().mockReturnValue({
        to: jest.fn().mockReturnValue({ to: jest.fn(), call: jest.fn() }),
        call: jest.fn().mockReturnValue({ to: jest.fn() }),
      }),
    },
    Stage: function () {
      this.canvas = { width: 800, height: 600 };
      this.addChild = jest.fn();
      this.update = jest.fn();
      this.setChildIndex = jest.fn();
      this.numChildren = 0;
      this.getNumChildren = jest.fn().mockReturnValue(0);
      this.removeChild = jest.fn();
      this.getChildByName = jest.fn();
      this.contains = jest.fn().mockReturnValue(false);
      this.getChildIndex = jest.fn().mockReturnValue(0);
    },
  };
}

// Mock Image
if (globalThis.Image === undefined) {
  globalThis.Image = function () {
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.complete = true;
    this.naturalWidth = 100;
    this.naturalHeight = 100;
  };
}

// Mock document
if (globalThis.document === undefined) {
  globalThis.document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}
