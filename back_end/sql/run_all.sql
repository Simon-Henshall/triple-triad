-- ============================================================
-- Triple Triad – Master Setup Script
-- ============================================================
-- Run this file to create the full database schema and seed
-- data. Execute from the MySQL CLI:
--
--   mysql -u root -p < back_end/sql/run_all.sql
-- ============================================================

-- Schema (tables and constraints)
SOURCE back_end/sql/00_schema.sql;

-- Element lookup table
SOURCE back_end/sql/01_seed_elements.sql;
-- Level value lookup table
SOURCE back_end/sql/02_seed_levels.sql;
-- Card definitions (depends on elements)
SOURCE back_end/sql/03_seed_cards.sql;
-- Player profiles (depends on cards for FK)
SOURCE back_end/sql/04_seed_players.sql;
-- Player-level bridge (depends on players + level_values)
SOURCE back_end/sql/05_seed_player_levels.sql;
-- Player card inventory (depends on players + cards)
SOURCE back_end/sql/06_seed_player_cards.sql;
