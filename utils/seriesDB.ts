import Database from "better-sqlite3";
import type { Database as DB } from "better-sqlite3";
import { List } from "immutable";
import { Seria } from "../models/player/series";
import { StageType } from "../models/player/stageType";
import { Viewer } from "../models/viewer";

export class SeriesDB {
    private db: DB;

    constructor() {
        this.db = new Database("series.db");
    }

    // ======================================================================================================
    // ==== CREATE TABLES ===================================================================================
    // ======================================================================================================
    createTables(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS series (
                                                  id INTEGER PRIMARY KEY,
                                                  date TEXT,
                                                  stageType TEXT,
                                                  isCurrent BOOLEAN
            );
            CREATE TABLE IF NOT EXISTS games (
                                                 id INTEGER PRIMARY KEY,
                                                 seriaId INTEGER,
                                                 FOREIGN KEY(seriaId) REFERENCES series(id)
                );
            CREATE TABLE IF NOT EXISTS nicknames (
                                                     seriaId INTEGER,
                                                     nickname TEXT,
                                                     FOREIGN KEY(seriaId) REFERENCES series(id),
                UNIQUE(seriaId, nickname)
                );
            CREATE TABLE IF NOT EXISTS viewers (
                                                   chat_id INTEGER PRIMARY KEY,
                                                   nickname TEXT NOT NULL,
                                                   telegram_name TEXT,
                                                   first_name TEXT,
                                                   last_name TEXT
            );
        `);
    }

    saveSeries(series: List<Seria>): void {
        const stmt = this.db.prepare(
            "INSERT INTO series (id, date, stageType, isCurrent) VALUES (?, ?, ?, ?)",
        );
        const nickStmt = this.db.prepare(
            "INSERT OR IGNORE INTO nicknames (seriaId, nickname) VALUES (?, ?)",
        );

        series.forEach((seria) => {
            stmt.run(
                seria.id,
                seria.date,
                seria.stageType,
                false,
            );
            seria.regNicknames.forEach((nick) => {
                nickStmt.run(
                    seria.id,
                    nick,
                );
            });
        });
    }

    getSeries(): List<Seria> {
        const rows = this.db.prepare(
            "SELECT * FROM series",
        ).all() as {
            id: number,
            date: string,
            stageType: string,
            isCurrent: number,
        }[];

        return List(rows.map((row) => {
            const nicknames = this.db.prepare(
                "SELECT nickname FROM nicknames WHERE seriaId = ?",
            ).all(row.id) as { nickname: string }[];

            return new Seria(
                row.id,
                row.date,
                row.stageType as StageType,
                List(), // games not loaded
                List(nicknames.map((n) => n.nickname)),
                row.isCurrent === 1,
            );
        }));
    }

    getSeria(stage: StageType): Seria | undefined {
        const row = this.db.prepare(
            "SELECT * FROM series WHERE stageType = ?",
        ).get(stage) as {
            id: number,
            date: string,
            stageType: string,
            isCurrent: number,
        } | undefined;

        if (!row) return undefined;

        const nicknames = this.db.prepare(
            "SELECT nickname FROM nicknames WHERE seriaId = ?",
        ).all(row.id) as { nickname: string }[];

        return new Seria(
            row.id,
            row.date,
            row.stageType as StageType,
            List(),
            List(nicknames.map((n) => n.nickname)),
            row.isCurrent === 1,
        );
    }

    getCurrentSeria(): Seria | undefined {
        const row = this.db.prepare(
            "SELECT * FROM series WHERE isCurrent = 1",
        ).get() as {
            id: number,
            date: string,
            stageType: string,
            isCurrent: number,
        } | undefined;

        if (!row) return undefined;

        const nicknames = this.db.prepare(
            "SELECT nickname FROM nicknames WHERE seriaId = ?",
        ).all(row.id) as { nickname: string }[];

        return new Seria(
            row.id,
            row.date,
            row.stageType as StageType,
            List(),
            List(nicknames.map((n) => n.nickname)),
            row.isCurrent === 1,
        );
    }

    setCurrentSeria(date: string): void {
        this.db.prepare(
            "UPDATE series SET isCurrent = 0",
        ).run();

        this.db.prepare(
            "UPDATE series SET isCurrent = 1 WHERE date = ?",
        ).run(date);
    }

    registerNickname(nickname: string): void {
        const currentSeria = this.db.prepare(
            "SELECT id FROM series WHERE isCurrent = 1",
        ).get() as { id: number } | undefined;

        if (currentSeria) {
            this.db.prepare(
                "INSERT OR IGNORE INTO nicknames (seriaId, nickname) VALUES (?, ?)",
            ).run(
                currentSeria.id,
                nickname,
            );
        }
    }

    getViewerByChatId(chatId: number): Viewer | undefined {
        const row = this.db.prepare(
            `SELECT * FROM viewers WHERE chat_id = ?`,
        ).get(chatId) as {
            nickname: string,
            telegram_name: string,
            first_name: string,
            last_name: string,
            chat_id: number,
        } | undefined;

        if (!row) return undefined;

        return new Viewer(
            row.nickname,
            row.chat_id,
            row.telegram_name,
            row.first_name,
            row.last_name,
        );
    }
}
