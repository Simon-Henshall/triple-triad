/**
 * @module main
 * @description Unit tests for main.js entry point
 */

import { jest } from "@jest/globals";

describe("main.js", () => {
  let documentAddEventListenerSpy;

  beforeAll(async () => {
    // Mock the document body before importing
    if (!globalThis.document) {
      globalThis.document = {
        addEventListener: jest.fn(),
        body: {
          ["classList"]: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        },
      };
    }

    documentAddEventListenerSpy = jest.spyOn(document, "addEventListener");
  });

  test("document.addEventListener is called with DOMContentLoaded", () => {
    expect(documentAddEventListenerSpy).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
    );
  });
});
