import {Seria} from '../../models/player/series'
import {StageType} from '../../models/player/stageType'
import {List} from 'immutable'

export const seriesMap = new Map<number, Seria>([
    [1, new Seria(1, '2025-07-03', StageType.SHOW_MATCH, List(), List(), true)],
    [2, new Seria(2, '2025-07-04', StageType.FIRST_TOUR, List(), List(), false)],
    [3, new Seria(3, '2025-07-05', StageType.FIRST_TOUR, List(), List(), false)],
    [4, new Seria(4, '2025-07-06', StageType.FIRST_TOUR, List(), List(), false)],
    [5, new Seria(5, '2025-07-07', StageType.FIRST_TOUR, List(), List(), false)],
    [6, new Seria(6, '2025-07-08', StageType.FIRST_TOUR, List(), List(), false)],
    [7, new Seria(7, '2025-07-09', StageType.SECOND_TOUR, List(), List(), false)],
    [8, new Seria(8, '2025-07-10', StageType.SECOND_TOUR, List(), List(), false)],
    [9, new Seria(9, '2025-07-11', StageType.SECOND_TOUR, List(), List(), false)],
    [10, new Seria(10, '2025-07-12', StageType.SECOND_TOUR, List(), List(), false)],
    [11, new Seria(11, '2025-07-13', StageType.FINAL, List(), List(), false)],
    [12, new Seria(12, '2025-07-14', StageType.FINAL, List(), List(), false)],
    [13, new Seria(13, '2025-07-15', StageType.FINAL, List(), List(), false)],
])