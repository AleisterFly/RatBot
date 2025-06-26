import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import * as path from 'path';
import {CREATE_TABLES_QUERY} from "../config/dbQueries"

export class DBManager {
  private db: DatabaseType;

  constructor(filePath: string = 'db.sqlite') {
    this.db = new Database(path.resolve(__dirname, filePath));
  }

  // ======================================================================================================
  // ==== CREATE TABLES ===================================================================================
  // ======================================================================================================
  createTables(): void {
    const schema = CREATE_TABLES_QUERY.trim();

    this.db.exec(schema);
    console.log("Tables created successfully!");
  }

  // ======================================================================================================
  // ==== ADD A ROW TO THE TABLE ==========================================================================
  // ======================================================================================================
  addUser(nickname: string, telegramName: string, chatId: number, regNumber: number): void {
    this.db.prepare(`
      INSERT INTO users (nickname, telegram_name, chat_id, reg_number)
      VALUES (?, ?, ?, ?)
    `).run(nickname, telegramName, chatId, regNumber);
  }

  addPlayer(nickname: string, teamName: string, gameScores: number, ratScores: number, penalties: string, isRat: boolean): void {
    this.db.prepare(`
      INSERT INTO players (nickname, team_name, game_scores, rat_scores, penalties, is_rat)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nickname, teamName, gameScores, ratScores, penalties, isRat);
  }

  addPlayerScore(total: number, plus: number, minus: number, best: number, ci: number, roleType: string): void {
    this.db.prepare(`
      INSERT INTO player_scores (total_score, plus_extra_points, minus_extra_points, best_move_points, ci_points, role_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(total, plus, minus, best, ci, roleType);
  }

  addGame(playerId: number, scoreId: number, result: string): void {
    this.db.prepare(`
      INSERT INTO games (player_id, player_score_id, game_result)
      VALUES (?, ?, ?)
    `).run(playerId, scoreId, result);
  }

  addTeam(id: string, title: string, emblemUrl: string, score: number, bonus: number, total: number, ratPlayerId: number, capitanId: number): void {
    this.db.prepare(`
      INSERT INTO teams (id, title, emblem_url, score, bonus_score, total_score, rat_player_id, capitan_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, emblemUrl, score, bonus, total, ratPlayerId, capitanId);
  }

  addTeamPlayer(teamId: string, playerId: number, isKicked: boolean): void {
    this.db.prepare(`
      INSERT INTO team_players (team_id, player_id, is_kicked)
      VALUES (?, ?, ?)
    `).run(teamId, playerId, isKicked);
  }

  addSeries(stageType: string): void {
    this.db.prepare(`
      INSERT INTO series (stage_type)
      VALUES (?)
    `).run(stageType);
  }

  addSeriesGame(seriesId: number, gameId: number): void {
    this.db.prepare(`
      INSERT INTO series_games (series_id, game_id)
      VALUES (?, ?)
    `).run(seriesId, gameId);
  }

  addTour(type: string): void {
    this.db.prepare(`
      INSERT INTO tours (type)
      VALUES (?)
    `).run(type);
  }

  addTourSeries(tourId: number, seriesId: number): void {
    this.db.prepare(`
      INSERT INTO tour_series (tour_id, series_id)
      VALUES (?, ?)
    `).run(tourId, seriesId);
  }

  addViewer(nickname: string): void {
    this.db.prepare(`
      INSERT INTO viewers (nickname)
      VALUES (?)
    `).run(nickname);
  }

  addViewerSeriaVoting(viewerId: number, seriaId: number, votedNicknames: string): void {
    this.db.prepare(`
      INSERT INTO viewer_seria_voting (viewer_id, seria_id, voted_player_nicknames)
      VALUES (?, ?, ?)
    `).run(viewerId, seriaId, votedNicknames);
  }

  addViewerTourVoting(viewerId: number, tourId: number, votedNicknames: string): void {
    this.db.prepare(`
      INSERT INTO viewer_tour_voting (viewer_id, tour_id, voted_player_nicknames)
      VALUES (?, ?, ?)
    `).run(viewerId, tourId, votedNicknames);
  }


  // ======================================================================================================
  // ==== ADD A ROW TO THE TABLE ==========================================================================
  // ======================================================================================================

  // Users
  getUserByTelegram(chatId: number) {
    return this.db.prepare(`SELECT * FROM users WHERE chat_id = ?`).get(chatId);
  }

  getUserByNickname(nickname: string) {
    return this.db.prepare(`SELECT * FROM users WHERE nickname = ?`).get(nickname);
  }

  // Players
  getPlayerByNickname(nickname: string) {
    return this.db.prepare(`SELECT * FROM players WHERE nickname = ?`).get(nickname);
  }

  getPlayersByTeam(teamName: string) {
    return this.db.prepare(`SELECT * FROM players WHERE team_name = ?`).all(teamName);
  }

  // Player Scores
  getPlayerScoresByRole(roleType: string) {
    return this.db.prepare(`SELECT * FROM player_scores WHERE role_type = ?`).all(roleType);
  }

  // Games
  getGamesByPlayer(playerId: number) {
    return this.db.prepare(`SELECT * FROM games WHERE player_id = ?`).all(playerId);
  }

  getGamesByResult(result: string) {
    return this.db.prepare(`SELECT * FROM games WHERE game_result = ?`).all(result);
  }

  // Teams
  getTeamByTitle(title: string) {
    return this.db.prepare(`SELECT * FROM teams WHERE title = ?`).get(title);
  }

  getTeamPlayers(teamId: string) {
    return this.db.prepare(`SELECT p.* FROM team_players tp
    JOIN players p ON tp.player_id = p.id
    WHERE tp.team_id = ?`).all(teamId);
  }

  // Series
  getSeriesByStage(stageType: string) {
    return this.db.prepare(`SELECT * FROM series WHERE stage_type = ?`).all(stageType);
  }

  // Tours
  getToursByType(type: string) {
    return this.db.prepare(`SELECT * FROM tours WHERE type = ?`).all(type);
  }

  // Viewers
  getViewerByNickname(nickname: string) {
    return this.db.prepare(`SELECT * FROM viewers WHERE nickname = ?`).get(nickname);
  }

  getViewerSeriaVotes(viewerId: number) {
    return this.db.prepare(`SELECT * FROM viewer_seria_voting WHERE viewer_id = ?`).all(viewerId);
  }

  getViewerTourVotes(viewerId: number) {
    return this.db.prepare(`SELECT * FROM viewer_tour_voting WHERE viewer_id = ?`).all(viewerId);
  }

  // ======================================================================================================
  // ==== UPDATE A ROW IN THE TABLE ======================================================================
  // ======================================================================================================

  // Users
  updateUserNickname(id: number, nickname: string): void {
    this.db.prepare(`UPDATE users SET nickname = ? WHERE id = ?`).run(nickname, id);
  }

  updateUserTelegramName(id: number, telegramName: string): void {
    this.db.prepare(`UPDATE users SET telegram_name = ? WHERE id = ?`).run(telegramName, id);
  }

  updateUserChatId(id: number, chatId: number): void {
    this.db.prepare(`UPDATE users SET chat_id = ? WHERE id = ?`).run(chatId, id);
  }

  // Players
  updatePlayerTeam(id: number, teamName: string): void {
    this.db.prepare(`UPDATE players SET team_name = ? WHERE id = ?`).run(teamName, id);
  }

  updatePlayerScores(id: number, gameScores: number, ratScores: number): void {
    this.db.prepare(`UPDATE players SET game_scores = ?, rat_scores = ? WHERE id = ?`).run(gameScores, ratScores, id);
  }

  updatePlayerPenalties(id: number, penalties: string): void {
    this.db.prepare(`UPDATE players SET penalties = ? WHERE id = ?`).run(penalties, id);
  }

  updatePlayerIsRat(id: number, isRat: boolean): void {
    this.db.prepare(`UPDATE players SET is_rat = ? WHERE id = ?`).run(isRat, id);
  }

  // Player Scores
  updatePlayerScore(id: number, total: number, plus: number, minus: number, best: number, ci: number, role: string): void {
    this.db.prepare(`
      UPDATE player_scores
      SET total_score = ?, plus_extra_points = ?, minus_extra_points = ?, best_move_points = ?, ci_points = ?, role_type = ?
      WHERE id = ?
    `).run(total, plus, minus, best, ci, role, id);
  }

  // Games
  updateGameResult(id: number, result: string): void {
    this.db.prepare(`UPDATE games SET game_result = ? WHERE id = ?`).run(result, id);
  }

  // Teams
  updateTeamScore(id: string, score: number, bonus: number, total: number): void {
    this.db.prepare(`
      UPDATE teams
      SET score = ?, bonus_score = ?, total_score = ?
      WHERE id = ?
    `).run(score, bonus, total, id);
  }

  updateTeamTitle(id: string, title: string): void {
    this.db.prepare(`UPDATE teams SET title = ? WHERE id = ?`).run(title, id);
  }

  updateTeamEmblem(id: string, emblemUrl: string): void {
    this.db.prepare(`UPDATE teams SET emblem_url = ? WHERE id = ?`).run(emblemUrl, id);
  }

  updateTeamCapitan(id: string, capitanId: number): void {
    this.db.prepare(`UPDATE teams SET capitan_id = ? WHERE id = ?`).run(capitanId, id);
  }

  updateTeamRatPlayer(id: string, ratPlayerId: number): void {
    this.db.prepare(`UPDATE teams SET rat_player_id = ? WHERE id = ?`).run(ratPlayerId, id);
  }

  // Team Players
  updateTeamPlayerKickStatus(teamId: string, playerId: number, isKicked: boolean): void {
    this.db.prepare(`UPDATE team_players SET is_kicked = ? WHERE team_id = ? AND player_id = ?`)
        .run(isKicked, teamId, playerId);
  }

  // Series
  updateSeriesStage(id: number, stageType: string): void {
    this.db.prepare(`UPDATE series SET stage_type = ? WHERE id = ?`).run(stageType, id);
  }

  // Tours
  updateTourType(id: number, type: string): void {
    this.db.prepare(`UPDATE tours SET type = ? WHERE id = ?`).run(type, id);
  }

  // Viewers
  updateViewerNickname(id: number, nickname: string): void {
    this.db.prepare(`UPDATE viewers SET nickname = ? WHERE id = ?`).run(nickname, id);
  }

  // Viewer Voting
  updateViewerSeriaVote(viewerId: number, seriaId: number, votedNicknames: string): void {
    this.db.prepare(`
      UPDATE viewer_seria_voting
      SET voted_player_nicknames = ?
      WHERE viewer_id = ? AND seria_id = ?
    `).run(votedNicknames, viewerId, seriaId);
  }

  updateViewerTourVote(viewerId: number, tourId: number, votedNicknames: string): void {
    this.db.prepare(`
      UPDATE viewer_tour_voting
      SET voted_player_nicknames = ?
      WHERE viewer_id = ? AND tour_id = ?
    `).run(votedNicknames, viewerId, tourId);
  }

  // ======================================================================================================
  // ==== DELETE A ROW FROM THE TABLE ====================================================================
  // ======================================================================================================

  // Users
  deleteUser(id: number): void {
    this.db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  }

  // Players
  deletePlayer(id: number): void {
    this.db.prepare(`DELETE FROM players WHERE id = ?`).run(id);
  }

  // Player Scores
  deletePlayerScore(id: number): void {
    this.db.prepare(`DELETE FROM player_scores WHERE id = ?`).run(id);
  }

  // Games
  deleteGame(id: number): void {
    this.db.prepare(`DELETE FROM games WHERE id = ?`).run(id);
  }

  // Teams
  deleteTeam(id: string): void {
    this.db.prepare(`DELETE FROM teams WHERE id = ?`).run(id);
  }

  // Team Players (по составу)
  deleteTeamPlayer(teamId: string, playerId: number): void {
    this.db.prepare(`DELETE FROM team_players WHERE team_id = ? AND player_id = ?`).run(teamId, playerId);
  }

  // Series
  deleteSeries(id: number): void {
    this.db.prepare(`DELETE FROM series WHERE id = ?`).run(id);
  }

  deleteSeriesGame(seriesId: number, gameId: number): void {
    this.db.prepare(`DELETE FROM series_games WHERE series_id = ? AND game_id = ?`).run(seriesId, gameId);
  }

  // Tours
  deleteTour(id: number): void {
    this.db.prepare(`DELETE FROM tours WHERE id = ?`).run(id);
  }

  deleteTourSeries(tourId: number, seriesId: number): void {
    this.db.prepare(`DELETE FROM tour_series WHERE tour_id = ? AND series_id = ?`).run(tourId, seriesId);
  }

  // Viewers
  deleteViewer(id: number): void {
    this.db.prepare(`DELETE FROM viewers WHERE id = ?`).run(id);
  }

  deleteViewerSeriaVote(viewerId: number, seriaId: number): void {
    this.db.prepare(`DELETE FROM viewer_seria_voting WHERE viewer_id = ? AND seria_id = ?`).run(viewerId, seriaId);
  }

  deleteViewerTourVote(viewerId: number, tourId: number): void {
    this.db.prepare(`DELETE FROM viewer_tour_voting WHERE viewer_id = ? AND tour_id = ?`).run(viewerId, tourId);
  }
}
