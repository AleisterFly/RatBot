import { List } from 'immutable';
import {Seria} from "../../models/player/series";
import {StageType} from "../../models/player/stageType"; // убедись, что установлен immutable.js

export const seriesList: List<Seria> = List<Seria>([
    new Seria(1, '2025-07-03', StageType.SHOW_MATCH, List(), List(), true),
    new Seria(2, '2025-07-04', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(3, '2025-07-05', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(4, '2025-07-06', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(5, '2025-07-07', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(6, '2025-07-08', StageType.FIRST_TOUR, List(), List(), false),
    new Seria(7, '2025-07-09', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(8, '2025-07-10', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(9, '2025-07-11', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(10, '2025-07-12', StageType.SECOND_TOUR, List(), List(), false),
    new Seria(11, '2025-07-13', StageType.FINAL, List(), List(), false),
    new Seria(12, '2025-07-14', StageType.FINAL, List(), List(), false),
    new Seria(13, '2025-07-15', StageType.FINAL, List(), List(), false),
]);
