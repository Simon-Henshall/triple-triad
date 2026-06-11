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
  "message" => ""
];

try {
  $db = new Database();
  $stmt = $db->connect()->query("SELECT 1");
  $result = $stmt->fetch(PDO::FETCH_COLUMN);

  if ($result == 1) {
    http_response_code(200); // OK
    $response["success"] = true;
    $response["message"] = "Database connection successful!";
  } else {
    http_response_code(500); // Server Error
    $response["message"] = "Database validation failed.";
  }
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

// 4. Output the exact JSON response and terminate
echo json_encode($response);
exit();
