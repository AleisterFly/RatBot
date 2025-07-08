import { Map, List } from 'immutable';
import {StageType} from "./player/stageType";

export class Viewer {
    constructor(
        public nickname: string,
        public seriaVoting: Map<string, List<string>>,
        public seriaScores: Map<string, number>,
        public tourVoting: Map<StageType, List<string>>,
        public tourScores: Map<StageType, number>,
        public totalScores: number

    ) {}


    static createViewer(nickname: string): Viewer {
        return new Viewer(
            nickname,
            Map<string, List<string>>(),
            Map<string, number>(),
            Map<StageType, List<string>>(),
            Map<StageType, number>(),
            0
        );
    }
}