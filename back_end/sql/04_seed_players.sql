-- ============================================================
-- Triple Triad – Player Seed Data
-- unique_card_id values reference rare cards held by the player.
--   Quistis=104, MiniMog=81, Zell=106, Pandemona=93,
--   Doomtrain=98, Siren=86, Kiros=101, Rinoa=107,
--   Ifrit=85, Irvine=105, Quezacotl=83, Selphie=103
-- ============================================================

USE triple_triad;

INSERT INTO `player` (`id`, `name`, `location`, `unique_card_id`) VALUES
-- Player 1 (human player)
(  1, 'Player 1',                  NULL,                                                    NULL),

-- ============================================================
-- Balamb Garden
-- ============================================================
(  2, 'Trepe Groupie #1',          'Balamb Garden - Cafetaria, guy in the back',             104),
(  3, 'Friend Trepe Groupie #1',   'Balamb Garden - Cafetaria, guy in the front',            NULL),
(  4, 'Gatekeeper',                'Balamb Garden - Gate Reception',                        NULL),
(  5, 'Running Boy',               'Balamb Garden - Main Halls',                             81),
(  6, 'Trepe Groupie #2',          'Balamb Garden - 2nd Floor Classroom',                   104),
(  7, 'Trepe Groupie #3',          'Balamb Garden - 2nd Floor Classroom',                   104),
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
( 24, 'Ma Dincht',                 'Balamb Town - Zell''s House',                           106),
( 25, 'Girl in a band',            'Balamb Town - Entrance Screen (Disc 1)',                NULL),
( 26, 'Station Conductor',         'Balamb Town - Entrance of the Station',                 NULL),
( 27, 'Galbadian Soldier',        'Balamb Town - Docks (Balamb Lockdown ONLY)',            NULL),
( 28, 'Hotel Owner',               'Balamb Town - In front of the Hotel',                   93),
( 29, 'Hotel Owner''s Daughter',   'Balamb Town - Old Man House / In front of the Hotel',  93),
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
( 47, 'Pub Owner',                 'Timber - Timber Pub, upper right',                      98),
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
( 59, 'Pub''s Owner',              'Dollet - Beat him -> Private Room',                     86),
( 60, 'Shopping Lady in Yellow',   'Dollet - Walking in Nautilus Street',                   NULL),
( 61, 'Old Man at Townsquare',     'Dollet - Townsquare',                                   NULL),
( 62, 'Hotel Girl',                'Dollet - Dollet Hotel Main Hall',                       NULL),

-- ============================================================
-- Deling City
-- ============================================================
( 63, 'Travelling Lady from FH',   'Deling City - Across the street of Hotel',              NULL),
( 64, 'Hotel Waitress',            'Deling City - Hotel Restaurant',                        NULL),
( 65, 'Person near General Shop',  'Deling City - In the street with Shops',                NULL),
( 66, 'Man in Black',              'Deling City - Across the Junk Shop',                    101),
( 67, 'Old Woman',                 'Deling City - Street near Main Gate',                   NULL),
( 68, 'Old Man',                   'Deling City - On Bench, Street near Main Gate',         NULL),
( 69, 'General Caraway',           'Deling City - Caraway''s Mansion',                      107),
( 70, 'Train Conductor',           'Deling City - City Train Station',                      NULL),
( 71, 'Walking Woman',             'Deling City - Other street near Main Gate',             NULL),

-- ============================================================
-- Fisherman's Horizon
-- ============================================================
( 72, 'Familiar Face #3',          'FH - Nearby elevator going up',                         NULL),
( 73, 'Martine',                   'FH - Right from Mayor''s House',                        85),
( 74, 'Flo (Mayor''s Wife)',       'FH - Mayor''s House, Upstairs',                         105),
( 75, 'Mayor Dobe',                'FH - Mayor''s House, Upstairs',                         83),
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
( 88, 'Selphie''s Friend',         'Trabia Garden - Fountain Screen',                       103),
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