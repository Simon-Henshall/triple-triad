-- ============================================================
-- Triple Triad – Database Schema
-- ============================================================
-- Creates all tables required by the game.
-- Run this before any seed files.
-- ============================================================

USE triple_triad;

-- ------------------------------------------------------------
-- 0. Element reference table
--     Maps element IDs used in the card data to human-readable
--     names and icon filenames.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `element` (
  `id`   TINYINT UNSIGNED NOT NULL,
  `name` VARCHAR(16)      NOT NULL,
  `image_path` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 1. Card table
--     Stores every Triple Triad card with its stats and
--     association to an element and image.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `card` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `display_name`  VARCHAR(64)        NOT NULL,
  `image`         VARCHAR(32)        NOT NULL COMMENT 'Filename without extension, e.g. card0',
  `strength_up`   TINYINT UNSIGNED   NOT NULL,
  `strength_right` TINYINT UNSIGNED  NOT NULL,
  `strength_down` TINYINT UNSIGNED   NOT NULL,
  `strength_left` TINYINT UNSIGNED   NOT NULL,
  `element_id`    TINYINT UNSIGNED   DEFAULT 0,
  `level`         TINYINT UNSIGNED   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_element_id` (`element_id`),
  CONSTRAINT `fk_card_element` FOREIGN KEY (`element_id`) REFERENCES `element` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Level value reference table
--     Holds the valid card levels (1-10). Used as a lookup
--     target so the player_level bridge table can enforce
--     referential integrity.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `level_value` (
  `value` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Player table
--     Stores player profile information.
--     unique_card_id is a FK to a specific rare card that only
--     this player possesses.  Location describes where in the
--     world the player is found.
--     Allowed card levels are stored in the player_level bridge table.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `player` (
  `id`              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(64)    NOT NULL,
  `location`        VARCHAR(128)   DEFAULT NULL,
  `unique_card_id`  INT UNSIGNED   DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_unique_card` (`unique_card_id`),
  CONSTRAINT `fk_player_unique_card` FOREIGN KEY (`unique_card_id`) REFERENCES `card` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Player-Level bridge table
--     Allows each player to own any combination of card levels
--     (1-10). A player with entries for 1, 2, 4 and 5 would NOT
--     have access to levels 3, 6-10.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `player_level` (
  `player_id` INT UNSIGNED NOT NULL,
  `level`     TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`player_id`, `level`),
  CONSTRAINT `fk_pl_player` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_pl_level` FOREIGN KEY (`level`) REFERENCES `level_value` (`value`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Player-Card junction table (referenced in Card.php)
--     Tracks which players own which cards and how many.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `player_card` (
  `player_id` INT UNSIGNED NOT NULL,
  `card_id`   INT UNSIGNED NOT NULL,
  `quantity`  INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`player_id`, `card_id`),
  KEY `idx_card_id` (`card_id`),
  CONSTRAINT `fk_pc_player` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_pc_card` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;