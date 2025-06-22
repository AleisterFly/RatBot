import { Player } from './player'
import { PlayerScore } from './playerScore'
import { GameResult } from './gameResult'

export class Game {
  constructor(
      public score: [Player, PlayerScore],
      public gameResult: GameResult,
  ) {}
}