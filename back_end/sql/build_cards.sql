-- ============================================================
-- Triple Triad – MySQL Card Schema & Seed Data
-- ============================================================
-- This script creates the `element`, `card`, `player`,
-- `player_level`, and `player_card` tables and inserts seed
-- data.
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
-- Seed data – level values (1 through 10)
-- ============================================================
INSERT INTO `level_value` (`value`) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

-- ============================================================
-- Seed data – cards (110 cards from cards.js)
-- Image filenames match front_end/images/cards/<image>.png
-- Level is derived from the image number: (image_number DIV 11) + 1
-- MUST come before player_card to satisfy the FK constraint.
-- ============================================================
INSERT INTO `card` (`display_name`, `image`, `strength_up`, `strength_right`, `strength_down`, `strength_left`, `element_id`, `level`) VALUES
('Geezard',           'card0',   1, 4, 1, 5, 0, 1),
('Funguar',           'card1',   5, 1, 1, 3, 0, 1),
('Bite Bug',          'card2',   1, 3, 3, 5, 0, 1),
('Red Bat',           'card3',   6, 1, 1, 2, 0, 1),
('Blobra',            'card4',   2, 3, 1, 5, 0, 1),
('Gayla',             'card5',   2, 1, 4, 4, 2, 1),
('Gesper',            'card6',   1, 5, 4, 1, 0, 1),
('Fastitocalon-F',    'card7',   3, 5, 2, 1, 5, 1),
('Blood Soul',        'card8',   2, 1, 6, 1, 0, 1),
('Caterchipillar',    'card9',   4, 2, 4, 3, 0, 1),
('Cockatrice',        'card10',  2, 1, 2, 6, 2, 1),
('Grat',              'card11',  7, 1, 3, 1, 0, 2),
('Buel',              'card12',  6, 2, 2, 3, 0, 2),
('Mesmerize',         'card13',  5, 3, 3, 4, 0, 2),
('Glacial Eye',       'card14',  6, 1, 4, 3, 4, 2),
('Belhelmel',         'card15',  3, 4, 5, 3, 0, 2),
('Thrustaevis',       'card16',  5, 3, 2, 5, 8, 2),
('Anacondaur',        'card17',  5, 1, 3, 5, 6, 2),
('Creeps',            'card18',  5, 2, 5, 2, 2, 2),
('Grendel',           'card19',  4, 4, 5, 2, 2, 2),
('Jelleye',           'card20',  3, 2, 1, 7, 0, 2),
('Grand Mantis',      'card21',  5, 2, 5, 3, 0, 2),
('Forbidden',         'card22',  6, 6, 3, 2, 0, 3),
('Armadodo',          'card23',  6, 3, 1, 6, 5, 3),
('Tri-Face',          'card24',  3, 5, 5, 5, 6, 3),
('Fastitocalon',      'card25',  7, 5, 1, 3, 5, 3),
('Snow Lion',         'card26',  7, 1, 5, 3, 4, 3),
('Ochu',              'card27',  5, 6, 3, 3, 0, 3),
('SAM08G',            'card28',  5, 6, 2, 4, 3, 3),
('Death Claw',        'card29',  4, 4, 7, 2, 3, 3),
('Cactuar',           'card30',  6, 2, 6, 3, 0, 3),
('Tonberry',          'card31',  3, 6, 4, 4, 0, 3),
('Abyss Worm',        'card32',  7, 2, 3, 5, 5, 3),
('Turtapod',          'card33',  2, 3, 6, 7, 0, 4),
('Vysage',            'card34',  6, 5, 4, 5, 0, 4),
('T-Rexaur',          'card35',  4, 6, 2, 7, 0, 4),
('Bomb',              'card36',  2, 7, 6, 3, 3, 4),
('Blitz',             'card37',  1, 6, 4, 7, 2, 4),
('Wendigo',           'card38',  7, 3, 1, 6, 0, 4),
('Torama',            'card39',  7, 4, 4, 4, 0, 4),
('Imp',               'card40',  3, 7, 3, 6, 0, 4),
('Blue Dragon',       'card41',  6, 2, 7, 3, 6, 4),
('Adamantoise',       'card42',  4, 5, 5, 6, 5, 4),
('Hexadragon',        'card43',  7, 5, 4, 3, 3, 4),
('Iron Giant',        'card44',  6, 5, 6, 5, 0, 5),
('Behemoth',          'card45',  3, 6, 5, 7, 0, 5),
('Chimera',           'card46',  7, 6, 5, 3, 1, 5),
('PuPu',              'card47',  3, 10, 2, 1, 0, 5),
('Elastoid',          'card48',  6, 2, 6, 7, 0, 5),
('GIM47N',            'card49',  5, 5, 7, 4, 0, 5),
('Malboro',           'card50',  7, 7, 4, 2, 6, 5),
('Ruby Dragon',       'card51',  7, 2, 7, 4, 3, 5),
('Elnoyle',           'card52',  5, 3, 7, 6, 0, 5),
('Tonberry King',     'card53',  4, 6, 7, 4, 0, 5),
('Wedge, Biggs',      'card54',  6, 6, 2, 7, 0, 5),
('Fujin Raijin',      'card55',  2, 8, 8, 4, 0, 6),
('Elvoret',           'card56',  7, 8, 3, 4, 8, 6),
('X-ATM092',          'card57',  4, 8, 7, 3, 0, 6),
('Granaldo',          'card58',  7, 2, 8, 5, 0, 6),
('Gerogero',          'card59',  1, 8, 8, 3, 6, 6),
('Iguion',            'card60',  8, 2, 8, 2, 0, 6),
('Abadon',            'card61',  6, 8, 4, 5, 0, 6),
('Trauma',            'card62',  4, 8, 5, 6, 0, 6),
('Oilboyle',          'card63',  1, 8, 4, 8, 0, 6),
('Shumi',             'card64',  6, 5, 8, 4, 0, 6),
('Krysta',            'card65',  7, 5, 8, 1, 0, 6),
('Propagator',        'card66',  8, 4, 4, 8, 0, 7),
('Jumbo Cactuar',     'card67',  8, 8, 4, 4, 0, 7),
('Tri-Point',         'card68',  8, 5, 2, 8, 2, 7),
('Gargantua',         'card69',  5, 6, 6, 8, 0, 7),
('Mobile Type 8',     'card70',  8, 6, 7, 3, 0, 7),
('Sphinxara',         'card71',  8, 3, 5, 8, 0, 7),
('Tiamat',            'card72',  8, 8, 5, 4, 0, 7),
('BGH251F2',          'card73',  5, 7, 8, 5, 0, 7),
('Red Giant',         'card74',  6, 8, 4, 7, 0, 7),
('Catoblepas',        'card75',  1, 8, 7, 7, 0, 7),
('Ultima Weapon',     'card76',  7, 7, 2, 8, 0, 7),
('Chubby Chocobo',    'card77',  4, 4, 8, 9, 0, 8),
('Angelo',            'card78',  9, 6, 7, 3, 0, 8),
('Gilgamesh',         'card79',  3, 7, 9, 6, 0, 8),
('MiniMog',           'card80',  9, 3, 9, 2, 0, 8),
('Chicobo',           'card81',  9, 4, 8, 4, 0, 8),
('Quezacotl',         'card82',  2, 9, 9, 4, 2, 8),
('Shiva',             'card83',  6, 7, 4, 9, 4, 8),
('Ifrit',             'card84',  9, 6, 2, 8, 3, 8),
('Siren',             'card85',  8, 9, 6, 2, 0, 8),
('Sacred',            'card86',  5, 1, 9, 9, 5, 8),
('Minotaur',          'card87',  9, 5, 2, 9, 5, 8),
('Carbuncle',         'card88',  8, 4, 10, 4, 0, 9),
('Diablos',           'card89',  5, 10, 8, 3, 0, 9),
('Leviathan',         'card90',  7, 10, 1, 7, 1, 9),
('Odin',              'card91',  8, 10, 3, 5, 0, 9),
('Pandemona',         'card92',  10, 1, 7, 7, 8, 9),
('Cerberus',          'card93',  7, 4, 6, 10, 0, 9),
('Alexander',         'card94',  9, 10, 4, 2, 7, 9),
('Phoenix',           'card95',  7, 2, 7, 10, 3, 9),
('Bahamut',           'card96',  10, 8, 2, 6, 0, 9),
('Doomtrain',         'card97',  3, 1, 10, 10, 6, 9),
('Eden',              'card98',  4, 4, 9, 10, 0, 9),
('Ward',              'card99',  10, 7, 2, 8, 0, 10),
('Kiros',             'card100', 6, 7, 6, 10, 0, 10),
('Laguna',            'card101', 5, 10, 3, 9, 0, 10),
('Selphie',           'card102', 10, 8, 6, 4, 0, 10),
('Quistis',           'card103', 9, 6, 10, 2, 0, 10),
('Irvine',            'card104', 2, 6, 9, 10, 0, 10),
('Zell',              'card105', 8, 5, 10, 6, 0, 10),
('Rinoa',             'card106', 4, 10, 2, 10, 0, 10),
('Edea',              'card107', 10, 10, 3, 3, 0, 10),
('Seifer',            'card108', 6, 9, 10, 4, 0, 10),
('Squall',            'card109', 10, 4, 6, 9, 0, 10);

-- ============================================================
-- Seed data – players
-- unique_card_id values reference rare cards held by the player.
--   Quistis=103, MiniMog=80, Zell=105, Pandemona=92,
--   Doomtrain=97, Siren=85, Kiros=100, Rinoa=106,
--   Ifrit=84, Irvine=104, Quezacotl=82, Selphie=102
-- ============================================================
INSERT INTO `player` (`id`, `name`, `location`, `unique_card_id`) VALUES
-- Player 1 (human player)
(  1, 'Player 1',                  NULL,                                                    NULL),

-- ============================================================
-- Balamb Garden
-- ============================================================
(  2, 'Trepe Groupie #1',          'Balamb Garden - Cafetaria, guy in the back',             103),
(  3, 'Friend Trepe Groupie #1',   'Balamb Garden - Cafetaria, guy in the front',            NULL),
(  4, 'Gatekeeper',                'Balamb Garden - Gate Reception',                        NULL),
(  5, 'Running Boy',               'Balamb Garden - Main Halls',                             80),
(  6, 'Trepe Groupie #2',          'Balamb Garden - 2nd Floor Classroom',                   103),
(  7, 'Trepe Groupie #3',          'Balamb Garden - 2nd Floor Classroom',                   103),
(  8, 'Cafetaria Lady',            'Balamb Garden - Cafetaria behind counter',              NULL),
(  9, 'Guy on bench',              'Balamb Garden - (Random) Right Main Hall',              NULL),
( 10, 'Walking Student Girl',      'Balamb Garden - (Random) Hall to Library',              NULL),
( 11, 'Dark Skinned Student',      'Balamb Garden - (Random) Hall to Library',              NULL),
( 12, 'Library Girl w/Pigtail',    'Balamb Garden - Library, behind counter',               NULL),
( 13, 'Male Student in blue',      'Balamb Garden - Library, middle of room',               NULL),
( 14, 'Sitting Student',           'Balamb Garden - Library, Esuna Draw Screen',            NULL),
( 15, 'Talking Student Girl',      'Balamb Garden - Library Reading Room',                  NULL),
( 16, 'Boy in Infirmary Hall',     'Balamb Garden - (Random) Hallway to Infirmary',        NULL),
( 17, 'Blonde Girl in Main Hall',  'Balamb Garden - (Random) Main Hall',                   NULL),
( 18, 'Girl with short pants',     'Balamb Garden - (Random) Main Hall',                   NULL),
( 19, '3 Girls Group',             'Balamb Garden - Hallway to Dormitory',                  NULL),
( 20, 'White Male Student',        'Balamb Garden - 2nd Floor Hallway to Class',            NULL),
( 21, 'Right Girl Talking',        'Balamb Garden - 2nd Floor Hallway to Class',            NULL),
( 22, 'Left Girl Talking',         'Balamb Garden - (Random) 2nd Floor Hallway to Class',  NULL),
( 23, 'Left Guy Talking',          'Balamb Garden - (Random) 2nd Floor Hallway to Class',  NULL),

-- ============================================================
-- Balamb Town
-- ============================================================
( 24, 'Ma Dincht',                 'Balamb Town - Zell''s House',                           105),
( 25, 'Girl in a band',            'Balamb Town - Entrance Screen (Disc 1)',                NULL),
( 26, 'Station Conductor',         'Balamb Town - Entrance of the Station',                 NULL),
( 27, 'Galbadian Soldier',        'Balamb Town - Docks (Balamb Lockdown ONLY)',            NULL),
( 28, 'Hotel Owner',               'Balamb Town - In front of the Hotel',                   92),
( 29, 'Hotel Owner''s Daughter',   'Balamb Town - Old Man House / In front of the Hotel',  92),
( 30, 'Girl with dog',             'Balamb Town - (Random) Docks',                          NULL),
( 31, 'Student skipping class',    'Balamb Town - (Random) Docks',                          NULL),
( 32, 'Chef with red shirt',       'Balamb Town - Docks (After Lockdown)',                  NULL),
( 33, 'Big Bad Rascal',            'Balamb Town - (Events) Dincht Living Room',             NULL),
( 34, 'Girl sitting',              'Balamb Town - Entrance Station',                        NULL),

-- ============================================================
-- Timber
-- ============================================================
( 35, 'Left Guard',                'Timber - Entrance/Exit to Worldmap',                    NULL),
( 36, 'Cat Loving Girl',           'Timber - In the street near the Hotel',                 NULL),
( 37, 'Girl looking at Models',    'Timber - In the Hotel',                                 NULL),
( 38, 'Guy who likes Girls',       'Timber - (Random) Overpass',                            NULL),
( 39, 'Guy in White',              'Timber - (Random) Galbadia Station',                    NULL),
( 40, 'Old Lady',                  'Timber - Pet Shop Screen',                              NULL),
( 41, 'Dark Woman/White Bikini',   'Timber - City Square Timber Maniacs',                   NULL),
( 42, 'Old Lady (2)',              'Timber - Pet Shop Screen',                              NULL),
( 43, 'Couple on Bench',           'Timber - Intersection to Pub+Station',                  NULL),
( 44, 'Boy on Station Bridge',     'Timber - Eastern Station Bridge',                       NULL),
( 45, 'Woman (Train Expert)',      'Timber - Eastern Station',                              NULL),
( 46, 'Depressed Woman at Home',   'Timber - Old Man''s (Owl Tears) House',                 NULL),
( 47, 'Pub Owner',                 'Timber - Timber Pub, upper right',                      97),
( 48, 'Drunkard',                  'Timber - Back Alley',                                   NULL),
( 49, 'Guard at TV Station path',  'Timber - After TV Station Events',                      NULL),

-- ============================================================
-- Dollet
-- ============================================================
( 50, 'Car Rental Woman',          'Dollet - Entrance Screen',                              NULL),
( 51, 'Girl near Wheelchair Man',  'Dollet - Harbor (come from above)',                     NULL),
( 52, 'Emo Kid in Green Jacket',   'Dollet - Harbor (come from below)',                     NULL),
( 53, 'Man with Blue Sleeves',     'Dollet - Screen with stairs to beach',                  NULL),
( 54, 'Girl at the beach',         'Dollet - Lapin Beach',                                  NULL),
( 55, 'Son of Queen of Cards',     'Dollet - CQ''s Father Artist''s House',                 NULL),
( 56, 'Woman near Pub',            'Dollet - Near the Shining Bomber Pub',                  NULL),
( 57, 'Pub''s Waiter',             'Dollet - Behind counter',                               NULL),
( 58, 'Old Man in Pub',            'Dollet - 2nd Floor Pub',                                NULL),
( 59, 'Pub''s Owner',              'Dollet - Beat him -> Private Room',                     85),
( 60, 'Shopping Lady in Yellow',   'Dollet - Walking in Nautilus Street',                   NULL),
( 61, 'Old Man at Townsquare',     'Dollet - Townsquare',                                   NULL),
( 62, 'Hotel Girl',                'Dollet - Dollet Hotel Main Hall',                       NULL),

-- ============================================================
-- Deling City
-- ============================================================
( 63, 'Travelling Lady from FH',   'Deling City - Across the street of Hotel',              NULL),
( 64, 'Hotel Waitress',            'Deling City - Hotel Restaurant',                        NULL),
( 65, 'Person near General Shop',  'Deling City - In the street with Shops',                NULL),
( 66, 'Man in Black',              'Deling City - Across the Junk Shop',                    100),
( 67, 'Old Woman',                 'Deling City - Street near Main Gate',                   NULL),
( 68, 'Old Man',                   'Deling City - On Bench, Street near Main Gate',         NULL),
( 69, 'General Caraway',           'Deling City - Caraway''s Mansion',                      106),
( 70, 'Train Conductor',           'Deling City - City Train Station',                      NULL),
( 71, 'Walking Woman',             'Deling City - Other street near Main Gate',             NULL),

-- ============================================================
-- Fisherman's Horizon
-- ============================================================
( 72, 'Familiar Face #3',          'FH - Nearby elevator going up',                         NULL),
( 73, 'Martine',                   'FH - Right from Mayor''s House',                        84),
( 74, 'Flo (Mayor''s Wife)',       'FH - Mayor''s House, Upstairs',                         104),
( 75, 'Mayor Dobe',                'FH - Mayor''s House, Upstairs',                         82),
( 76, 'Kid at Town Square',        'FH - Town Square near Station',                         NULL),
( 77, 'Grease Monkey',             'FH - Grease Monkey''s House',                           NULL),
( 78, 'Master Fisherman',          'FH - Crane (1st Visit ONLY)',                           NULL),

-- ============================================================
-- Winhill
-- ============================================================
( 79, 'Student Mercenary',         'Winhill - Nearby southern exit',                        NULL),
( 80, 'Shop Owner',                'Winhill - Shop at southern exit',                       NULL),
( 81, 'Hotel Owner',               'Winhill - In the Hotel',                                NULL),
( 82, 'Old Man in Residence',      'Winhill - Residence in southern part',                  NULL),
( 83, 'Man on bench',              'Winhill - Bench on North Town Square',                  NULL),
( 84, 'Playing Girl',              'Winhill - North Town Square',                           NULL),
( 85, 'Mansion Owner',             'Winhill - Man on the stairs in Mansion',                NULL),
( 86, 'Blonde Woman',              'Winhill - At former Raine''s House',                    NULL),

-- ============================================================
-- Trabia Garden
-- ============================================================
( 87, 'Student in green',          'Trabia Garden - Path near entrance',                    NULL),
( 88, 'Selphie''s Friend',         'Trabia Garden - Fountain Screen',                       102),
( 89, 'Trabian Faculty',           'Trabia Garden - Fountain Screen (upper right)',         NULL),
( 90, 'Girl Student',              'Trabia Garden - Garage Screen',                         NULL),
( 91, 'Sitting Guy',               'Trabia Garden - Garage Screen',                         NULL),
( 92, 'Girl with book',            'Trabia Garden - Classroom/Monitor Screen',              NULL),
( 93, 'Mechanic',                  'Trabia Garden - Monitor Screen',                        NULL),
( 94, 'Basketball Freak',          'Trabia Garden - Stage/Rocket Screen',                   NULL),
( 95, 'Student near rocket',       'Trabia Garden - Stage/Rocket Screen',                   NULL),
( 96, 'Boy at Basketball Court',   'Trabia Garden - Basketball Court',                      NULL),
( 97, 'Girl in Bikini',            'Trabia Garden - Basketball Court',                      NULL),

-- ============================================================
-- Shumi Village
-- ============================================================
( 98, 'Left Shumi',                'Shumi Village - Entrance Guarding Draw Point',          NULL),
( 99, 'Middle Shumi',              'Shumi Village - Entrance Guarding Draw Point',          NULL),
(100, 'Right Shumi',               'Shumi Village - Entrance Guarding Draw Point',          NULL),
(101, 'Shumi at a table',          'Shumi Village - First Underground Screen',              NULL),
(102, 'Elder',                     'Shumi Village - Elder''s House',                        NULL),
(103, 'Elder''s Assistant',        'Shumi Village - Elder''s House',                        NULL),
(104, 'Artisan',                   'Shumi Village - Artisan''s House',                      NULL),
(105, 'Busy Working Shumi',        'Shumi Village - Sculptor''s Workplace',                 NULL),
(106, 'Sculptor',                  'Shumi Village - Sculptor''s Workplace',                 NULL),
(107, 'Master Fisherman',          'Shumi Village - Pond (Only during the quest)',          NULL),

-- ============================================================
-- CC-Group (Disc 4)
-- ============================================================
(108, 'Joker',                     'Ragnarok - Elevator Room',                              NULL),
(109, 'Jack',                      'Ragnarok - North from hangar',                          NULL),
(110, 'Club',                      'Ragnarok - Aisle upstairs',                             NULL),
(111, 'Right Diamond',             'Ragnarok - Hangar',                                     NULL),
(112, 'Left Diamond',              'Ragnarok - Hangar',                                     NULL),
(113, 'Spade',                     'Ragnarok - Aisle near hangar',                          NULL),
(114, 'Heart',                     'Ragnarok - Entrance',                                   NULL),
(115, 'King',                      'Ragnarok - Air Room',                                   NULL);

-- ============================================================
-- Seed data – player levels
-- ============================================================
INSERT INTO `player_level` (`player_id`, `level`) VALUES
-- Player 1 (human player – all levels)
(  1, 1), (  1, 2), (  1, 3), (  1, 4), (  1, 5),
(  1, 6), (  1, 7), (  1, 8), (  1, 9), (  1, 10),

-- ============================================================
-- Balamb Garden
-- ============================================================
-- #2  Trepe Groupie #1: 2,5
(  2, 2), (  2, 5),
-- #3  Friend Trepe Groupie #1: 1-3
(  3, 1), (  3, 2), (  3, 3),
-- #4  Gatekeeper: 1-3,5
(  4, 1), (  4, 2), (  4, 3), (  4, 5),
-- #5  Running Boy: 1-3
(  5, 1), (  5, 2), (  5, 3),
-- #6  Trepe Groupie #2: 1,3,5
(  6, 1), (  6, 3), (  6, 5),
-- #7  Trepe Groupie #3: 1,2,4,5
(  7, 1), (  7, 2), (  7, 4), (  7, 5),
-- #8  Cafetaria Lady: 1,2,4,5
(  8, 1), (  8, 2), (  8, 4), (  8, 5),
-- #9  Guy on bench: 1-3
(  9, 1), (  9, 2), (  9, 3),
-- #10 Walking Student Girl: 1,3,4
( 10, 1), ( 10, 3), ( 10, 4),
-- #11 Dark Skinned Student: 1,4
( 11, 1), ( 11, 4),
-- #12 Library Girl w/Pigtail: 1-3
( 12, 1), ( 12, 2), ( 12, 3),
-- #13 Male Student in blue: 1,3-5
( 13, 1), ( 13, 3), ( 13, 4), ( 13, 5),
-- #14 Sitting Student: 2-4
( 14, 2), ( 14, 3), ( 14, 4),
-- #15 Talking Student Girl: 1-5
( 15, 1), ( 15, 2), ( 15, 3), ( 15, 4), ( 15, 5),
-- #16 Boy in Infirmary Hall: 1-3
( 16, 1), ( 16, 2), ( 16, 3),
-- #17 Blonde Girl in Main Hall: 1-3
( 17, 1), ( 17, 2), ( 17, 3),
-- #18 Girl with short pants: 1,2
( 18, 1), ( 18, 2),
-- #19 3 Girls Group: 1,2,4
( 19, 1), ( 19, 2), ( 19, 4),
-- #20 White Male Student: 1-3
( 20, 1), ( 20, 2), ( 20, 3),
-- #21 Right Girl Talking: 1,3,4
( 21, 1), ( 21, 3), ( 21, 4),
-- #22 Left Girl Talking: (none listed)
-- #23 Left Guy Talking:  (none listed)

-- ============================================================
-- Balamb Town
-- ============================================================
-- #24 Ma Dincht: 1,2,4,5
( 24, 1), ( 24, 2), ( 24, 4), ( 24, 5),
-- #25 Girl in a band: 1,3,4
( 25, 1), ( 25, 3), ( 25, 4),
-- #26 Station Conductor: 1,2
( 26, 1), ( 26, 2),
-- #27 Galbadian Soldier: 1,2,4,5
( 27, 1), ( 27, 2), ( 27, 4), ( 27, 5),
-- #28 Hotel Owner: 4,5
( 28, 4), ( 28, 5),
-- #29 Hotel Owner's Daughter: 1,3,4
( 29, 1), ( 29, 3), ( 29, 4),
-- #30 Girl with dog: 1-5
( 30, 1), ( 30, 2), ( 30, 3), ( 30, 4), ( 30, 5),
-- #31 Student skipping class: 3-5
( 31, 3), ( 31, 4), ( 31, 5),
-- #32 Chef with red shirt: 1,2,4,5
( 32, 1), ( 32, 2), ( 32, 4), ( 32, 5),
-- #33 Big Bad Rascal: (none listed)
-- #34 Girl sitting: 1,2,3
( 34, 1), ( 34, 2), ( 34, 3),

-- ============================================================
-- Timber
-- ============================================================
-- #35 Left Guard: 1,2,4
( 35, 1), ( 35, 2), ( 35, 4),
-- #36 Cat Loving Girl: 1,2
( 36, 1), ( 36, 2),
-- #37 Girl looking at Models: 4
( 37, 4),
-- #38 Guy who likes Girls: 1,2,4
( 38, 1), ( 38, 2), ( 38, 4),
-- #39 Guy in White: 1,3
( 39, 1), ( 39, 3),
-- #40 Old Lady: 1,3
( 40, 1), ( 40, 3),
-- #41 Dark Woman/White Bikini: 1
( 41, 1),
-- #42 Old Lady (2): 1,3
( 42, 1), ( 42, 3),
-- #43 Couple on Bench: 2,3,4
( 43, 2), ( 43, 3), ( 43, 4),
-- #44 Boy on Station Bridge: 1
( 44, 1),
-- #45 Woman (Train Expert): 1,4
( 45, 1), ( 45, 4),
-- #46 Depressed Woman at Home: 1,2
( 46, 1), ( 46, 2),
-- #47 Pub Owner: 1,3,4
( 47, 1), ( 47, 3), ( 47, 4),
-- #48 Drunkard: 1,2,3
( 48, 1), ( 48, 2), ( 48, 3),
-- #49 Guard at TV Station path: 2,3
( 49, 2), ( 49, 3),

-- ============================================================
-- Dollet
-- ============================================================
-- #50 Car Rental Woman: 4
( 50, 4),
-- #51 Girl near Wheelchair Man: 1,3
( 51, 1), ( 51, 3),
-- #52 Emo Kid in Green Jacket: 1,3,4
( 52, 1), ( 52, 3), ( 52, 4),
-- #53 Man with Blue Sleeves: 3
( 53, 3),
-- #54 Girl at the beach: 1,2
( 54, 1), ( 54, 2),
-- #55 Son of Queen of Cards: 1-4
( 55, 1), ( 55, 2), ( 55, 3), ( 55, 4),
-- #56 Woman near Pub: 1,2,4
( 56, 1), ( 56, 2), ( 56, 4),
-- #57 Pub's Waiter: 2
( 57, 2),
-- #58 Old Man in Pub: 2,3,4
( 58, 2), ( 58, 3), ( 58, 4),
-- #59 Pub's Owner: 1-4
( 59, 1), ( 59, 2), ( 59, 3), ( 59, 4),
-- #60 Shopping Lady in Yellow: 1
( 60, 1),
-- #61 Old Man at Townsquare: 1,3
( 61, 1), ( 61, 3),
-- #62 Hotel Girl: 2,3
( 62, 2), ( 62, 3),

-- ============================================================
-- Deling City
-- ============================================================
-- #63 Travelling Lady from FH: 1-4
( 63, 1), ( 63, 2), ( 63, 3), ( 63, 4),
-- #64 Hotel Waitress: 1
( 64, 1),
-- #65 Person near General Shop: 1-4
( 65, 1), ( 65, 2), ( 65, 3), ( 65, 4),
-- #66 Man in Black: 1-7
( 66, 1), ( 66, 2), ( 66, 3), ( 66, 4), ( 66, 5), ( 66, 6), ( 66, 7),
-- #67 Old Woman: 1-3
( 67, 1), ( 67, 2), ( 67, 3),
-- #68 Old Man: 1-3
( 68, 1), ( 68, 2), ( 68, 3),
-- #69 General Caraway: 1-4
( 69, 1), ( 69, 2), ( 69, 3), ( 69, 4),
-- #70 Train Conductor: 1,2,4
( 70, 1), ( 70, 2), ( 70, 4),
-- #71 Walking Woman: 1,2
( 71, 1), ( 71, 2),

-- ============================================================
-- Fisherman's Horizon
-- ============================================================
-- #72 Familiar Face #3: 1,4-6
( 72, 1), ( 72, 4), ( 72, 5), ( 72, 6),
-- #73 Martine: 1-7
( 73, 1), ( 73, 2), ( 73, 3), ( 73, 4), ( 73, 5), ( 73, 6), ( 73, 7),
-- #74 Flo (Mayor's Wife): 1,2,5,6
( 74, 1), ( 74, 2), ( 74, 5), ( 74, 6),
-- #75 Mayor Dobe: 1,2,4-6
( 75, 1), ( 75, 2), ( 75, 4), ( 75, 5), ( 75, 6),
-- #76 Kid at Town Square: 1-3
( 76, 1), ( 76, 2), ( 76, 3),
-- #77 Grease Monkey: 1,2,4,6
( 77, 1), ( 77, 2), ( 77, 4), ( 77, 6),
-- #78 Master Fisherman: ??? (unknown levels)

-- ============================================================
-- Winhill
-- ============================================================
-- #79 Student Mercenary: 1,2,3,5
( 79, 1), ( 79, 2), ( 79, 3), ( 79, 5),
-- #80 Shop Owner: 1,2,4
( 80, 1), ( 80, 2), ( 80, 4),
-- #81 Hotel Owner: 1,2,4
( 81, 1), ( 81, 2), ( 81, 4),
-- #82 Old Man in Residence: 1,4,5
( 82, 1), ( 82, 4), ( 82, 5),
-- #83 Man on bench: 1,3,5
( 83, 1), ( 83, 3), ( 83, 5),
-- #84 Playing Girl: 1-4
( 84, 1), ( 84, 2), ( 84, 3), ( 84, 4),
-- #85 Mansion Owner: 3,4,5
( 85, 3), ( 85, 4), ( 85, 5),
-- #86 Blonde Woman: 1,3,4
( 86, 1), ( 86, 3), ( 86, 4),

-- ============================================================
-- Trabia Garden
-- ============================================================
-- #87 Student in green: 1,2,3,5
( 87, 1), ( 87, 2), ( 87, 3), ( 87, 5),
-- #88 Selphie's Friend: 1-5
( 88, 1), ( 88, 2), ( 88, 3), ( 88, 4), ( 88, 5),
-- #89 Trabian Faculty: 1-3,5
( 89, 1), ( 89, 2), ( 89, 3), ( 89, 5),
-- #90 Girl Student: 1,2,4
( 90, 1), ( 90, 2), ( 90, 4),
-- #91 Sitting Guy: 1-3
( 91, 1), ( 91, 2), ( 91, 3),
-- #92 Girl with book: 1,2,4
( 92, 1), ( 92, 2), ( 92, 4),
-- #93 Mechanic: 3-5
( 93, 3), ( 93, 4), ( 93, 5),
-- #94 Basketball Freak: 2,3,5
( 94, 2), ( 94, 3), ( 94, 5),
-- #95 Student near rocket: 1,2,4
( 95, 1), ( 95, 2), ( 95, 4),
-- #96 Boy at Basketball Court: 2,4
( 96, 2), ( 96, 4),
-- #97 Girl in Bikini: 1-3,5
( 97, 1), ( 97, 2), ( 97, 3), ( 97, 5),

-- ============================================================
-- Shumi Village
-- ============================================================
-- #98  Left Shumi: 1,2,5,6
( 98, 1), ( 98, 2), ( 98, 5), ( 98, 6),
-- #99  Middle Shumi: 1,2,4-7
( 99, 1), ( 99, 2), ( 99, 4), ( 99, 5), ( 99, 6), ( 99, 7),
-- #100 Right Shumi: 1,2,4,6
(100, 1), (100, 2), (100, 4), (100, 6),
-- #101 Shumi at a table: 1,2,5,6
(101, 1), (101, 2), (101, 5), (101, 6),
-- #102 Elder: 2,4,6,7
(102, 2), (102, 4), (102, 6), (102, 7),
-- #103 Elder's Assistant: 1,2,4,6,7
(103, 1), (103, 2), (103, 4), (103, 6), (103, 7),
-- #104 Artisan: 1,2,6,7
(104, 1), (104, 2), (104, 6), (104, 7),
-- #105 Busy Working Shumi: 4,5,6
(105, 4), (105, 5), (105, 6),
-- #106 Sculptor: 3,4,5
(106, 3), (106, 4), (106, 5),
-- #107 Master Fisherman: (none listed)

-- ============================================================
-- CC-Group (Disc 4)
-- ============================================================
-- #108 Joker: 1-3,6,7
(108, 1), (108, 2), (108, 3), (108, 6), (108, 7),
-- #109 Jack: 3,4,6
(109, 3), (109, 4), (109, 6),
-- #110 Club: 3,5,6
(110, 3), (110, 5), (110, 6),
-- #111 Right Diamond: 3-5,7
(111, 3), (111, 4), (111, 5), (111, 7),
-- #112 Left Diamond: 3-5,7
(112, 3), (112, 4), (112, 5), (112, 7),
-- #113 Spade: 1-3,6,7
(113, 1), (113, 2), (113, 3), (113, 6), (113, 7),
-- #114 Heart: 3,5,6,7
(114, 3), (114, 5), (114, 6), (114, 7),
-- #115 King: 1-7
(115, 1), (115, 2), (115, 3), (115, 4), (115, 5), (115, 6), (115, 7);

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