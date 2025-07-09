import { List, Map } from "immutable";
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { Viewer } from "../models/viewer";
import path from "path";
import { StageType } from "../models/player/stageType";

export class ViewerDB {
    private db: DatabaseType;

    constructor(filePath: string = 'db.sqlite') {
        this.db = new Database(path.resolve(__dirname, filePath));
    }

    public createTables(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS viewers
            (
                nickname TEXT PRIMARY KEY,
                seriaVoting TEXT,
                seriaScores TEXT,
                tourVoting TEXT,
                tourScores TEXT,
                totalScores INTEGER
            )
        `);
    }

    public addViewer(nickname: string): void {
        const stmt = this.db.prepare(`
            INSERT INTO viewers 
            (nickname, seriaVoting, seriaScores, tourVoting, tourScores, totalScores) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            nickname,
            JSON.stringify({}),
            JSON.stringify({}),
            JSON.stringify({}),
            JSON.stringify({}),
            0
        );
    }

    public updateViewer(
        viewer: Viewer
    ): void {
        const stmt = this.db.prepare(`
            UPDATE viewers 
            SET seriaVoting = ?, seriaScores = ?, tourVoting = ?, tourScores = ?, totalScores = ?
            WHERE nickname = ?
        `);
        stmt.run(
            JSON.stringify(viewer.seriaVoting.toJS()),
            JSON.stringify(viewer.seriaScores.toJS()),
            JSON.stringify(viewer.tourVoting.toJS()),
            JSON.stringify(viewer.tourScores.toJS()),
            viewer.totalScores,
            viewer.nickname
        );
    }

    public getViewer(nickname: string): Viewer | undefined {
        const stmt = this.db.prepare('SELECT * FROM viewers WHERE nickname = ?');
        const result = stmt.get(nickname) as {
            nickname: string,
            seriaVoting: string,
            seriaScores: string,
            tourVoting: string,
            tourScores: string,
            totalScores: number
        } | undefined;

        if (result) {
            return this.parseViewer(result);
        }
    }

    public getAllViewers(): List<Viewer> {
        const rows = this.db.prepare('SELECT * FROM viewers').all() as {
            nickname: string,
            seriaVoting: string,
            seriaScores: string,
            tourVoting: string,
            tourScores: string,
            totalScores: number
        }[];

        const viewers = rows.map(result => this.parseViewer(result));
        return List(viewers);
    }

    private parseViewer(result: any): Viewer {
        const seriaVotingObj = JSON.parse(result.seriaVoting) as Record<string, string[]>;
        const seriaScoresObj = JSON.parse(result.seriaScores) as Record<string, number>;
        const tourVotingObj = JSON.parse(result.tourVoting) as Record<string, string[]>;
        const tourScoresObj = JSON.parse(result.tourScores) as Record<string, number>;

        const seriaVotingMap = Map(Object.entries(seriaVotingObj).map(
            ([key, arr]) => [key, List(arr)]
        ));

        const seriaScoresMap = Map(Object.entries(seriaScoresObj));

        const tourVotingMap = Map(Object.entries(tourVotingObj).map(
            ([key, arr]) => [key as StageType, List(arr)]
        ));

        const tourScoresMap = Map(Object.entries(tourScoresObj).map(
            ([key, score]) => [key as StageType, score]
        ));

        return new Viewer(
            result.nickname,
            seriaVotingMap,
            seriaScoresMap,
            tourVotingMap,
            tourScoresMap,
            result.totalScores
        );
    }
    
    

    public getAllNicknames(): List<string> {
        const rows = this.db.prepare('SELECT nickname FROM viewers').all() as { nickname: string }[];
        return List(rows.map(row => row.nickname));
    }
    
    
}
