import {List} from "immutable";
import {Seria} from "../../models/player/series";
import {StageType} from "../../models/player/stageType";

export interface ISeriesRepository {
    saveSeries(series: List<Seria>): void;
    getSeries(): List<Seria>;
    getSeria(stage: StageType): Seria | undefined;
    getCurrentSeria(): Seria | undefined;
    setCurrentSeria(date: String): void;
    registerNickname(nickname: string): void;
}