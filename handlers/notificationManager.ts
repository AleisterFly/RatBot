import {Telegraf} from "telegraf";
import {IUserRepository} from "../repositories/userRepository";
import {UserType} from "../models/userType";
import {IPlayerRepository} from "../repositories/playerRepository";
import Immutable, {List} from "immutable";
import {
    captainMessage,
    firstVotedOutMessage,
    newRatMessage, ratBonusMessage,
    secondVotedOutMessage,
    startFinalTourMessage,
    startSecondTourMessage,
    teamFinalVotingMessage,
    teamVotingMessage,
    viewerVotingSeriaMessage,
    viewerVotingTourMessage,
    welcomeRatMessage,
    welcomeTeamMessage
} from "../config/constMessage";
import {teamRepository, userManager} from "../di/ratProvider";

export interface INotificationManager {
    sendMessageToAll(message: string, type?: UserType): void;

    sendMessageWithPhotoToAll(photoUrl: string, message: string, type?: UserType): void;
}

export class NotificationManager {
    bot: Telegraf;

    constructor(private repository: IUserRepository, private playerRepository: IPlayerRepository, bot: Telegraf) {
        this.bot = bot;
    }

    async sendMessageToAll(message: string, type: UserType = UserType.Admin) {
        let ids: List<number> = List<number>();
        switch (type) {
            case UserType.All:
            case UserType.Admin:
            case UserType.VotedOut:
            case UserType.SuperAdmin:
            case UserType.Viewer:
            case UserType.Player:
            case UserType.Rat:
                let nicknames = this.playerRepository.getAllPlayersNicknames(type);
                for (const nickname of nicknames) {
                    let user = this.repository.getUser(nickname);
                    if (user?.chatId) {
                        ids.push(user.chatId)
                    }
                }
                break;
            default:
                break;
        }
        for (const id of ids) {
            await this.bot.telegram.sendMessage(id, message);
        }
    }

    async sendMessageWithPhotoToAll(photoUrl: string, message: string, type: UserType = UserType.Admin) {
        let ids: List<number> = List<number>();
        switch (type) {
            case UserType.All:
            case UserType.Admin:
            case UserType.VotedOut:
            case UserType.Player:
            case UserType.Viewer:
            case UserType.Rat:
                let nicknames = this.playerRepository.getAllPlayersNicknames(type);
                for (const nickname of nicknames) {
                    let user = this.repository.getUser(nickname);
                    if (user?.chatId) {
                        ids.push(user.chatId)
                    }
                }
                break;
            default:
                break;
        }
        for (const id of ids) {
            await this.bot.telegram.sendPhoto(id, photoUrl, {caption: message});
        }
    }

    async sendStartPlayerVoting() {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, teamVotingMessage);
    }

    async sendStartPlayerFinalVoting() {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, teamFinalVotingMessage);
    }

    async sendStartRatSeriaVoting() {
        const viewers = this.playerRepository.getAllPlayersNicknames(UserType.Viewer);

        await this.sendMessagesForAll(viewers, viewerVotingSeriaMessage);
    }

    async sendStartRatTourVoting() {
        const viewers = this.playerRepository.getAllPlayersNicknames(UserType.Viewer);

        await this.sendMessagesForAll(viewers, viewerVotingTourMessage);
    }

    async sendVotedOutFirstMessage(nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, firstVotedOutMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    async sendVotedOutSecondMessage(nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, secondVotedOutMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    async sendWelcomeTeamMessage(teamName: string) {
        const team = teamRepository.getTeam(teamName);
        if (!team) return;
        await this.sendMessagesForAll(team.players, welcomeTeamMessage);
    }

    async sendRatWelcomeMessage() {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        if (!rats) return;
        await this.sendMessagesForAll(rats, welcomeRatMessage);
    }

    async sendNewRatMessage(nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, newRatMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    async sendCaptainsRegSeriaMessage() {
        const captains = teamRepository.getCapitans();
        if (!captains) return;
        await this.sendMessagesForAll(captains, captainMessage);
    }

    // async sendRegistrationFirstTourMessage(message: string) {
    //
    // }

    async sendRegistrationSecondTourMessage() {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, startSecondTourMessage);
    }

    async sendRegistrationFinalMessage() {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, startFinalTourMessage);
    }

    async sendRatBonusMessage(nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, ratBonusMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    private async sendMessagesForAll(nicknames: Immutable.List<string>, message: string) {
        for (const nickname of nicknames) {
            const user = this.repository.getUser(nickname);

            if (!user?.chatId) continue;

            try {
                await this.bot.telegram.sendMessage(user.chatId, message);
            } catch (error) {
                console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
            }
        }
    }
}

