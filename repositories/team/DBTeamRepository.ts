import {ITeamRepository} from "./ITeamRepository";
import Immutable, {List} from "immutable";
import {Team} from "../../models/player/team";
import {teamDB} from "../../di/ratProvider";
import {StageType} from "../../models/player/stageType";

export class DBTeamRepository implements ITeamRepository {
    constructor() {}

    createTeam(title: string): void {
        teamDB.createTeam(title);
    }

    createTeamUrl(title: string, emblemUrl: string): void {
        teamDB.createTeamUrl(title, emblemUrl);
    }

    getActivePlayersNicknames(title: string): Immutable.List<string> | undefined {
        return teamDB.getActivePlayersNicknames(title);
    }

    getCapitans(): List<string> | undefined {
        const teams = this.getTeams();
        return List(teams.map(team => team.captain).filter(capitan => capitan !== ''));
    }

    getKickedNicknames(title: string): Immutable.List<string> | undefined {
        return teamDB.getKickedNicknames(title);
    }

    getTeam(title: string): Team | undefined {
        return teamDB.getTeam(title);
    }

    getTeamByNickname(nickname: string): Team | undefined {
        return teamDB.getTeamByNickname(nickname);
    }

    getTeams(): Immutable.List<Team> {
        return teamDB.getTeams();
    }

    addActivePlayer(title: string, playerName: string): void {
        teamDB.addActivePlayer(title, playerName);
    }

    saveTeam(team: Team): void {
        teamDB.saveTeam(team);
    }

    setCapitan(title: string, nickname: string): void {
        teamDB.setCapitan(title, nickname);
    }

    setRatPlayer(title: string, nickname: string): void {
        teamDB.setRatPlayer(title, nickname);
    }

    setTeamActivePlayers(title: string, activePlayers: Immutable.List<string>): void {
        teamDB.setTeamActivePlayers(title, activePlayers);
    }

    setTeamBonusScore(title: string, bonusScore: number): void {
        teamDB.setTeamBonusScore(title, bonusScore);
    }

    setTeamEmblemUrl(title: string, emblemUrl: string): void {
        teamDB.setTeamEmblemUrl(title, emblemUrl);
    }

    setTeamKickedPlayers(title: string, kickedPlayers: Map<StageType, string>): void {
        teamDB.setTeamKickedPlayers(title, kickedPlayers);
    }

    setTeamScore(title: string, score: number): void {
        teamDB.setTeamScore(title, score);
    }

    setTeamTitle(title: string, newTitle: string): void {
        teamDB.setTeamTitle(title, newTitle);
    }

    setTeamTotalScore(title: string, totalScore: number): void {
        teamDB.setTeamTotalScore(title, totalScore);
    }

    updateTeam(team: Team): void {
        teamDB.updateTeam(team);
    }
}