import {phaseDB, teamDB} from "../di/ratProvider";
import {Phase} from "../models/admin/phase";

export class DBPhaseRepository {
    constructor() {
    }

    getPhase(): Phase | undefined {
        return phaseDB.getPhase();
    }

    setPhase(phase: Phase): void {
        phaseDB.setPhase(phase);
    }
}