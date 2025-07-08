import Database, {type Database as DatabaseType} from 'better-sqlite3';
import path from "path";
import {Phase} from "../models/admin/phase";

export class PhaseDB {
    private db: DatabaseType;

    constructor(filePath: string = 'db.sqlite') {
        this.db = new Database(path.resolve(__dirname, filePath));
    }

    createTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS phase
            (
                id
                INTEGER
                PRIMARY
                KEY,
                phase
                TEXT
                UNIQUE
            )
        `);

        const stmt = this.db.prepare(
            "INSERT OR IGNORE INTO phase (id, phase) VALUES (?, ?)",
        );
        stmt.run(
            0,
            Phase.DEFAULT
        );
    }

    setPhase(phase: Phase): void {
        this.db.prepare('UPDATE phase SET phase = ?')
            .run(phase);
    }

    getPhase(): Phase | undefined {
        const phaseRow = this.db.prepare('SELECT * FROM phase').get();

        if (!phaseRow || typeof phaseRow !== 'object' || !('phase' in phaseRow)) {
            return undefined;
        }

        const phaseStr = (phaseRow as { phase: string }).phase;

        if (Object.values(Phase).includes(phaseStr as Phase)) {
            return phaseStr as Phase;
        }

        return undefined;
    }
}