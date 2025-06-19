import { Player } from "../models/player";

export interface IPlayerRepostory {
  createPlayer(nickname: string): void;

  getByNickname(nickname: string): Player | undefined;
  isPlayerRat(nickname: string): boolean;
  getRatNicknames(): string[];
  getAllNicknames(): string[];

  updateTeamName(nickname: string, teamName: string): void;
  updateGameScores(nickname: string, gameScores: number): void;
  updateRatScores(nickname: string, ratScores: number): void;
  updatePenalties(nickname: string, penalties: number[]): void;
  updateIsRat(nickname: string, isRat: boolean): void;
}

export class LocalPlayerRepostory implements IPlayerRepostory {
  readonly players: Map<string, Player> = new Map();

  constructor() {}

  createPlayer(nickname: string): void {
    let player = Player.createPlayer(nickname);
    this.players.set(nickname, player);
  }

  getByNickname(nickname: string): Player | undefined {
    return this.players.get(nickname);
  }

  isPlayerRat(nickname: string): boolean {
    return this.players.get(nickname)?.isRat ?? false;
  }

  getRatNicknames(): string[] {
    let ratNicknames: string[] = [];

    for (const player of this.players.values()) {
      if (player.isRat) {
        ratNicknames.push(player.nickname);
      }
    }
    return ratNicknames;
  }

  getAllNicknames(): string[] {
    return Array.from(this.players.keys());
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

  updatePenalties(nickname: string, penalties: number[]): void {
    const player = this.players.get(nickname);
    if (player) {
      player.penalties = penalties;
    }
  }

  updateIsRat(nickname: string, isRat: boolean): void {
    const player = this.players.get(nickname);
    if (player) {
      player.isRat = isRat;
    }
  }
}
