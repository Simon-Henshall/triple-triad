<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

// 1. Set required API headers
require_once __DIR__ . '/bootstrap.php';
sendApiHeaders();
requireApiMethod('POST');

// 2. Load database dependencies
require_once __DIR__ . '/../../back_end/src/Database.php';

use TripleTriad\Database;

// 3. Initialise the response structure
$response = [
  "success"   => false,
  "message"   => "",
  "cards"     => [],
  "rare_card" => null,
];

try {
  // 4. Read and parse the incoming JSON body
  $input = readJsonBody();

  if (!$input || !isset($input["player_id"])) {
    http_response_code(400);
    $response["message"] = "Missing required parameter: player_id.";
    echo json_encode($response);
    exit();
  }

  $playerId   = (int) $input["player_id"];
  $uniqueCardId = isset($input["unique_card_id"]) ? (int) $input["unique_card_id"] : null;

  // 5. Connect to the database
  $db   = new Database();
  $conn = $db->connect();

  // 6. Query cards that match the opponent's allowed levels
  $sql = "
    SELECT
      c.id,
      c.display_name,
      c.image,
      c.strength_up,
      c.strength_right,
      c.strength_down,
      c.strength_left,
      c.element_id,
      e.name               AS element_name,
      e.image_path         AS element_image
    FROM card c
    LEFT JOIN element e   ON e.id = c.element_id
    INNER JOIN player_level pl ON pl.level = c.level
    WHERE pl.player_id = :player_id
    ORDER BY c.level ASC, c.id ASC
  ";

  $stmt = $conn->prepare($sql);
  $stmt->execute([":player_id" => $playerId]);
  $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // 7. Cast numeric fields to proper types
  foreach ($cards as &$card) {
    $card["id"]            = (int) $card["id"];
    $card["strength_up"]   = (int) $card["strength_up"];
    $card["strength_right"] = (int) $card["strength_right"];
    $card["strength_down"] = (int) $card["strength_down"];
    $card["strength_left"] = (int) $card["strength_left"];
    $card["element_id"]    = (int) $card["element_id"];
  }
  unset($card);

  // 7b. Fetch the rare card data if unique_card_id is provided
  $rareCard = null;
  if ($uniqueCardId !== null) {
    $rareSql = "
      SELECT
        c.id,
        c.display_name,
        c.image,
        c.strength_up,
        c.strength_right,
        c.strength_down,
        c.strength_left,
        c.element_id,
        e.name       AS element_name,
        e.image_path AS element_image
      FROM card c
      LEFT JOIN element e ON e.id = c.element_id
      WHERE c.id = :unique_card_id
      LIMIT 1
    ";
    $rareStmt = $conn->prepare($rareSql);
    $rareStmt->execute([":unique_card_id" => $uniqueCardId]);
    $rareCard = $rareStmt->fetch(PDO::FETCH_ASSOC);

    if ($rareCard) {
      $rareCard["id"]            = (int) $rareCard["id"];
      $rareCard["strength_up"]   = (int) $rareCard["strength_up"];
      $rareCard["strength_right"] = (int) $rareCard["strength_right"];
      $rareCard["strength_down"] = (int) $rareCard["strength_down"];
      $rareCard["strength_left"] = (int) $rareCard["strength_left"];
      $rareCard["element_id"]    = (int) $rareCard["element_id"];
    }
  }

  http_response_code(200);
  $response["success"]   = true;
  $response["message"]   = "Cards retrieved successfully.";
  $response["cards"]     = $cards;
  $response["rare_card"] = $rareCard;
} catch (PDOException $e) {
  http_response_code(500);

  logApiDatabaseError($e);

  $response["message"] = "A database connection error occurred.";
}

// 8. Output the JSON response
echo json_encode($response);
exit();
