import Database, {type Database as DatabaseType} from "better-sqlite3";
import path from "path";

export class DB {
    db: DatabaseType;

    constructor(filePath: string = 'db.sqlite') {
        this.db = new Database(path.resolve(__dirname, filePath));
    }
    closeDB() {
        this.db.close();
    }

    getDB(): DatabaseType {
        return this.db;
    }
}