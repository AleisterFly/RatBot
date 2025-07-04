import {IPlayerRepository} from "./playerRepository";
import Immutable, {List} from "immutable";
import {Player} from "../models/player/player";
import {dbManager} from "../di/ratProvider";
import {UserType} from "../models/userType";

export class DBPlayerRepository implements IPlayerRepository {
    createPlayer(nickname: string): Player {
        let regNumber = 0;
        let existPlayer = dbManager.getPlayerByNickname(nickname);
        if (existPlayer) {
            regNumber = existPlayer.regNumber;
        } else {
            regNumber = dbManager.getAllPlayers().size + 1;
        }
        let player = Player.createPlayer(nickname);
        player.regNumber = regNumber;
        console.log("DBPlayerRepository" + player);
        dbManager.addPlayer(player.nickname, player.teamName, player.gameScores, player.ratScores, player.penalties, player.isRat, player.regNumber);
        return player;
    }

    getAllPlayersNicknames(userType: UserType = UserType.All): List<string> {
        let nicknames: List<string>;

        switch (userType) {
            case UserType.Player:
                nicknames = dbManager.getAllNicknames(UserType.Player);
                break;

            case UserType.Rat:
                nicknames = dbManager.getAllNicknames(UserType.Rat);
                break;

            case UserType.UnregPlayer:
                nicknames = dbManager.getAllNicknames(UserType.UnregPlayer);
                break;

            case UserType.All:
            default:
                const playersNicknames = dbManager.getAllNicknames(UserType.Player);
                const ratNicknames = dbManager.getAllNicknames(UserType.Rat);
                const votedNicknames = dbManager.getAllNicknames(UserType.VotedOut);
                nicknames = playersNicknames.concat(ratNicknames).concat(votedNicknames);
                break;
        }

        return nicknames;
    }

    getByNickname(nickname: string): Player | undefined {
        return dbManager.getPlayerByNickname(nickname);
    }

    getRatNicknames(): List<string> {
        return List<string>();
    }

    isPlayerRat(nickname: string): boolean {
        return false;
    }

    updatePlayer(player: Player): void {
        dbManager.updatePlayer(player);
    }

    updateGameScores(nickname: string, gameScores: number): void {
    }

    updatePenalties(nickname: string, penalties: Immutable.List<number>): void {
    }

    updateRatScores(nickname: string, ratScores: number): void {
    }

    updateTeamName(nickname: string, teamName: string): void {
    }

}