/**
 * @module cards-data
 * @description Integration tests for card data fetched from the database
 * via the get_cards.php API endpoint using HTTP fetch.
 */

/**
 * Base URL for the API endpoints – configurable via environment variable,
 * defaults to the local WAMP server path.
 * @type {string}
 */
const API_BASE = process.env.API_BASE_URL || "http://localhost/triple-triad";

/**
 * Fetches all card data from the API.
 * @returns {Promise<Array>} Array of card objects from the database
 */
async function fetchCards() {
  const url = `${API_BASE}/back_end/api/get_cards.php`;

  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`API returned success=false: ${data.message}`);
  }

  return data.cards;
}

/**
 * Verifies that the cards array is not empty and each entry has the expected
 * shape: display_name (non-empty string), image (non-empty string),
 * four direction strengths (1-10 integers), element (integer >= 0).
 */
test("all cards have valid structure and value ranges", async () => {
  const cards = await fetchCards();

  expect(Array.isArray(cards)).toBe(true);
  expect(cards.length).toBeGreaterThan(0);

  for (const card of cards) {
    expect(typeof card.display_name).toBe("string");
    expect(card.display_name.length).toBeGreaterThan(0);

    expect(typeof card.image).toBe("string");
    expect(card.image.length).toBeGreaterThan(0);

    // Strength values should be integers between 1 and 10
    expect(Number.isInteger(card.strength_up)).toBe(true);
    expect(card.strength_up).toBeGreaterThanOrEqual(1);
    expect(card.strength_up).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strength_right)).toBe(true);
    expect(card.strength_right).toBeGreaterThanOrEqual(1);
    expect(card.strength_right).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strength_down)).toBe(true);
    expect(card.strength_down).toBeGreaterThanOrEqual(1);
    expect(card.strength_down).toBeLessThanOrEqual(10);

    expect(Number.isInteger(card.strength_left)).toBe(true);
    expect(card.strength_left).toBeGreaterThanOrEqual(1);
    expect(card.strength_left).toBeLessThanOrEqual(10);

    // Element should be a non-negative integer
    expect(Number.isInteger(card.element_id)).toBe(true);
    expect(card.element_id).toBeGreaterThanOrEqual(0);
    expect(card.element_id).toBeLessThanOrEqual(8);
  }
});

/**
 * Verifies that all card image identifiers are unique.
 */
test("all card images are unique", async () => {
  const cards = await fetchCards();
  const images = cards.map((card) => card.image);
  expect(new Set(images).size).toBe(images.length);
});

/**
 * Verifies that all card display names are unique.
 */
test("all card display names are unique", async () => {
  const cards = await fetchCards();
  const names = cards.map((card) => card.display_name);
  expect(new Set(names).size).toBe(names.length);
});

/**
 * Verifies the count of total cards.
 */
test("cards count matches expected total (110)", async () => {
  const cards = await fetchCards();
  expect(cards).toHaveLength(110);
});

/**
 * Verifies known card entries: first, last, and a few middle cards.
 */
test("known card entries have expected values", async () => {
  const cards = await fetchCards();

  // First card
  expect(cards[0].display_name).toBe("Geezard");
  expect(cards[0].strength_up).toBe(1);
  expect(cards[0].element_id).toBe(0);

  // Last card
  const last = cards.at(-1);
  expect(last.display_name).toBe("Squall");
  expect(last.image).toBe("card109");

  // PuPu – has a strength value of 10
  const pupu = cards.find((c) => c.display_name === "PuPu");
  expect(pupu).toBeDefined();
  expect(pupu.strength_right).toBe(10);

  // Chubby Chocobo has strength_left = 9
  const chocobo = cards.find((c) => c.display_name === "Chubby Chocobo");
  expect(chocobo).toBeDefined();
  expect(chocobo.strength_left).toBe(9);
});

/**
 * Verifies element field is one of the known element IDs (0-8).
 */
test("every card element is in valid range [0, 8]", async () => {
  const cards = await fetchCards();
  for (const card of cards) {
    expect(card.element_id).toBeGreaterThanOrEqual(0);
    expect(card.element_id).toBeLessThanOrEqual(8);
  }
});

/**
 * Verifies that image paths follow the "cardN" pattern sequentially from
 * card0 to card109.
 */
test("image identifiers follow sequential cardN pattern", async () => {
  const cards = await fetchCards();
  for (const [index, card] of cards.entries()) {
    expect(card.image).toBe(`card${index}`);
  }
});
