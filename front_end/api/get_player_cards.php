<?php

ini_set('display_errors', 0);
error_reporting(E_ALL); // This keeps errors routing to system logs instead

// 1. Set required API headers
header("Content-Type: application/json; charset=UTF-8");

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
  $input = json_decode(file_get_contents("php://input"), true);

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

  // 1. Define where to save the private log file
  // Keeping it outside public folders or naming it .log prevents browser access
  $logFile = __DIR__ . '/../logs/db_errors.log';

  // 2. Format the message with a timestamp
  $timestamp = date('[Y-m-d H:i:s]');
  $logMessage = "{$timestamp} Database Error: " . $e->getMessage() . PHP_EOL;

  // 3. Append the error message to the log file securely
  // message_type 3 tells PHP to write directly to a specific file path
  error_log($logMessage, 3, $logFile);

  // 4. Give the frontend a generic message so the database information does not leak
  $response["message"] = "A database connection error occurred.";
}

// 8. Output the exact JSON response and terminate
echo json_encode($response);
exit();
