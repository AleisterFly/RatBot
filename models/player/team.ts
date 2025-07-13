import {List} from "immutable";
import {StageType} from "./stageType";

export class Team {
    id: number;
    title: string;
    emblemUrl: string;
    players: List<string>;
    kickedPlayers: Map<StageType, string>;
    score: number;
    bonusScore: number;
    totalScore: number;
    ratPlayer: string;
    captain: string;

    constructor(
        id: number = -1,
        title: string = "",
        emblemUrl: string = "",
        players: List<string> = List(),
        kickedPlayers = new Map(),
        score: number = 0,
        bonusScore: number = 0,
        totalScore: number = 0,
        ratPlayer: string = "",
        captain: string = "",
    ) {
        this.id = id;
        this.title = title;
        this.emblemUrl = emblemUrl;
        this.players = players;
        this.kickedPlayers = kickedPlayers;
        this.score = score;
        this.bonusScore = bonusScore;
        this.totalScore = totalScore;
        this.ratPlayer = ratPlayer;
        this.captain = captain;
    }
}