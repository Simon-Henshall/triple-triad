/**
 * @module confirmation-view
 * @description Unit tests for ConfirmationView
 */

import { jest } from "@jest/globals";

describe("ConfirmationView", () => {
  let ConfirmationView;

  beforeAll(async () => {
    const module_ = await import("../phases/confirmation/confirmation-view.js");
    ConfirmationView = module_.ConfirmationView;
    // model is set dynamically at runtime; provide a minimal mock
    ConfirmationView.model = {};
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset internal state
    ConfirmationView.container = undefined;
    ConfirmationView.background = undefined;
  });

  test("ConfirmationView is defined", () => {
    expect(ConfirmationView).toBeDefined();
  });

  test("ConfirmationView has a model property", () => {
    expect(ConfirmationView.model).toBeDefined();
  });

  test("ConfirmationView has expected methods", () => {
    expect(typeof ConfirmationView.show).toBe("function");
    expect(typeof ConfirmationView.hide).toBe("function");
  });

  test("show calls drawConfirmationBox", () => {
    ConfirmationView.show();
    // After show, container and background should be initialized
    expect(ConfirmationView.container).toBeDefined();
    expect(ConfirmationView.background).toBeDefined();
  });

  test("hide removes all children from container", () => {
    ConfirmationView.show();
    ConfirmationView.hide();
    expect(ConfirmationView.container.removeAllChildren).toHaveBeenCalled();
  });

  test("hide does not throw when container is not set", () => {
    ConfirmationView.container = undefined;
    expect(() => ConfirmationView.hide()).not.toThrow();
  });

  test("drawConfirmationBox creates container and background", () => {
    ConfirmationView.drawConfirmationBox();
    expect(ConfirmationView.container).toBeDefined();
    expect(ConfirmationView.background).toBeDefined();
  });

  test("drawConfirmationBox adds elements to container", () => {
    ConfirmationView.drawConfirmationBox();
    expect(ConfirmationView.container.addChild).toHaveBeenCalled();
  });

  test("_ensureInitialised creates container if missing", () => {
    ConfirmationView.container = undefined;
    ConfirmationView._ensureInitialised();
    expect(ConfirmationView.container).toBeDefined();
  });

  test("_ensureInitialised creates background if missing", () => {
    ConfirmationView.background = undefined;
    ConfirmationView._ensureInitialised();
    expect(ConfirmationView.background).toBeDefined();
  });

  test("_ensureInitialised does not overwrite existing container", () => {
    const existingContainer = { existing: true };
    ConfirmationView.container = existingContainer;
    ConfirmationView._ensureInitialised();
    expect(ConfirmationView.container).toBe(existingContainer);
  });

  test("_ensureInitialised does not overwrite existing background", () => {
    const existingBackground = { existing: true };
    ConfirmationView.background = existingBackground;
    ConfirmationView._ensureInitialised();
    expect(ConfirmationView.background).toBe(existingBackground);
  });
});
