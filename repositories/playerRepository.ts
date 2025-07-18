import { Player } from "../models/player/player";
import {List} from "immutable";
import {UserType} from "../models/userType";
import {StageType} from "../models/player/stageType";

export interface IPlayerRepository {
  createPlayer(nickname: string): Player;

  getByNickname(nickname: string): Player | undefined;
  isPlayerRat(nickname: string): boolean;
  getAllPlayersNicknames(userType: UserType): List<string>;

  updateTeamName(nickname: string, teamName: string): void;
  updateGameScores(nickname: string, gameScores: number): void;
  updateRatScores(nickname: string, ratScores: number): void;
  updatePenalties(nickname: string, penalties: List<number>): void;
  updatePlayer(player: Player): void;
  getVotingOfPlayers(stageType: StageType, teamName: string): List<string>;
}

export class LocalPlayerRepository implements IPlayerRepository {
  readonly players: Map<string, Player> = new Map();

  constructor() {}

  getVotingOfPlayers(stageType: StageType, teamName: string): List<string> {
        throw new Error("Method not implemented.");
    }

  updatePlayer(player: Player) {
    return;
  }

  getAllPlayersNicknames(userType: UserType): List<string> {
        throw new Error("Method not implemented.");
    }

  createPlayer(nickname: string): Player {
    let player = Player.createPlayer(nickname);
    let regNumber = this.players.size + 1;
    player.regNumber = regNumber;
    this.players.set(nickname, player);
    return player;
  }

  getByNickname(nickname: string): Player | undefined {
    return this.players.get(nickname);
  }

  isPlayerRat(nickname: string): boolean {
    return this.players.get(nickname)?.isRat ?? false;
  }

  getRatNicknames(): List<string> {
    let ratNicknames: List<string> = List<string>();

    for (const player of this.players.values()) {
      if (player.isRat) {
        ratNicknames.push(player.nickname);
      }
    }
    return ratNicknames;
  }

  getAllNicknames(): List<string> {
    return List(Array.from(this.players.keys()));
  }

  updateTeamName(nickname: string, teamName: string): void {
    const player = this.players.get(nickname);
    if (player) {
      player.teamName = teamName;
    }
  }

  updateGameScores(nickname: string, gameScores: number): void {
    const player = this.players.get(nickname);
    if (player) {
      player.gameScores = gameScores;
    }
  }

  updateRatScores(nickname: string, ratScores: number): void {
    const player = this.players.get(nickname);
    if (player) {
      player.ratScores = ratScores;
    }
  }

  updatePenalties(nickname: string, penalties: List<number>): void {
    const player = this.players.get(nickname);
    if (player) {
      player.penalties = penalties;
    }
  }
}
