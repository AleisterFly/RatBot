import {List} from "immutable";

export class Viewer {
    nickname: string;
    seriaVoting: Map<string, List<string>>;
    tourVoting: Map<string, List<string>>;

    constructor(nickname = "") {
        this.nickname = nickname;
        this.seriaVoting = new Map<string, List<string>>();
        this.tourVoting = new Map<string, List<string>>();
    }

    static createViewer(nickname: string): Viewer {
        return new Viewer(nickname);
    }
}