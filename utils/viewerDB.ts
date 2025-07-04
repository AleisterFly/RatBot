import {List, Map} from "immutable";
import Database, {type Database as DatabaseType} from 'better-sqlite3';
import {Viewer} from "../models/viewer";
import path from "path";

export class ViewerDB {
    private db: DatabaseType;

    constructor(filePath: string = 'db.sqlite') {
        this.db = new Database(path.resolve(__dirname, filePath));
    }

    public createTables(): void {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS viewers
            (
                nickname
                TEXT
                PRIMARY
                KEY,
                seriaVoting
                TEXT,
                tourVoting
                TEXT
            )
        `);
    }

    public addViewer(nickname: string): void {
        const stmt = this.db.prepare('INSERT INTO viewers (nickname, seriaVoting, tourVoting) VALUES (?, ?, ?)');
        stmt.run(nickname, JSON.stringify({}), JSON.stringify({}));
    }

    public updateViewerVoting(nickname: string, seriaVoting: Map<string, List<string>>, tourVoting: Map<string, List<string>>): void {
        const stmt = this.db.prepare('UPDATE viewers SET seriaVoting = ?, tourVoting = ? WHERE nickname = ?');
        stmt.run(JSON.stringify(seriaVoting.toJS()), JSON.stringify(tourVoting.toJS()), nickname);
    }

    public getViewer(nickname: string): Viewer
        | undefined {
        const stmt = this.db.prepare('SELECT * FROM viewers WHERE nickname = ?');
        const result = stmt.get(nickname) as {
            nickname: string,
            seriaVoting: string,
            tourVoting: string,
        } | undefined;
        if (result) {

            return this.parseViewer(result);
        }
    }

    public getAllViewers(): List<Viewer> {
        const rows = this.db.prepare('SELECT * FROM viewers').all() as {
            nickname: string,
            seriaVoting: string,
            tourVoting: string,
        }[];

        const viewers = rows.map(result => this.parseViewer(result));
        return List(viewers);
    }

    private parseViewer(result: any): Viewer {
        const seriaObj = JSON.parse(result.seriaVoting) as Record<string, string[]>;
        const tourObj = JSON.parse(result.tourVoting) as Record<string, string[]>;

        const seriaMap = Map(Object.entries(seriaObj).map(
            ([key, arr]) => [key, List(arr)]
        ));

        const tourMap = Map(Object.entries(tourObj).map(
            ([key, arr]) => [key, List(arr)]
        ));

        return new Viewer(
            result.nickname,
            seriaMap,
            tourMap
        );
    }
}