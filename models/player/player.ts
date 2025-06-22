import {List} from "immutable";

export class Player {
    nickname: string;
    teamName: string;
    gameScores: number;
    ratScores: number;
    penalties: List<number>;
    isRat: boolean;

    constructor(
        nickname = "",
        teamName = "",
        gameScores = 0,
        ratScores = 0,
        penalties: List<number> = List<number>(),
        isRat = false
    ) {
        this.nickname = nickname;
        this.teamName = teamName;
        this.gameScores = gameScores;
        this.ratScores = ratScores;
        this.penalties = penalties;
        this.isRat = isRat;
    }

    static createPlayer(nickname: string): Player {
        return new Player(nickname);
    }
}
