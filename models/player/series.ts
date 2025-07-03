import { Game } from './game'
import { StageType } from './stageType'
import {List} from "immutable";
import {UserType} from "../userType";

export class Seria {
    public id: number;
    public date: string;
    public stageType: StageType;
    public games: List<Game> = List<Game>();
    public regNicknames: List<string> = List<string>();
    isCurrent: boolean = false;

    constructor(
        id: number,
        date: string,
        stageType: StageType,
        games: List<Game> = List<Game>(),
        regNicknames: List<string> = List<string>(),
        isCurrent: boolean,
    ) {
        this.id = id;
        this.date = date;
        this.stageType = stageType;
        this.games = games;
        this.regNicknames = regNicknames;
        this.isCurrent = isCurrent;
    }
}