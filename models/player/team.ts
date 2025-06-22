import { Player } from './player'
import {List} from "immutable";

export class Team {
    constructor(
        public id: string,
        public title: string,
        public emblemUrl: string,
        public players: List<Player>,
        public kickedPlayers: List<Player>,
        public score: number,
        public bonusScore: number,
        public totalScore: number,
        public ratPlayer: Player,
        public capitan: Player,
    ) {}
}