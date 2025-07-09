import {Telegraf} from "telegraf";
import {IUserRepository} from "../repositories/userRepository";
import {UserType} from "../models/userType";
import {IPlayerRepository} from "../repositories/playerRepository";
import {List} from "immutable";

export interface INotificationManager {
    sendMessageToAll(message: string, type?: UserType): void;

    sendMessageWithPhotoToAll(photoUrl: string, message: string, type?: UserType): void;
}

export class NotificationManager {
    bot: Telegraf;

    constructor(private repository: IUserRepository, private playerRepository: IPlayerRepository, bot: Telegraf) {
        this.bot = bot;
    }

    async sendMessageToAll(message: string, type: UserType = UserType.SuperAdmin) {
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

    async sendStartPlayerVoting(message: string) {

    }

    async sendStartRatSeriaVoting(message: string) {

    }

    async sendStartRatTourVoting(message: string) {

    }

    async sendVotedOutMessage(message: string) {

    }

    async sendWelcomeTeamMessage(message: string) {

    }

    async sendCapitanRegSeriaMessage(message: string) {

    }

    async sendRegistrationFirstTourMessage(message: string) {

    }

    async sendRegistrationSecondTourMessage(message: string) {

    }

    async sendRegistrationFinalMessage(message: string) {

    }

    async sendRatBonusMessage(message: string) {

    }
}

