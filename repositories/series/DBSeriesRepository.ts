import {ISeriesRepository} from "./ISeriesRepository";
import {StageType} from "../../models/player/stageType";
import {Seria} from "../../models/player/series";
import {List} from "immutable";
import {seriesDB} from "../../di/ratProvider";

export class DBSeriesRepository implements ISeriesRepository {
    constructor() {}

    getSeria(stage: StageType): Seria | undefined {
        return seriesDB.getSeria(stage);
    }

    getSeries(): List<Seria> {
        return seriesDB.getSeries();
    }

    registerNickname(nickname: string): void {
        seriesDB.registerNickname(nickname);
    }

    saveSeries(series: List<Seria>): void {
        seriesDB.saveSeries(series)
    }

    setCurrentSeria(date: string): void {
        seriesDB.setCurrentSeria(date);
    }

    getCurrentSeria(): Seria | undefined {
       return seriesDB.getCurrentSeria();
    }

    getCurrentTourSeries():  List<Seria> | undefined {
            const currentSeria = seriesDB.getCurrentSeria();
            if (!currentSeria) return undefined;
            return seriesDB.getSeriesByStage(currentSeria.stageType);
        }
}