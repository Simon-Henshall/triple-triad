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
    const result = await fetch("/back_end/includes/get_player_cards.php", {
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
