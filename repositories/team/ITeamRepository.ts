import {List} from "immutable";
import {Team} from "../../models/player/team";

export interface ITeamRepository {
    getTeams(): List<Team>;
    getTeam(title: string): Team | undefined;
    getTeamByNickname(nickname: string): Team | undefined;
    getKickedNicknames(title: string): List<string> | undefined;
    getActivePlayersNicknames(title: string): List<string> | undefined;
    setRatPlayer(title: string, nickname: string): void;
    setCapitan(title: string, nickname: string): void;
    setTeamTitle(title: string, newTitle: string): void;
    setTeamEmblemUrl(title: string, emblemUrl: string): void;
    setTeamScore(title: string, score: number): void;
    setTeamBonusScore(title: string, bonusScore: number): void;
    setTeamTotalScore(title: string, totalScore: number): void;
    setTeamKickedPlayers(title: string, kickedPlayers: List<string>): void;
    setTeamActivePlayers(title: string, activePlayers: List<string>): void;
    saveTeam(team: Team): void;
    updateTeam(team: Team): void;
    createTeam(title: string): void;
}