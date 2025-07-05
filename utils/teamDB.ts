import Database, {type Database as DatabaseType} from 'better-sqlite3';
import {List} from "immutable";
import {Team} from "../models/player/team";
import path from "path";

export class TeamDB {
    private db: DatabaseType;

    constructor(filePath: string = 'db.sqlite') {
        this.db = new Database(path.resolve(__dirname, filePath));
    }

    createTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS teams
            (
                id                INTEGER                PRIMARY                KEY,
                title                TEXT                UNIQUE,
                emblemUrl                TEXT,
                players                TEXT,
                kickedPlayers                TEXT,
                score                INTEGER,
                bonusScore                INTEGER,
                totalScore                INTEGER,
                ratPlayer                TEXT,
                capitan                TEXT
            )
        `);
    }

    getTeams(): List<Team> {
        const teams = this.db.prepare('SELECT * FROM teams').all() as {
            id: number,
            title: string,
            emblemUrl: string,
            players: string,
            kickedPlayers: string,
            score: number,
            bonusScore: number,
            totalScore: number,
            ratPlayer: string,
            capitan: string,
        }[];
        return List(teams.map(t => new Team(
            t.id,
            t.title,
            t.emblemUrl,
            List(JSON.parse(t.players)),
            List(JSON.parse(t.kickedPlayers)),
            t.score,
            t.bonusScore,
            t.totalScore,
            t.ratPlayer,
            t.capitan
        )));
    }

    getTeam(title: string): Team | undefined {
        const team = this.db.prepare('SELECT * FROM teams WHERE title = ?').get(title) as {
            id: number,
            title: string,
            emblemUrl: string,
            players: string,
            kickedPlayers: string,
            score: number,
            bonusScore: number,
            totalScore: number,
            ratPlayer: string,
            capitan: string,
        };
        if (!team) return undefined;
        return new Team(
            team.id,
            team.title,
            team.emblemUrl,
            List(JSON.parse(team.players)),
            List(JSON.parse(team.kickedPlayers)),
            team.score,
            team.bonusScore,
            team.totalScore,
            team.ratPlayer,
            team.capitan
        );
    }

    getTeamByNickname(nickname: string): Team | undefined {
        const teams = this.getTeams();
        return teams.find(team => team.players.includes(nickname)  || team.kickedPlayers.includes(nickname));
    }

    getKickedNicknames(title: string): List<string> | undefined {
        const team = this.getTeam(title);
        return team?.kickedPlayers;
    }

    getActivePlayersNicknames(title: string): List<string> | undefined {
        const team = this.getTeam(title);
        return team?.players;
    }

    addActivePlayer(title: string, playerName: string): void {
        const team = this.getTeam(title);
        if (!team) {
            throw new Error(`Команда с названием "${title}" не найдена`);
        }

        const updatedPlayers = team.players.push(playerName);
        this.setTeamActivePlayers(title, updatedPlayers);
    }

    setRatPlayer(title: string, nickname: string): void {
        this.db.prepare('UPDATE teams SET ratPlayer = ? WHERE title = ?').run(nickname, title);
    }

    setCapitan(title: string, nickname: string): void {
        this.db.prepare('UPDATE teams SET capitan = ? WHERE title = ?').run(nickname, title);
    }

    setTeamTitle(title: string, newTitle: string): void {
        this.db.prepare('UPDATE teams SET title = ? WHERE title = ?').run(newTitle, title);
    }

    setTeamEmblemUrl(title: string, emblemUrl: string): void {
        this.db.prepare('UPDATE teams SET emblemUrl = ? WHERE title = ?').run(emblemUrl, title);
    }

    setTeamScore(title: string, score: number): void {
        this.db.prepare('UPDATE teams SET score = ? WHERE title = ?').run(score, title);
    }

    setTeamBonusScore(title: string, bonusScore: number): void {
        this.db.prepare('UPDATE teams SET bonusScore = ? WHERE title = ?').run(bonusScore, title);
    }

    setTeamTotalScore(title: string, totalScore: number): void {
        this.db.prepare('UPDATE teams SET totalScore = ? WHERE title = ?').run(totalScore, title);
    }

    setTeamKickedPlayers(title: string, kickedPlayers: List<string>): void {
        this.db.prepare('UPDATE teams SET kickedPlayers = ? WHERE title = ?')
            .run(JSON.stringify(kickedPlayers.toArray()), title);
    }

    setTeamActivePlayers(title: string, activePlayers: List<string>): void {
        this.db.prepare('UPDATE teams SET players = ? WHERE title = ?')
            .run(JSON.stringify(activePlayers.toArray()), title);
    }

    saveTeam(team: Team): void {
        this.db.prepare(`
            INSERT INTO teams (id, title, emblemUrl, players, kickedPlayers, score, bonusScore, totalScore, ratPlayer,
                               capitan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            team.id,
            team.title,
            team.emblemUrl,
            JSON.stringify(team.players.toArray()),
            JSON.stringify(team.kickedPlayers.toArray()),
            team.score,
            team.bonusScore,
            team.totalScore,
            team.ratPlayer,
            team.capitan
        );
    }

    updateTeam(team: Team): void {
        this.db.prepare(`
            UPDATE teams
            SET title         = ?,
                emblemUrl     = ?,
                players       = ?,
                kickedPlayers = ?,
                score         = ?,
                bonusScore    = ?,
                totalScore    = ?,
                ratPlayer     = ?,
                capitan       = ?
            WHERE id = ?
        `).run(
            team.title,
            team.emblemUrl,
            JSON.stringify(team.players.toArray()),
            JSON.stringify(team.kickedPlayers.toArray()),
            team.score,
            team.bonusScore,
            team.totalScore,
            team.ratPlayer,
            team.capitan,
            team.id
        );
    }

    createTeam(title: string): void {
        const team = new Team(
            Date.now(),
            title,
            '',
            List(),
            List(),
            0,
            0,
            0,
            '',
            ''
        );
        this.saveTeam(team);
    }
}