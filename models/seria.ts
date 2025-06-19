import { Game } from "./game";
import { Player } from "./player";
import { List } from "immutable";

export class Seria {
  readonly games: List<Game>;
  readonly players: List<Player>;

  constructor() {}
}
