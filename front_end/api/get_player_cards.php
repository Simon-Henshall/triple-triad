<?php

ini_set('display_errors', 0);
error_reporting(E_ALL); // This keeps errors routing to system logs instead

// 1. Set required API headers
require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('POST');

// 2. Load database dependencies
require_once __DIR__ . '/../../back_end/src/Database.php';

use TripleTriad\Database;

// 3. Initialise the response structure
$response = [
  "success" => false,
  "message" => "",
  "cards"   => []
];

try {
  // 4. Read and parse the incoming JSON body
  $input = readJsonBody();

  if (!$input || !isset($input["player_id"])) {
    http_response_code(400); // Bad Request
    $response["message"] = "Missing required parameter: player_id.";
    echo json_encode($response);
    exit();
  }

  $playerId = (int) $input["player_id"];

  // 5. Connect to the database
  $db   = new Database();
  $conn = $db->connect();

  // 6. Query the player's cards with full card details and stock
  $sql = "
    SELECT
      pc.card_id           AS id,
      c.display_name,
      c.image,
      c.strength_up,
      c.strength_right,
      c.strength_down,
      c.strength_left,
      c.element_id,
      e.name               AS element_name,
      e.image_path         AS element_image,
      pc.quantity
    FROM player_card pc
    JOIN card c           ON c.id = pc.card_id
    LEFT JOIN element e   ON e.id = c.element_id
    WHERE pc.player_id = :player_id
    ORDER BY pc.card_id ASC
  ";

  $stmt = $conn->prepare($sql);
  $stmt->execute([":player_id" => $playerId]);
  $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 7. Cast numeric fields to proper types so JSON output is numeric
  foreach ($cards as &$card) {
    $card["id"]            = (int) $card["id"];
    $card["strength_up"]   = (int) $card["strength_up"];
    $card["strength_right"] = (int) $card["strength_right"];
    $card["strength_down"] = (int) $card["strength_down"];
    $card["strength_left"] = (int) $card["strength_left"];
    $card["element_id"]    = (int) $card["element_id"];
    $card["quantity"]      = (int) $card["quantity"];
  }
  unset($card);

  http_response_code(200); // OK
  $response["success"] = true;
  $response["message"] = "Cards retrieved successfully.";
  $response["cards"]   = $cards;
} catch (PDOException $e) {
  http_response_code(500); // Server Error

  logApiDatabaseError($e);

  $response["message"] = "A database connection error occurred.";
}

// 8. Output the exact JSON response and terminate
echo json_encode($response);
exit();
