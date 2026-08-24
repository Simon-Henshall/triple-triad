/**
 * @module network
 * @description Unit tests for the {@link module:../utilities/network}
 * network utility module, covering {@link fetchPlayerCards} with mocked
 * global fetch.
 */

import {
  fetchOpponentCards,
  fetchOpponents,
  fetchPlayerCards,
} from "../utilities/network.js";

/**
 * Store the original fetch before tests and add a mock after each test
 * block to prevent state leakage between tests.
 */
/** @type {Function | undefined} */
let origFetch;

beforeEach(() => {
  origFetch = globalThis.fetch;
});

afterEach(() => {
  // Restore original fetch or clean up mock
  if (origFetch) {
    globalThis.fetch = origFetch;
  } else {
    delete globalThis.fetch;
  }
});

/**
 * Verifies that fetchPlayerCards sends the correct POST request and returns
 * the JSON-parsed response on success.
 */
test("fetchPlayerCards makes correct POST request and returns JSON", async () => {
  const mockResponse = { success: true, cards: [] };

  /** @type {Function | undefined} */
  let capturedUrl;
  /** @type {RequestInit | undefined} */
  let capturedOptions;

  /**
   * Mock fetch that captures the request URL and options for assertion.
   */
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;

    return {
      ok: true,
      /** Simulates JSON response parsing. */
      json: async () => mockResponse,
    };
  };

  const result = await fetchPlayerCards(42);

  expect(capturedUrl).toBe("back_end/api/get_player_cards.php");
  expect(capturedOptions.method).toBe("POST");
  expect(capturedOptions.headers["Content-Type"]).toBe("application/json");
  expect(capturedOptions.credentials).toBe("same-origin");

  // Verify the body contains the player_id
  const body = JSON.parse(capturedOptions.body);
  expect(body).toEqual({ player_id: 42 });

  expect(result).toEqual(mockResponse);
});

/**
 * Verifies that fetchPlayerCards throws when the server returns a non-OK
 * status code.
 */
test("fetchPlayerCards throws on non-ok response", async () => {
  /**
   * Mock fetch that returns a non-OK response to simulate a server error.
   */
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
  });

  await expect(fetchPlayerCards(1)).rejects.toThrow(
    "Request failed with status 500",
  );
});

/**
 * Verifies that fetchPlayerCards throws a timeout error when the request
 * is aborted via AbortController (simulating a timeout).
 */
test("fetchPlayerCards throws on abort (timeout)", async () => {
  /**
   * Mock fetch that simulates an abort signal to test timeout handling.
   */
  globalThis.fetch = async (_url, options) => {
    // Simulate the AbortController aborting
    const signal = options.signal;
    if (signal) {
      const event = new Event("abort");
      signal.onabort?.(event);
      signal.dispatchEvent?.(event);
    }

    // Simulate fetch throwing an AbortError
    const error = new Error("The operation was aborted");
    error.name = "AbortError";
    throw error;
  };

  await expect(fetchPlayerCards(1, { timeout: 50 })).rejects.toThrow(
    "Request timed out",
  );
});

/**
 * Verifies that fetchPlayerCards re-throws non-abort errors (e.g. network
 * failure).
 */
test("fetchPlayerCards re-throws non-abort errors", async () => {
  /**
   * Mock fetch that throws a generic network error.
   */
  globalThis.fetch = async () => {
    throw new Error("Network failure");
  };

  await expect(fetchPlayerCards(1)).rejects.toThrow("Network failure");
});

test("fetchOpponents makes a GET request and returns JSON", async () => {
  const responseData = { success: true, opponents: [] };
  let capturedUrl;
  let capturedOptions;

  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return { ok: true, json: async () => responseData };
  };

  await expect(fetchOpponents()).resolves.toEqual(responseData);
  expect(capturedUrl).toBe("back_end/api/get_opponents.php");
  expect(capturedOptions.method).toBe("GET");
  expect(capturedOptions.credentials).toBe("same-origin");
});

test("fetchOpponents handles HTTP and abort errors", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await expect(fetchOpponents()).rejects.toThrow(
    "Request failed with status 503",
  );

  globalThis.fetch = async () => {
    const error = new Error("aborted");
    error.name = "AbortError";
    throw error;
  };
  await expect(fetchOpponents()).rejects.toThrow("Request timed out");
});

test("fetchOpponentCards sends player and optional rare-card IDs", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ success: true, cards: [] }) };
  };

  await fetchOpponentCards(7);
  await fetchOpponentCards(8, { uniqueCardId: 109 });

  expect(JSON.parse(requests[0].options.body)).toEqual({ player_id: 7 });
  expect(JSON.parse(requests[1].options.body)).toEqual({
    player_id: 8,
    unique_card_id: 109,
  });
  expect(requests[0].url).toBe("back_end/api/get_opponent_cards.php");
  expect(requests[0].options.method).toBe("POST");
});

test("fetchOpponentCards handles HTTP, timeout, and network errors", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 400 });
  await expect(fetchOpponentCards(1)).rejects.toThrow(
    "Request failed with status 400",
  );

  globalThis.fetch = async () => {
    const error = new Error("aborted");
    error.name = "AbortError";
    throw error;
  };
  await expect(fetchOpponentCards(1)).rejects.toThrow("Request timed out");

  globalThis.fetch = async () => {
    throw new Error("connection refused");
  };
  await expect(fetchOpponentCards(1)).rejects.toThrow("connection refused");
});
