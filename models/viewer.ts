import { Map, List } from 'immutable';

export class Viewer {
    constructor(
        public nickname: string,
        public seriaVoting: Map<string, List<string>>,
        public tourVoting: Map<string, List<string>>
    ) {}


    static createViewer(nickname: string): Viewer {
        return new Viewer(nickname, Map<string, List<string>>(), Map<string, List<string>>());
    }
}