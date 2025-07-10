import {StageType} from "../models/player/stageType";
import {List} from "immutable";

export const CREATE_TABLES_QUERY = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    telegram_name TEXT NOT NULL,
    chat_id INTEGER NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'Default'
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL UNIQUE,
  team_name TEXT,
  game_scores INTEGER DEFAULT 0,
  rat_scores INTEGER DEFAULT 0,
  penalties TEXT,
  is_rat BOOLEAN DEFAULT FALSE,
  reg_number INTEGER NOT NULL,
  votings JSONB DEFAULT '{}',
  ratGames JSONB DEFAULT '{}',
  doneTasks JSONB DEFAULT '{}',
  bonus_rat_games INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS player_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_score INTEGER NOT NULL,
  plus_extra_points INTEGER DEFAULT 0,
  minus_extra_points INTEGER DEFAULT 0,
  best_move_points INTEGER DEFAULT 0,
  ci_points INTEGER DEFAULT 0,
  role_type TEXT CHECK (role_type IN ('MAFIA', 'CITIZENS', 'DON', 'SHERIFF'))
);

-- CREATE TABLE IF NOT EXISTS games (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   player_id INTEGER REFERENCES players(id),
--   player_score_id INTEGER REFERENCES player_scores(id),
--   game_result TEXT CHECK (game_result IN ('MAFIA_WIN', 'CITIZENS_WIN', 'DRAW'))
-- );

-- CREATE TABLE IF NOT EXISTS teams (
--   id TEXT PRIMARY KEY,
--   title TEXT,
--   emblem_url TEXT,
--   score INTEGER,
--   bonus_score INTEGER,
--   total_score INTEGER,
--   rat_player_id INTEGER REFERENCES players(id),
--   capitan_id INTEGER REFERENCES players(id)
-- );
-- 
-- CREATE TABLE IF NOT EXISTS team_players (
--   team_id TEXT REFERENCES teams(id),
--   player_id INTEGER REFERENCES players(id),
--   is_kicked BOOLEAN DEFAULT FALSE,
--   PRIMARY KEY (team_id, player_id)
-- );

-- CREATE TABLE IF NOT EXISTS series (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   stage_type TEXT CHECK (stage_type IN ('SHOW_MATCH', 'FIRST_TOUR', 'SECOND_TOUR', 'FINAL'))
-- );

CREATE TABLE IF NOT EXISTS series_games (
  series_id INTEGER REFERENCES series(id),
  game_id INTEGER REFERENCES games(id),
  PRIMARY KEY (series_id, game_id)
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK (type IN ('SELECT_TOUR', 'FIRST_TOUR', 'SECOND_TOUR', 'FINAL_TOUR'))
);

CREATE TABLE IF NOT EXISTS tour_series (
  tour_id INTEGER REFERENCES tours(id),
  series_id INTEGER REFERENCES series(id),
  PRIMARY KEY (tour_id, series_id)
);`;