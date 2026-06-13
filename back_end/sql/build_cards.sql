-- ============================================================
-- Triple Triad – MySQL Card Schema & Seed Data
-- ============================================================
-- This script creates the `element`, `card`, `player`, and
-- `player_card` tables and inserts seed data.
-- ============================================================

-- Use the application database (adjust as needed)
-- USE triple_triad;

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
  PRIMARY KEY (`id`),
  KEY `idx_element_id` (`element_id`),
  CONSTRAINT `fk_card_element` FOREIGN KEY (`element_id`) REFERENCES `element` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Player table
--     Stores player profile information.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `player` (
  `id`   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64)  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Player-Card junction table (referenced in Card.php)
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

-- ============================================================
-- Seed data – elements
-- Element 0 = no element (used as default for cards without one)
-- ============================================================
INSERT INTO `element` (`id`, `name`, `image_path`) VALUES
(0, 'none',      ''),
(1, 'water',     '1.png'),
(2, 'lightning', '2.png'),
(3, 'fire',      '3.png'),
(4, 'ice',       '4.png'),
(5, 'earth',     '5.png'),
(6, 'poison',    '6.png'),
(7, 'holy',      '7.png'),
(8, 'wind',      '8.png');

-- ============================================================
-- Seed data – cards (110 cards from cards.js)
-- Image filenames match front_end/images/cards/<image>.png
-- MUST come before player_card to satisfy the FK constraint.
-- ============================================================
INSERT INTO `card` (`display_name`, `image`, `strength_up`, `strength_right`, `strength_down`, `strength_left`, `element_id`) VALUES
('Geezard',           'card0',   1, 4, 1, 5, 0),
('Funguar',           'card1',   5, 1, 1, 3, 0),
('Bite Bug',          'card2',   1, 3, 3, 5, 0),
('Red Bat',           'card3',   6, 1, 1, 2, 0),
('Blobra',            'card4',   2, 3, 1, 5, 0),
('Gayla',             'card5',   2, 1, 4, 4, 2),
('Gesper',            'card6',   1, 5, 4, 1, 0),
('Fastitocalon-F',    'card7',   3, 5, 2, 1, 5),
('Blood Soul',        'card8',   2, 1, 6, 1, 0),
('Caterchipillar',    'card9',   4, 2, 4, 3, 0),
('Cockatrice',        'card10',  2, 1, 2, 6, 2),
('Grat',              'card11',  7, 1, 3, 1, 0),
('Buel',              'card12',  6, 2, 2, 3, 0),
('Mesmerize',         'card13',  5, 3, 3, 4, 0),
('Glacial Eye',       'card14',  6, 1, 4, 3, 4),
('Belhelmel',         'card15',  3, 4, 5, 3, 0),
('Thrustaevis',       'card16',  5, 3, 2, 5, 8),
('Anacondaur',        'card17',  5, 1, 3, 5, 6),
('Creeps',            'card18',  5, 2, 5, 2, 2),
('Grendel',           'card19',  4, 4, 5, 2, 2),
('Jelleye',           'card20',  3, 2, 1, 7, 0),
('Grand Mantis',      'card21',  5, 2, 5, 3, 0),
('Forbidden',         'card22',  6, 6, 3, 2, 0),
('Armadodo',          'card23',  6, 3, 1, 6, 5),
('Tri-Face',          'card24',  3, 5, 5, 5, 6),
('Fastitocalon',      'card25',  7, 5, 1, 3, 5),
('Snow Lion',         'card26',  7, 1, 5, 3, 4),
('Ochu',              'card27',  5, 6, 3, 3, 0),
('SAM08G',            'card28',  5, 6, 2, 4, 3),
('Death Claw',        'card29',  4, 4, 7, 2, 3),
('Cactuar',           'card30',  6, 2, 6, 3, 0),
('Tonberry',          'card31',  3, 6, 4, 4, 0),
('Abyss Worm',        'card32',  7, 2, 3, 5, 5),
('Turtapod',          'card33',  2, 3, 6, 7, 0),
('Vysage',            'card34',  6, 5, 4, 5, 0),
('T-Rexaur',          'card35',  4, 6, 2, 7, 0),
('Bomb',              'card36',  2, 7, 6, 3, 3),
('Blitz',             'card37',  1, 6, 4, 7, 2),
('Wendigo',           'card38',  7, 3, 1, 6, 0),
('Torama',            'card39',  7, 4, 4, 4, 0),
('Imp',               'card40',  3, 7, 3, 6, 0),
('Blue Dragon',       'card41',  6, 2, 7, 3, 6),
('Adamantoise',       'card42',  4, 5, 5, 6, 5),
('Hexadragon',        'card43',  7, 5, 4, 3, 3),
('Iron Giant',        'card44',  6, 5, 6, 5, 0),
('Behemoth',          'card45',  3, 6, 5, 7, 0),
('Chimera',           'card46',  7, 6, 5, 3, 1),
('PuPu',              'card47',  3, 10, 2, 1, 0),
('Elastoid',          'card48',  6, 2, 6, 7, 0),
('GIM47N',            'card49',  5, 5, 7, 4, 0),
('Malboro',           'card50',  7, 7, 4, 2, 6),
('Ruby Dragon',       'card51',  7, 2, 7, 4, 3),
('Elnoyle',           'card52',  5, 3, 7, 6, 0),
('Tonberry King',     'card53',  4, 6, 7, 4, 0),
('Wedge, Biggs',      'card54',  6, 6, 2, 7, 0),
('Fujin Raijin',      'card55',  2, 8, 8, 4, 0),
('Elvoret',           'card56',  7, 8, 3, 4, 8),
('X-ATM092',          'card57',  4, 8, 7, 3, 0),
('Granaldo',          'card58',  7, 2, 8, 5, 0),
('Gerogero',          'card59',  1, 8, 8, 3, 6),
('Iguion',            'card60',  8, 2, 8, 2, 0),
('Abadon',            'card61',  6, 8, 4, 5, 0),
('Trauma',            'card62',  4, 8, 5, 6, 0),
('Oilboyle',          'card63',  1, 8, 4, 8, 0),
('Shumi',             'card64',  6, 5, 8, 4, 0),
('Krysta',            'card65',  7, 5, 8, 1, 0),
('Propagator',        'card66',  8, 4, 4, 8, 0),
('Jumbo Cactuar',     'card67',  8, 8, 4, 4, 0),
('Tri-Point',         'card68',  8, 5, 2, 8, 2),
('Gargantua',         'card69',  5, 6, 6, 8, 0),
('Mobile Type 8',     'card70',  8, 6, 7, 3, 0),
('Sphinxara',         'card71',  8, 3, 5, 8, 0),
('Tiamat',            'card72',  8, 8, 5, 4, 0),
('BGH251F2',          'card73',  5, 7, 8, 5, 0),
('Red Giant',         'card74',  6, 8, 4, 7, 0),
('Catoblepas',        'card75',  1, 8, 7, 7, 0),
('Ultima Weapon',     'card76',  7, 7, 2, 8, 0),
('Chubby Chocobo',    'card77',  4, 4, 8, 9, 0),
('Angelo',            'card78',  9, 6, 7, 3, 0),
('Gilgamesh',         'card79',  3, 7, 9, 6, 0),
('MiniMog',           'card80',  9, 3, 9, 2, 0),
('Chicobo',           'card81',  9, 4, 8, 4, 0),
('Quezacotl',         'card82',  2, 9, 9, 4, 2),
('Shiva',             'card83',  6, 7, 4, 9, 4),
('Ifrit',             'card84',  9, 6, 2, 8, 3),
('Siren',             'card85',  8, 9, 6, 2, 0),
('Sacred',            'card86',  5, 1, 9, 9, 5),
('Minotaur',          'card87',  9, 5, 2, 9, 5),
('Carbuncle',         'card88',  8, 4, 10, 4, 0),
('Diablos',           'card89',  5, 10, 8, 3, 0),
('Leviathan',         'card90',  7, 10, 1, 7, 1),
('Odin',              'card91',  8, 10, 3, 5, 0),
('Pandemona',         'card92',  10, 1, 7, 7, 8),
('Cerberus',          'card93',  7, 4, 6, 10, 0),
('Alexander',         'card94',  9, 10, 4, 2, 7),
('Phoenix',           'card95',  7, 2, 7, 10, 3),
('Bahamut',           'card96',  10, 8, 2, 6, 0),
('Doomtrain',         'card97',  3, 1, 10, 10, 6),
('Eden',              'card98',  4, 4, 9, 10, 0),
('Ward',              'card99',  10, 7, 2, 8, 0),
('Kiros',             'card100', 6, 7, 6, 10, 0),
('Laguna',            'card101', 5, 10, 3, 9, 0),
('Selphie',           'card102', 10, 8, 6, 4, 0),
('Quistis',           'card103', 9, 6, 10, 2, 0),
('Irvine',            'card104', 2, 6, 9, 10, 0),
('Zell',              'card105', 8, 5, 10, 6, 0),
('Rinoa',             'card106', 4, 10, 2, 10, 0),
('Edea',              'card107', 10, 10, 3, 3, 0),
('Seifer',            'card108', 6, 9, 10, 4, 0),
('Squall',            'card109', 10, 4, 6, 9, 0);

-- ============================================================
-- Seed data – players
-- ============================================================
INSERT INTO `player` (`id`, `name`) VALUES
(1, 'Player 1');

-- ============================================================
-- Seed data – player 1 card inventory
-- Sample card data for testing; adjust quantities as needed.
-- Must come after cards and players to satisfy FK constraints.
-- ============================================================
INSERT INTO `player_card` (`player_id`, `card_id`, `quantity`) VALUES
(1,   1, 6),
(1,   2, 4),
(1,   3, 8),
(1,   4, 2),
(1,   5, 4),
(1,   6, 4),
(1,   7, 7),
(1,   8, 4),
(1,   9, 4),
(1,  10, 7),
(1,  11, 2),
(1,  12, 4),
(1,  13, 9),
(1,  14, 8),
(1,  15, 1),
(1,  16, 3),
(1,  17, 7),
(1,  18, 7),
(1,  19, 9),
(1,  20, 4),
(1,  21, 6),
(1,  22, 6),
(1,  23, 1),
(1,  24, 7),
(1,  25, 2),
(1,  27, 6),
(1,  28, 1),
(1,  29, 5),
(1,  30, 5),
(1,  33, 1),
(1,  34, 5),
(1,  35, 8),
(1,  36, 8),
(1,  37, 4),
(1,  38, 3),
(1,  39, 7),
(1,  40, 4),
(1,  41, 1),
(1,  42, 4),
(1,  43, 2),
(1,  44, 9),
(1,  45, 3),
(1,  46, 7),
(1,  47, 7),
(1,  48, 2),
(1,  49, 9),
(1,  50, 9),
(1,  51, 4),
(1,  52, 5),
(1,  53, 2),
(1,  54, 1),
(1,  55, 2),
(1,  56, 9),
(1,  57, 3),
(1,  58, 6),
(1,  59, 1),
(1,  60, 7),
(1,  61, 5),
(1,  62, 8),
(1,  63, 2),
(1,  64, 5),
(1,  65, 5),
(1,  67, 7),
(1,  68, 2),
(1,  69, 4),
(1,  70, 1),
(1,  71, 5),
(1,  72, 6),
(1,  73, 9),
(1,  74, 1),
(1,  75, 8),
(1,  76, 5),
(1,  77, 8),
(1,  78, 1),
(1,  79, 1),
(1,  80, 7),
(1,  81, 6),
(1,  82, 1),
(1,  83, 6),
(1,  84, 9),
(1,  85, 6),
(1,  86, 8),
(1,  87, 1),
(1,  88, 6),
(1,  89, 4),
(1,  91, 3),
(1,  92, 6),
(1,  93, 9),
(1,  94, 8),
(1,  95, 6),
(1,  96, 7),
(1,  97, 8),
(1,  98, 9),
(1,  99, 7),
(1, 100, 8),
(1, 101, 9),
(1, 102, 8),
(1, 103, 7),
(1, 105, 2),
(1, 106, 8),
(1, 107, 2),
(1, 108, 4),
(1, 109, 7),
(1, 110, 5);