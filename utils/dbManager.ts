import type {Database as DatabaseType} from 'better-sqlite3';
import Database from 'better-sqlite3';
import * as path from 'path';
import {CREATE_TABLES_QUERY} from "../config/dbQueries"
import {User} from "../models/user";
import {UserType} from "../models/userType";
import {Player} from "../models/player/player";
import {List} from "immutable";
import {Viewer} from "../models/viewer";

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
    addUser(
        nickname: string,
        telegramName: string,
        chatId: number,
        userType: UserType = UserType.Default
    ): void {
        this.db.prepare(`
            INSERT INTO users (nickname, telegram_name, chat_id, user_type)
            VALUES (?, ?, ?, ?)
        `).run(nickname, telegramName, chatId, userType);
    }

    addPlayer(
        nickname: string,
        teamName: string,
        gameScores: number,
        ratScores: number,
        penalties: List<number>,
        isRat: boolean,
        regNumber: number
    ): void {
        const penaltiesStr = JSON.stringify(penalties.toArray());
        this.db.prepare(`
            INSERT INTO players (nickname, team_name, game_scores, rat_scores, penalties, is_rat, reg_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(nickname, teamName, gameScores, ratScores, penaltiesStr, isRat ? 1 : 0, regNumber);
    }


    addPlayerScore(total: number, plus: number, minus: number, best: number, ci: number, roleType: string): void {
        this.db.prepare(`
            INSERT INTO player_scores (total_score, plus_extra_points, minus_extra_points, best_move_points, ci_points,
                                       role_type)
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

    addViewer(viewer: Viewer): void {
        this.db.prepare(`
            INSERT INTO viewers (nickname, telegram_name, first_name, last_name, chat_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(viewer.nickname, viewer.telegramName, viewer.firstName, viewer.lastName, viewer.chatId);
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
    getUserByChatId(chatId: number): User | undefined {
        const row = this.db.prepare(`SELECT *
                                     FROM users
                                     WHERE chat_id = ?`).get(chatId) as {
            nickname: string;
            telegram_name: string;
            chat_id: number;
            user_type: UserType;
        } | undefined;

        if (!row) return undefined;

        return new User(row.nickname, row.telegram_name, row.chat_id, row.user_type);
    }

    getUserByNickname(nickname: string, userType: UserType = UserType.All): User | undefined {
        const row = userType === UserType.All
            ? this.db.prepare(`SELECT *
                               FROM users
                               WHERE nickname = ?`).get(nickname) as {
                nickname: string;
                telegram_name: string;
                chat_id: number;
                user_type: UserType;
            }
            : this.db.prepare(`SELECT *
                               FROM users
                               WHERE nickname = ?
                                 AND user_type = ?`).get(nickname, userType) as {
                nickname: string;
                telegram_name: string;
                chat_id: number;
                user_type: UserType;
            };
        if (!row) return undefined;
        return new User(row.nickname, row.telegram_name, row.chat_id, row.user_type);
    }


    // Players
    getPlayerByNickname(nickname: string): Player | undefined {
        const row = this.db.prepare(`
            SELECT *
            FROM players
            WHERE nickname = ?
        `).get(nickname) as {
            nickname: string;
            team_name: string;
            game_scores: number;
            rat_scores: number;
            penalties: string; // хранится как JSON
            is_rat: number;
            reg_number: number;
        };

        if (!row) return undefined;

        return new Player(
            row.nickname,
            row.team_name,
            row.game_scores,
            row.rat_scores,
            List<number>(JSON.parse(row.penalties)),
            !!row.is_rat,
            row.reg_number
        );
    }


    getPlayersByTeam(teamName: string) {
        return this.db.prepare(`SELECT *
                                FROM players
                                WHERE team_name = ?`).all(teamName);
    }

    // Player Scores
    getPlayerScoresByRole(roleType: string) {
        return this.db.prepare(`SELECT *
                                FROM player_scores
                                WHERE role_type = ?`).all(roleType);
    }

    // Games
    getGamesByPlayer(playerId: number) {
        return this.db.prepare(`SELECT *
                                FROM games
                                WHERE player_id = ?`).all(playerId);
    }

    getGamesByResult(result: string) {
        return this.db.prepare(`SELECT *
                                FROM games
                                WHERE game_result = ?`).all(result);
    }

    // Teams
    getTeamByTitle(title: string) {
        return this.db.prepare(`SELECT *
                                FROM teams
                                WHERE title = ?`).get(title);
    }

    getTeamPlayers(teamId: string) {
        return this.db.prepare(`SELECT p.*
                                FROM team_players tp
                                         JOIN players p ON tp.player_id = p.id
                                WHERE tp.team_id = ?`).all(teamId);
    }

    // Series
    getSeriesByStage(stageType: string) {
        return this.db.prepare(`SELECT *
                                FROM series
                                WHERE stage_type = ?`).all(stageType);
    }

    // Tours
    getToursByType(type: string) {
        return this.db.prepare(`SELECT *
                                FROM tours
                                WHERE type = ?`).all(type);
    }

    // Viewers
    getViewerByChatId(chatId: number): Viewer | undefined {
        const row = this.db.prepare(`SELECT * FROM viewers WHERE chat_id = ?`).get(chatId) as {
            nickname: string;
            telegram_name: string;
            first_name: string;
            last_name: string;
            chat_id: number;
        } | undefined;

        if (!row) return undefined;

        return new Viewer(row.nickname, row.chat_id, row.telegram_name, row.first_name, row.last_name);
    }

    getViewerByNickname(nickname: string): Viewer | undefined {
        const row = this.db.prepare(`SELECT * FROM viewers WHERE nickname = ?`).get(nickname) as {
            nickname: string;
            telegram_name: string;
            first_name: string;
            last_name: string;
            chat_id: number;
        } | undefined;

        if (!row) return undefined;

        return new Viewer(row.nickname, row.chat_id, row.telegram_name, row.first_name, row.last_name);
    }


    // Get All Users
    getAllUsers(userType: string = 'all'): List<User> {
        const rows = userType === 'all'
            ? this.db.prepare(`SELECT *
                               FROM users`).all() as {
                nickname: string;
                telegram_name: string;
                chat_id: number;
                user_type: UserType;
            }[]
            : this.db.prepare(`SELECT *
                               FROM users
                               WHERE user_type = ?`).all(userType) as {
                nickname: string;
                telegram_name: string;
                chat_id: number;
                user_type: UserType;
            }[];

        return List(rows.map(row => {
            return new User(row.nickname, row.telegram_name, row.chat_id, row.user_type);
        }));
    }

    // Get All Users
    getAllPlayers(): List<Player> {
        const rows = this.db.prepare(`SELECT *
                                      FROM players`).all() as {
            id: number;
            nickname: string;
            team_name: string;
            game_scores: number;
            rat_scores: number;
            penalties: string;
            is_rat: boolean;
            reg_number: number;
        }[];
        return List(rows.map(row => {
            return new Player(row.nickname, row.team_name, row.game_scores, row.rat_scores, List(JSON.parse(row.penalties)), row.is_rat, row.reg_number);
        }));
    }

    getAllNicknames(userType: UserType = UserType.All): List<string> {
        const rows = userType === 'all'
            ? this.db.prepare(`SELECT nickname
                               FROM users`).all() as {
                nickname: string;
            }[] : this.db.prepare(`SELECT nickname
                                   FROM users
                                   WHERE user_type = ?`).all(userType) as {
                nickname: string;
            }[];
        return List(rows.map(row => {
            return row.nickname;
        }));
    }

    getAllViewers(): List<Viewer> {
        const rows = this.db.prepare(`SELECT * FROM viewers`).all() as {
            nickname: string;
            telegram_name: string;
            first_name: string;
            last_name: string;
            chat_id: number;
        }[];

        return List(rows.map(row =>
            new Viewer(row.nickname, row.chat_id, row.telegram_name, row.first_name, row.last_name)
        ));
    }

    // ======================================================================================================
    // ==== UPDATE A ROW IN THE TABLE ======================================================================
    // ======================================================================================================

    // Users
    updateUser(user: User): void {
        this.db.prepare(`UPDATE users
                         SET telegram_name = ?,
                             user_type     = ?,
                             chat_id       = ?
                         WHERE nickname = ?`).run(user.telegramName, user.userType, user.chatId, user.nickname);
    }

    // Player
    updatePlayer(player: Player): void {
        this.db.prepare(
            `UPDATE players
             SET team_name   = ?,
                 game_scores = ?,
                 rat_scores  = ?,
                 penalties   = ?,
                 is_rat      = ?,
                 reg_number  = ?
             WHERE nickname = ?`
        ).run(
            player.teamName,
            player.gameScores,
            player.ratScores,
            JSON.stringify(player.penalties.toArray()),
            player.isRat ? 1 : 0,
            player.regNumber,
            player.nickname
        );
    }

    updateViewer(viewer: Viewer): void {
        this.db.prepare(`UPDATE viewers
                     SET telegram_name = ?,
                         first_name = ?,
                         last_name = ?,
                         chat_id = ?
                     WHERE nickname = ?`)
            .run(viewer.telegramName, viewer.firstName, viewer.lastName, viewer.chatId, viewer.nickname);
    }

    // Games
    updateGameResult(id: number, result: string): void {
        this.db.prepare(`UPDATE games
                         SET game_result = ?
                         WHERE id = ?`).run(result, id);
    }

    // Teams
    updateTeamScore(id: string, score: number, bonus: number, total: number): void {
        this.db.prepare(`
            UPDATE teams
            SET score       = ?,
                bonus_score = ?,
                total_score = ?
            WHERE id = ?
        `).run(score, bonus, total, id);
    }

    updateTeamTitle(id: string, title: string): void {
        this.db.prepare(`UPDATE teams
                         SET title = ?
                         WHERE id = ?`).run(title, id);
    }

    updateTeamEmblem(id: string, emblemUrl: string): void {
        this.db.prepare(`UPDATE teams
                         SET emblem_url = ?
                         WHERE id = ?`).run(emblemUrl, id);
    }

    updateTeamCapitan(id: string, capitanId: number): void {
        this.db.prepare(`UPDATE teams
                         SET capitan_id = ?
                         WHERE id = ?`).run(capitanId, id);
    }

    updateTeamRatPlayer(id: string, ratPlayerId: number): void {
        this.db.prepare(`UPDATE teams
                         SET rat_player_id = ?
                         WHERE id = ?`).run(ratPlayerId, id);
    }

    // Team Players
    updateTeamPlayerKickStatus(teamId: string, playerId: number, isKicked: boolean): void {
        this.db.prepare(`UPDATE team_players
                         SET is_kicked = ?
                         WHERE team_id = ?
                           AND player_id = ?`)
            .run(isKicked, teamId, playerId);
    }

    // Series
    updateSeriesStage(id: number, stageType: string): void {
        this.db.prepare(`UPDATE series
                         SET stage_type = ?
                         WHERE id = ?`).run(stageType, id);
    }

    // Tours
    updateTourType(id: number, type: string): void {
        this.db.prepare(`UPDATE tours
                         SET type = ?
                         WHERE id = ?`).run(type, id);
    }

    // Viewers
    updateViewerNickname(id: number, nickname: string): void {
        this.db.prepare(`UPDATE viewers
                         SET nickname = ?
                         WHERE id = ?`).run(nickname, id);
    }

    // Viewer Voting
    updateViewerSeriaVote(viewerId: number, seriaId: number, votedNicknames: string): void {
        this.db.prepare(`
            UPDATE viewer_seria_voting
            SET voted_player_nicknames = ?
            WHERE viewer_id = ?
              AND seria_id = ?
        `).run(votedNicknames, viewerId, seriaId);
    }

    updateViewerTourVote(viewerId: number, tourId: number, votedNicknames: string): void {
        this.db.prepare(`
            UPDATE viewer_tour_voting
            SET voted_player_nicknames = ?
            WHERE viewer_id = ?
              AND tour_id = ?
        `).run(votedNicknames, viewerId, tourId);
    }

    // User Type
    updateUserType(id: number, userType: string): void {
        this.db.prepare(`UPDATE users
                         SET user_type = ?
                         WHERE id = ?`).run(userType, id);
    }

    // Player Reg Number
    updatePlayerRegNumber(id: number, regNumber: number): void {
        this.db.prepare(`UPDATE players
                         SET reg_number = ?
                         WHERE id = ?`).run(regNumber, id);
    }

    // ======================================================================================================
    // ==== DELETE A ROW FROM THE TABLE ====================================================================
    // ======================================================================================================

    // Users
    deleteUserById(id: number): void {
        this.db.prepare(`DELETE
                         FROM users
                         WHERE id = ?`).run(id);
    }

    deleteUserByNickname(nickname: string): void {
        this.db.prepare(`DELETE
                         FROM users
                         WHERE nickname = ?`).run(nickname);
    }

    // Players
    deletePlayer(id: number): void {
        this.db.prepare(`DELETE
                         FROM players
                         WHERE id = ?`).run(id);
    }

    // Player Scores
    deletePlayerScore(id: number): void {
        this.db.prepare(`DELETE
                         FROM player_scores
                         WHERE id = ?`).run(id);
    }

    // Games
    deleteGame(id: number): void {
        this.db.prepare(`DELETE
                         FROM games
                         WHERE id = ?`).run(id);
    }

    // Teams
    deleteTeam(id: string): void {
        this.db.prepare(`DELETE
                         FROM teams
                         WHERE id = ?`).run(id);
    }

    // Team Players (по составу)
    deleteTeamPlayer(teamId: string, playerId: number): void {
        this.db.prepare(`DELETE
                         FROM team_players
                         WHERE team_id = ?
                           AND player_id = ?`).run(teamId, playerId);
    }

    // Series
    deleteSeries(id: number): void {
        this.db.prepare(`DELETE
                         FROM series
                         WHERE id = ?`).run(id);
    }

    deleteSeriesGame(seriesId: number, gameId: number): void {
        this.db.prepare(`DELETE
                         FROM series_games
                         WHERE series_id = ?
                           AND game_id = ?`).run(seriesId, gameId);
    }

    // Tours
    deleteTour(id: number): void {
        this.db.prepare(`DELETE
                         FROM tours
                         WHERE id = ?`).run(id);
    }

    deleteTourSeries(tourId: number, seriesId: number): void {
        this.db.prepare(`DELETE
                         FROM tour_series
                         WHERE tour_id = ?
                           AND series_id = ?`).run(tourId, seriesId);
    }

    // Viewers
    deleteViewerByNickname(nickname: string): void {
        this.db.prepare(`DELETE FROM viewers WHERE nickname = ?`).run(nickname);
    }

    deleteViewerByChatId(chatId: number): void {
        this.db.prepare(`DELETE FROM viewers WHERE chat_id = ?`).run(chatId);
    }
}
