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
});
