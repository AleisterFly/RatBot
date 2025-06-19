import { Player } from "./player";

type PlayerGameResult = { player: Player; result: number };

export class Game {
  readonly players: PlayerGameResult;

  constructor() {}
}
