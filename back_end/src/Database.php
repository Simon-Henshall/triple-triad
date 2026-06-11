<?php

namespace TripleTriad;

class Database
{
  public function connect()
  {
    $config = require __DIR__ . '/../../config.php';
    $conn = new \PDO("mysql:host={$config['DB_HOST']};dbname={$config['DB_NAME']}", $config['DB_USER'], $config['DB_PASS']);
    $conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    return $conn;
  }
}
