import { RoleType } from './roleType'

export class PlayerScore {
    constructor(
        public totalScore: number,
        public plusExtraPoints: number,
        public minusExtraPoints: number,
        public bestMovePoints: number,
        public ciPoints: number,
        public roleType: RoleType,
    ) {}

    get totalExtraPoints(): number {
        return this.plusExtraPoints + this.minusExtraPoints + this.bestMovePoints
    }
}