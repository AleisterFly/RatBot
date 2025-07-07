import {List} from "immutable";
import {StageType} from "./stageType";

export class Player {
    nickname: string;
    teamName: string;
    gameScores: number;
    ratScores: number;
    penalties: List<number>;
    isRat: boolean;
    regNumber: number;
    votings: Map<StageType, string>;
    ratGames: Map<StageType, List<number>>;
    doneTasks: Map<StageType, number>;

    constructor(
        nickname = "",
        teamName = "",
        gameScores = 0,
        ratScores = 0,
        penalties: List<number> = List<number>(),
        isRat = false,
        regNumber = -1,
        votings = new Map(),
        ratGames = new Map(),
        doneTasks = new Map(),
    ) {
        this.nickname = nickname;
        this.teamName = teamName;
        this.gameScores = gameScores;
        this.ratScores = ratScores;
        this.penalties = penalties;
        this.isRat = isRat;
        this.regNumber = regNumber;
        this.votings = votings;
        this.ratGames = ratGames;
        this.doneTasks = doneTasks;
    }

    static createPlayer(nickname: string): Player {
        return new Player(nickname);
    }
}
