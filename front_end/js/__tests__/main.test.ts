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

    // Import main.js to trigger the DOMContentLoaded listener registration
    await import("../main.js");
  });

  test("document.addEventListener is called with DOMContentLoaded", () => {
    expect(documentAddEventListenerSpy).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
    );
  });

  test("DOMContentLoaded loads APIs and initializes the game", async () => {
    const { gameInit } = await import("../shared/game/game-init.js");
    const allSpy = jest.spyOn(gameInit, "all").mockResolvedValue();
    const originalFetch = globalThis.fetch;
    const originalBody = document.body;
    const removeLoading = jest.fn();
    document.body = {
      classList: { add: jest.fn(), remove: removeLoading },
    };
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, cards: [{ id: 1 }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          opponents: [{ name: "Balamb", players: [{ name: "Player" }] }],
        }),
      });

    const domReadyHandler = documentAddEventListenerSpy.mock.calls
      .filter(([eventName]) => eventName === "DOMContentLoaded")
      .at(-1)[1];
    await domReadyHandler();

    expect(allSpy).toHaveBeenCalledWith(
      [{ id: 1 }],
      [{ name: "Balamb", players: [{ name: "Player" }] }],
    );
    expect(document.body.classList.add).toHaveBeenCalledWith("loading");
    expect(removeLoading).toHaveBeenCalledWith("loading");

    allSpy.mockRestore();
    globalThis.fetch = originalFetch;
    document.body = originalBody;
  });

  test("DOMContentLoaded still initializes when API requests fail", async () => {
    const { gameInit } = await import("../shared/game/game-init.js");
    const allSpy = jest.spyOn(gameInit, "all").mockResolvedValue();
    const originalFetch = globalThis.fetch;
    const originalBody = document.body;
    document.body = { classList: { add: jest.fn(), remove: jest.fn() } };
    globalThis.fetch = jest.fn().mockRejectedValue(new Error("offline"));

    const domReadyHandler = documentAddEventListenerSpy.mock.calls
      .filter(([eventName]) => eventName === "DOMContentLoaded")
      .at(-1)[1];
    await domReadyHandler();

    expect(allSpy).toHaveBeenCalledWith(undefined, undefined);
    expect(document.body.classList.remove).toHaveBeenCalledWith("loading");

    allSpy.mockRestore();
    globalThis.fetch = originalFetch;
    document.body = originalBody;
  });

  test("DOMContentLoaded handles unsuccessful API responses", async () => {
    const { gameInit } = await import("../shared/game/game-init.js");
    const allSpy = jest.spyOn(gameInit, "all").mockResolvedValue();
    const originalFetch = globalThis.fetch;
    const originalBody = document.body;
    document.body = { classList: { add: jest.fn(), remove: jest.fn() } };
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: "No cards" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: "No opponents" }),
      });

    const domReadyHandler = documentAddEventListenerSpy.mock.calls
      .filter(([eventName]) => eventName === "DOMContentLoaded")
      .at(-1)[1];
    await domReadyHandler();

    expect(allSpy).toHaveBeenCalledWith(undefined, undefined);

    allSpy.mockRestore();
    globalThis.fetch = originalFetch;
    document.body = originalBody;
  });
});
