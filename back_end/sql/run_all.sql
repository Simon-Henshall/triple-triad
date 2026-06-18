-- ============================================================
-- Triple Triad – Master Setup Script
-- ============================================================
-- Run this file to create the full database schema and seed
-- data. Execute from the MySQL CLI:
--
--   mysql -u root -p < back_end/sql/run_all.sql
-- ============================================================

-- First, create the schema (tables and constraints)
SOURCE 00_schema.sql;

-- Then seed data in dependency order:
SOURCE 01_seed_elements.sql;    -- element lookup table
SOURCE 02_seed_levels.sql;      -- level_value lookup table
SOURCE 03_seed_cards.sql;       -- card definitions (depends on elements)
SOURCE 04_seed_players.sql;     -- player profiles (depends on cards for FK)
SOURCE 05_seed_player_levels.sql; -- player-level bridge (depends on players + level_values)
SOURCE 06_seed_player_cards.sql;  -- player card inventory (depends on players + cards)