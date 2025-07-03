import {List} from "immutable";
import {Seria} from "../../models/player/series";
import {StageType} from "../../models/player/stageType";

export interface ISeriesRepository {
    saveSeries(series: List<Seria>): void;
    getSeries(): List<Seria>;
    getSeries(stage: StageType): List<Seria> | undefined;
    getSeria(date: String): Seria | undefined;
    getCurrentSeria(): Seria | undefined;
    setCurrentSeria(date: String): void;
    registerNickname(nickname: string): void;
    getCurrentTourSeries():  List<Seria> | undefined
}