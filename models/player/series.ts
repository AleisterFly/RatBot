import { Game } from './game'
import { StageType } from './stageType'
import {List} from "immutable";

export class Series {
    constructor(
        public id: number,
        public stageType: StageType,
        public games: List<Game>,
    ) {}
}