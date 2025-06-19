import {Context, Markup, Telegraf} from "telegraf";
import {IUserRepostory} from "../repositories/userRepository";
import {User} from "../models/user";
import {UserType} from "../models/userType";
import {IPlayerRepository} from "../repositories/playerRepository";

export interface INotificationManager {
    sendMessageToAll(message: string, type?: UserType): void;
}

export class NotificationManager {
    bot: Telegraf;

    constructor(private repository: IUserRepostory, private playerRepository: IPlayerRepository, bot: Telegraf) {
        this.bot = bot;
    }

    async sendMessageToAll(message: string, type: UserType = UserType.All) {
        let ids: number[] = []
        switch (type) {
            case UserType.All:
                ids = this.repository.getRegChatIds();
                break;
            case UserType.Admin:
                // ids = this.repository.getAdminChatIds();
                break;
            case UserType.Regular:
                // ids = this.repository.getRegularChatIds();
                break;
            case UserType.Player:
                // ids = this.playerRepository.getPlayerChatIds();
                break;
            case UserType.Rat:
                let nicknames = this.playerRepository.getRatNicknames();
                for (const nickname of nicknames) {
                  let user = this.repository.getUser(nickname);
                  if (user?.chatId) {
                    ids.push(user.chatId)
                  }
                }

                break;
            case UserType.Viewer:
                // ids = this.repository.getViewerChatIds();
                break;
            default:
                break;
        }
        for (const id of ids) {
            await this.bot.telegram.sendMessage(id, message);
        }
    }
}
