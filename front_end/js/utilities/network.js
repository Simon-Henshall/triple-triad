/**
 * Fetch player cards from the PHP endpoint with timeout and error handling.
 *
 * @export
 * @async
 * @param {number} playerId
 * @param {{ timeout?: number; }} [param1={}]
 * @param {number} [param1.timeout=7000]
 * @returns {unknown}
 */
export async function fetchPlayerCards(playerId, { timeout = 7000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await fetch("front_end/api/get_player_cards.php", {
      method: "POST",
      credentials: "same-origin", // include cookies if needed
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId }),
      signal: controller.signal,
    });

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    // Expecting JSON from PHP: echo json_encode($response);
    const data = await result.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch opponents grouped by location.
 *
 * @export
 * @async
 * @param {{ timeout?: number; }} [param1={}]
 * @param {number} [param1.timeout=7000]
 * @returns {{ success: boolean, message: string, opponents: Array<{name: string, players: Array}> }}
 */
export async function fetchOpponents({ timeout = 7000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await fetch("front_end/api/get_opponents.php", {
      method: "GET",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    const data = await result.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch cards available to a specific opponent (based on their allowed levels).
 *
 * @export
 * @async
 * @param {number} playerId - The opponent's player ID
 * @param {{ timeout?: number; }} [param1={}]
 * @param {number} [param1.timeout=7000]
 * @returns {{ success: boolean, message: string, cards: Array }}
 */
export async function fetchOpponentCards(playerId, { timeout = 7000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await fetch("front_end/api/get_opponent_cards.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId }),
      signal: controller.signal,
    });

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    const data = await result.json();
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
