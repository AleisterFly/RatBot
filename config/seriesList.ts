import { List } from 'immutable';
import {Seria} from "../models/player/series";
import {StageType} from "../models/player/stageType"; // убедись, что установлен immutable.js

export const seriesList: List<Seria> = List<Seria>([
    new Seria(1, '17-07', StageType.SHOW_MATCH, List(), List(), true),
    new Seria(2, '23-07', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(3, '24-07', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(4, '30-07', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(5, '31-07', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(6, '07-08', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(7, '14-08', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(8, '15-08', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(9, '28-08', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(10, '29-08', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(11, '04-09', StageType.FINAL, List(), List(), false),
    new Seria(12, '05-09', StageType.FINAL, List(), List(), false),
    new Seria(13, '06-09', StageType.FINAL, List(), List(), false),
]);
