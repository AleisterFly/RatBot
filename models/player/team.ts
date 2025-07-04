import {List} from "immutable";

export class Team {
    constructor(
        public id: number,
        public title: string,
        public emblemUrl: string,
        public players: List<string>,
        public kickedPlayers: List<string>,
        public score: number,
        public bonusScore: number,
        public totalScore: number,
        public ratPlayer: string,
        public capitan: string,
    ) {}
}