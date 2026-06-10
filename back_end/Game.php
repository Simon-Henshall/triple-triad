<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/Database.php';

try {
  $db = new Database();
  $stmt = $db->connect()->query("SELECT 1");
  $result = $stmt->fetch(PDO::FETCH_COLUMN);
  if ($result === 1) {
    echo "Database connection successful!";
  } else {
    echo "Database connection failed.";
  }
} catch (PDOException $e) {
  echo "An error occurred: " . $e->getMessage();
}
