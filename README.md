# Triple Triad

[![Build Status](https://github.com/Simon-Henshall/triple-triad/actions/workflows/node.js.yml/badge.svg)](https://github.com/Simon-Henshall/triple-triad/actions/workflows/node.js.yml)
[![Test Coverage](https://codecov.io/gh/Simon-Henshall/triple-triad/branch/main/graph/badge.svg)](https://codecov.io/gh/Simon-Henshall/triple-triad)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A fan-made web implementation of the classic **Triple Triad** card game from the _Final Fantasy_ series, originally created by Square Enix. This version is built as a single-page web application with a PHP/MySQL backend and a JavaScript front-end rendered on an HTML5 Canvas using CreateJS (EaselJS).

> **Game concept and all related intellectual property © Square Enix. Original source code and web implementation © Simon Henshall.**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [Gameplay](#gameplay)
  - [Game Phases](#game-phases)
  - [Rules](#rules)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Linting & Formatting](#linting--formatting)
- [Assets](#assets)
- [Licence](#licence)
- [Legal Notice & Disclaimer](#legal-notice---disclaimer)

---

## Features

- **Canvas-based rendering** using CreateJS (EaselJS) for smooth 60 FPS animations.
- **State machine-driven game flow** with distinct phases: opponent selection, rules display, deck selection, hand selection, card placement, resolution, AI turn, and game-over.
- **Database-backed card collection** – cards, players, elements, and ownership are stored in a MySQL database.
- **RNG-based AI opponent system** – AI opponents generate their hands from a card pool using seeded randomness and a rare-card mechanic.
- **Responsive opponent selection** – opponents are grouped by location (e.g. Balamb, Dollet, Galbadia).
- **Advanced rule system** – supports Elemental, Same, Same Wall, Plus, Combo, Open, and Random rules.
- **Linting and formatting** – ESLint + Prettier for code quality; Jest for unit tests.

---

## Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Front-end | JavaScript (ES Modules), CreateJS (EaselJS)             |
| Back-end  | PHP 8+ with PDO                                         |
| Database  | MySQL 8 / MariaDB (InnoDB, utf8mb4)                     |
| Tooling   | ESLint, Prettier, Jest, TypeScript (type-checking only) |

---

## Project Structure

```
triple-triad/
├── assets/
│   ├── custom/
│   │   ├── blue.png                 # Custom blue card face
│   │   └── red.png                  # Custom red card face
│   └── original/
│       ├── ASSETS_README.md         # Third-party asset attribution
│       ├── board.png                # Game board background
│       ├── cursor.png               # Selection cursor
│       ├── minus_one.png            # -1 strength modifier
│       ├── plus_one.png             # +1 strength modifier
│       ├── selection_card.png       # Card selection indicator
│       ├── cards/                   # Card face images (card0.png – card109.png, back.png)
│       └── elements/                # Element icons (1.png through 8.png)
├── back_end/
│   ├── sql/
│   │   ├── 00_schema.sql            # Database schema (tables, FKs)
│   │   ├── 01_seed_elements.sql     # Element reference data
│   │   ├── 02_seed_levels.sql       # Card level values (1-10)
│   │   ├── 03_seed_cards.sql        # Card definitions with stats
│   │   ├── 04_seed_players.sql      # Player profiles
│   │   ├── 05_seed_player_levels.sql# Player-level bridge data
│   │   ├── 06_seed_player_cards.sql # Player-card junction data
│   │   └── run_all.sql              # Batch runner for all SQL files
│   └── src/
│       ├── Database.php             # PDO database connection
│       ├── Card.php                 # Card model (CRUD + player association)
│       └── Player.php               # Player model (CRUD + card association)
├── front_end/
│   ├── api/
│   │   ├── get_cards.php            # Fetch all cards
│   │   ├── get_opponent_cards.php   # Fetch a specific opponent's card pool
│   │   ├── get_opponents.php        # Fetch all opponents grouped by location
│   │   └── get_player_cards.php     # Fetch cards owned by a player
│   ├── js/
│   │   ├── main.js                  # Entry point – bootstraps the game
│   │   ├── constants/
│   │   │   ├── config.js            # Configuration (FPS, image paths)
│   │   │   ├── directions.js        # Direction mapping for card adjacency
│   │   │   ├── elements.js          # Element type metadata
│   │   │   └── offsets.js           # Layout offsets for rendering
│   │   ├── data/                    # Local data definitions
│   │   ├── game/
│   │   │   ├── game-state-machine.js# Phase state machine
│   │   │   └── phases.js            # Phase registry
│   │   ├── phases/                  # Game phase controllers/models/views
│   │   │   ├── ai-turn/             # AI turn phase
│   │   │   ├── card-claim/          # Card claim phase (winner claims a card)
│   │   │   ├── confirmation/        # Deck confirmation phase
│   │   │   ├── deck-selection/      # Player deck selection phase
│   │   │   ├── end-turn/            # End-of-turn transition logic
│   │   │   ├── game-over/           # Game-over determination
│   │   │   ├── hand-select/         # Player hand selection phase
│   │   │   ├── opponent-selection/  # Opponent selection phase
│   │   │   ├── placement/           # Card placement on the board
│   │   │   ├── resolution/          # Card flip resolution
│   │   │   └── rules/               # Rules display phase
│   │   ├── shared/
│   │   │   ├── board/               # Board model and rendering
│   │   │   ├── card/                # Card factory, Card class
│   │   │   ├── cursor/              # Cursor model, view, controller (MVC)
│   │   │   ├── game/                # Game class, game-init (bootstrapper)
│   │   │   ├── input/               # Keyboard input handling
│   │   │   ├── player/              # Player model, view, controller (MVC)
│   │   │   └── ui/                  # Scoreboard, InfoBox, PreviewCard, etc.
│   │   ├── utilities/
│   │   │   ├── ai-hand-generator.js # AI hand generation logic
│   │   │   ├── debug.js             # Debug utilities
│   │   │   ├── network.js           # Fetch wrappers for API calls
│   │   │   ├── rng.js               # Seeded random number generator
│   │   │   ├── shuffle.js           # Array shuffle utility
│   │   │   └── turn.js              # Turn management helpers
│   │   └── __tests__/               # Jest test files
│   ├── game.php                     # Game HTML template (canvas + script tag)
│   └── rules-panel.html             # Rules and controls panel (HTML overlay)
├── config.php                       # DB configuration loader (.env-aware)
├── header.php                       # HTML <head> with CDN dependencies
├── footer.php                       # HTML footer
├── index.php                        # Entry page (includes header, game, footer)
├── package.json                     # Node.js devDependencies and scripts
├── package-lock.json
├── eslint.config.ts                 # ESLint flat config
├── jest.config.js                   # Jest configuration
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Web server** – Apache / Nginx / IIS with PHP 8.0+ support (e.g. [WAMP](https://www.wampserver.com/), [XAMPP](https://www.apachefriends.org/), [Laravel Valet](https://laravel.com/docs/valet))
- **PHP** 8.0 or higher
- **MySQL** 8.0+ or MariaDB 10.5+
- **Node.js** 18+ (for development tooling only – linting, testing)
- A modern browser with Canvas support (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository** into your web server's document root:

   ```bash
   git clone https://github.com/Simon-Henshall/triple-triad.git
   cd triple-triad
   ```

2. **Install Node.js dev dependencies** (optional, for linting/testing):

   ```bash
   npm install
   ```

3. **Configure the database connection**:

   Create a `.env` file in the project root (or set environment variables):

   ```ini
   DB_HOST=localhost
   DB_NAME=triple_triad
   DB_USER=root
   DB_PASS=your_password
   ```

   The application reads `.env` automatically via `config.php`. Alternatively, set the environment variables directly on your system.

4. **Serve the application**:

   Point your web server's document root to the project directory. With WAMP/XAMPP, place the project folder under `www/` or `htdocs/` and access it via:

   ```
   http://localhost/triple-triad/
   ```

### Database Setup

Run the SQL files **in order** against your MySQL server. The easiest method is to execute the batch runner:

```bash
mysql -u root -p < back_end/sql/run_all.sql
```

Or, if you prefer to run them individually:

```bash
mysql -u root -p triple_triad < back_end/sql/00_schema.sql
mysql -u root -p triple_triad < back_end/sql/01_seed_elements.sql
mysql -u root -p triple_triad < back_end/sql/02_seed_levels.sql
mysql -u root -p triple_triad < back_end/sql/03_seed_cards.sql
mysql -u root -p triple_triad < back_end/sql/04_seed_players.sql
mysql -u root -p triple_triad < back_end/sql/05_seed_player_levels.sql
mysql -u root -p triple_triad < back_end/sql/06_seed_player_cards.sql
```

#### What each SQL file does:

| File                        | Purpose                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `00_schema.sql`             | Creates the database (`triple_triad`) and all tables (`element`, `card`, `level_value`, `player`, `player_level`, `player_card`) with foreign key constraints. Uses InnoDB with utf8mb4. |
| `01_seed_elements.sql`      | Inserts 8 elements (Water, Lightning, Fire, Ice, Earth, Poison, Holy, Wind) plus a default "none" element (ID 0).                                                                        |
| `02_seed_levels.sql`        | Inserts card levels 1 through 10.                                                                                                                                                        |
| `03_seed_cards.sql`         | Seeds the `card` table with individual card definitions including display name, image reference, four directional strength values, element association, and level.                       |
| `04_seed_players.sql`       | Seeds the `player` table with named player profiles and optional location + unique rare card associations.                                                                               |
| `05_seed_player_levels.sql` | Bridges players to allowed card levels via the `player_level` junction table.                                                                                                            |
| `06_seed_player_cards.sql`  | Bridges players to cards they own (with quantity) via the `player_card` junction table.                                                                                                  |

---

## Gameplay

### Game Phases

The game is driven by a **state machine** that transitions through the following phases:

1. **Opponent Selection** – Choose an AI opponent to play against. Opponents are grouped by in-game location (e.g. Balamb, Dollet, Galbadia).
2. **Rules** – Display the active rules for the match with Play / Quit options.
3. **Deck Selection** – Review the player's available cards and choose up to 5 to form a hand.
4. **Confirmation** – Confirm or revise the selected deck before the match begins.
5. **Hand Select** – The player selects cards from their deck to hold in their hand (max 5 cards).
6. **Placement** – Players take turns placing cards on a 3×3 grid.
7. **Resolution** – Captured cards are resolved based on directional strength comparisons, including Same, Plus, and Combo chain reactions.
8. **End Turn** – Transition logic between turns.
9. **AI Turn** – The AI opponent selects and places its card.
10. **Game Over** – End-of-match determination. Winner may claim a card from the loser.
11. **Card Claim** – The winner selects one card from the loser's hand to claim.

### Rules

- The game is played on a **3×3 grid**.
- Each card has four **directional strength values** (up, right, down, left) and an optional **element**.
- When a card is placed adjacent to an opponent's card, the strengths on the touching sides are compared. If the placed card's strength is higher, the opponent's card is **captured** and becomes the current player's card.
- The player with the most cards on the board at the end of the match **wins** and may claim one card from the opponent.

The following special rules can be active for a match:

| Rule          | Description                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Elemental** | Coloured tiles on the board grant a +1 strength boost to cards whose element matches the tile, or a −1 penalty if the element differs.                     |
| **Same**      | When a placed card's printed value matches the facing printed value of two adjacent opponent cards, both opponent cards are captured.                      |
| **Same Wall** | Board edges count as rank A (value 10) for the Same rule, allowing edge-adjacent matches to trigger captures. Requires the Same rule to be active.         |
| **Plus**      | When the sum of the placed card's strength plus the opponent's facing strength is equal for two adjacent opponent pairs, both opponent cards are captured. |
| **Combo**     | Cards captured by Same or Plus trigger a chain reaction — they immediately attempt to flip further adjacent opponent cards with lower edge values.         |
| **Open**      | Both players see the AI's hand face-up on the board (the AI's cards are revealed instead of face-down).                                                    |
| **Random**    | The player's hand is chosen randomly from their deck instead of allowing manual selection.                                                                 |

---

## API Endpoints

All API endpoints are located under `front_end/api/` and return JSON responses.

| Endpoint                                  | Method | Description                                                                            |
| ----------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `get_cards.php`                           | GET    | Returns all cards in the database.                                                     |
| `get_player_cards.php?player_id={id}`     | GET    | Returns all cards owned by a specific player.                                          |
| `get_opponents.php`                       | GET    | Returns all AI opponents grouped by location.                                          |
| `get_opponent_cards.php?opponent_id={id}` | GET    | Returns the card pool for a specific opponent, including their rare card if available. |

---

## Running Tests

Unit tests are written with [Jest](https://jestjs.io/) and located in `front_end/js/__tests__/`.

```bash
npm test
```

The test script uses Node.js with `--experimental-vm-modules` to support ES module syntax.

---

## Linting & Formatting

[ESLint](https://eslint.org/) with the flat config (`eslint.config.ts`) is used for static analysis. [Prettier](https://prettier.io/) handles code formatting.

To run the linter:

```bash
npx eslint .
```

To format the codebase:

```bash
npx prettier --write .
```

---

## Assets

All visual assets are stored under `assets/original/` and `assets/custom/`:

| Path               | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `assets/original/` | Original Square Enix game assets (board, cursor, card faces, elements). |
| `assets/custom/`   | Custom card face recolours (blue/red player indicators).                |

Key files under `assets/original/`:

- **board.png** – The game board background (950×650 canvas).
- **cursor.png** – Selection cursor graphic used throughout the UI.
- **minus_one.png** / **plus_one.png** – Strength modifiers displayed during resolution.
- **cards/** – Individual card images, named `card0.png`, `card1.png`, etc.
- **elements/** – Element icons named after their element ID (`1.png` through `8.png`).

The JavaScript configuration in `front_end/js/constants/config.js` defines the base image path (`assets/original/`) and card image path used throughout the rendering code.

---

## Licence

This project is released under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for the full terms. The MIT licence applies to all original source code and web implementation authored by Simon Henshall. It does not extend to any game concepts, character designs, trademarks, visual assets, or other intellectual property belonging to Square Enix Co., Ltd., which are excluded from this grant of rights.

---

# Legal Notice, Disclaimer & Licence

This repository is an unofficial, non-commercial fan creation intended for educational and portfolio review purposes only. It is not affiliated with, endorsed by, or associated with Square Enix.

### Intellectual Property Notice

| Asset Type                                                             | Owner                 | MIT Licence Applies? |
| :--------------------------------------------------------------------- | :-------------------- | :------------------: |
| **Original Source Code & Architecture** (PHP, JavaScript, logic)       | Simon Henshall        |      ✅ **Yes**      |
| **Character Designs, Artwork, & Trademarks** (_Final Fantasy VIII_)    | Square Enix Co., Ltd. |      ❌ **No**       |
| **Visual Assets** (Official board layouts, card faces, icons, sprites) | Square Enix Co., Ltd. |      ❌ **No**       |
| **The "Triple Triad" Name & Brand Identity**                           | Square Enix Co., Ltd. |      ❌ **No**       |

> 📌 **Key Point:** Square Enix retains absolute ownership of all _Final Fantasy_ intellectual property, trademarks, and associated visual assets. Only the original functional source code and software architecture authored by Simon Henshall are covered by the MIT licence. (Note: Game mechanics and rulesets are non-copyrightable elements; the MIT licence applies fully to the original code written to execute these mechanics).

### Copyright Attributions

- **Square Enix IP:**
  - © 1999, 2019 SQUARE ENIX CO., LTD. All Rights Reserved.
  - CHARACTER DESIGN: TETSUYA NOMURA
  - LOGO ILLUSTRATION: © 1999 YOSHITAKA AMANO
- **Original Code:**
  - Copyright © 2026 Simon Henshall. Released under the [MIT License](LICENSE).

### Terms of Use

- **Original Source Code:** You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software code under the terms of the MIT licence, provided the original copyright and permission notice are included.
- **Square Enix Assets:** This repository does not grant, imply, or transfer any rights to copy, distribute, modify, or use Square Enix intellectual property (including character designs, artwork, or branding) outside of this portfolio context.
- **No Endorsement:** This project does not represent or imply endorsement, sponsorship, or affiliation by Square Enix.
- **Good Faith Community Compliance:** This project references guidelines in the [Square Enix West Material Usage Policy](https://square-enix-games.com/documents/materialusagepolicy) as a good-faith effort to respect intellectual property standards customary in the fan-creation community.

### Warranty Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
