<?php

namespace TripleTriad;

use PDO;

class Card
{
  public function __construct(private int $id, private string $name) {}

  public function getId()
  {
    return $this->id;
  }

  public function getName()
  {
    return $this->name;
  }

  public static function getAll()
  {
    $db = new Database();
    $stmt = $db->connect()->prepare("SELECT id, name FROM card");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_CLASS, self::class);
  }

  public static function getById(int $id)
  {
    $db = new Database();
    $stmt = $db->connect()->prepare("SELECT id, name FROM card WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_CLASS, self::class);
  }

  public function addPlayer(int $playerId)
  {
    $db = new Database();
    $stmt = $db->connect()->prepare("INSERT INTO player_card (player_id, card_id) VALUES (?, ?)");
    $stmt->execute([$playerId, $this->id]);
  }

  public function removePlayer(int $playerId)
  {
    $db = new Database();
    $stmt = $db->connect()->prepare("DELETE FROM player_card WHERE player_id = ? AND card_id = ?");
    $stmt->execute([$playerId, $this->id]);
  }
}
