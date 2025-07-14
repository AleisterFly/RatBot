import {Context, Markup, Telegraf} from "telegraf";
import {IUserRepository} from "../repositories/userRepository";
import {UserType} from "../models/userType";
import {IPlayerRepository} from "../repositories/playerRepository";
import Immutable, {List} from "immutable";
import {
    captainMessage,
    firstVotedOutMessage,
    newRatMessage,
    ratBonusMessage,
    secondVotedOutMessage, seriaMessage,
    startFinalTourMessage,
    startSecondTourMessage,
    teamFinalVotingMessage,
    teamVotingMessage,
    viewerVotingSeriaMessage,
    viewerVotingTourMessage,
    welcomeRatMessage,
    welcomeTeamMessage
} from "../config/constMessage";
import {seriesRepository, teamRepository} from "../di/ratProvider";
import {StageType} from "../models/player/stageType";
import * as fs from "node:fs";
import path from "path";

export interface INotificationManager {
    sendMessageToAll(message: string, type?: UserType): void;

    sendMessageWithPhotoToAll(photoUrl: string, message: string, type?: UserType): void;
}

export class NotificationManager {
    bot: Telegraf;

    constructor(private repository: IUserRepository, private playerRepository: IPlayerRepository, bot: Telegraf) {
        this.bot = bot;
    }

    async sendMessageToAll(chatAdminId: number, message: string, type: UserType = UserType.Admin) {
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
        await this.bot.telegram.sendMessage(chatAdminId, message);
    }

    async sendMessageWithPhotoToAll(chatAdminId: number, photoUrl: string, message: string, type: UserType = UserType.Admin) {
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
        await this.bot.telegram.sendPhoto(chatAdminId, photoUrl, {caption: message});
    }

    async sendStartPlayerVoting(chatAdminId: number) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, teamVotingMessage);

        await this.bot.telegram.sendMessage(chatAdminId, teamVotingMessage)
    }

    async sendStartPlayerFinalVoting(chatAdminId: number) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, teamFinalVotingMessage);
        await this.bot.telegram.sendMessage(chatAdminId, teamFinalVotingMessage);
    }

    async sendStartRatSeriaVoting(chatAdminId: number) {
        const viewers = this.playerRepository.getAllPlayersNicknames(UserType.Viewer);

        await this.sendMessagesForAll(viewers, viewerVotingSeriaMessage);
        await this.bot.telegram.sendMessage(chatAdminId, viewerVotingSeriaMessage);
    }

    async sendStartRatTourVoting(chatAdminId: number) {
        const viewers = this.playerRepository.getAllPlayersNicknames(UserType.Viewer);

        await this.sendMessagesForAll(viewers, viewerVotingTourMessage);
        await this.bot.telegram.sendMessage(chatAdminId, viewerVotingTourMessage);
    }

    async sendVotedOutFirstMessage(chatAdminId: number) {
        const teams = teamRepository.getTeams();
        const kickedNicknamesForStage = teams
            .map(team => team.kickedPlayers.get(StageType.FIRST_TOUR))
            .filter((nickname): nickname is string => Boolean(nickname));

        await this.sendMessagesForAll(kickedNicknamesForStage, firstVotedOutMessage);
        await this.bot.telegram.sendMessage(chatAdminId, firstVotedOutMessage);
    }

    async sendVotedOutSecondMessage(chatAdminId: number) {
        const teams = teamRepository.getTeams();
        const kickedNicknamesForStage = teams
            .map(team => team.kickedPlayers.get(StageType.FIRST_TOUR))
            .filter((nickname): nickname is string => Boolean(nickname));

        await this.sendMessagesForAll(kickedNicknamesForStage, secondVotedOutMessage);
        await this.bot.telegram.sendMessage(chatAdminId, secondVotedOutMessage);
    }

    async sendWelcomeTeamsMessage(chatAdminId: number) {
        const teams = teamRepository.getTeams();
        if (!teams) return;
        teams.forEach(team => {
            this.sendMessagesForAllWithImage(team.players, welcomeTeamMessage, team.emblemUrl);
        })

        const emblemUrl = teams.get(0)?.emblemUrl;

        if (emblemUrl) {

            const absolutePath = path.isAbsolute(emblemUrl)
                ? emblemUrl
                : path.resolve(__dirname, '..', emblemUrl);

            if (fs.existsSync(absolutePath)) {
                await this.bot.telegram.sendPhoto(
                    chatAdminId,
                    {source: fs.createReadStream(absolutePath)},
                    {caption: welcomeTeamMessage}
                );
            } else {
                console.error('❌ Файл не найден:', absolutePath);
            }
        }
    }

    async sendRatWelcomeMessage(chatAdminId: number) {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        if (!rats) return;
        await this.sendMessagesForAll(rats, welcomeRatMessage);
        await this.bot.telegram.sendMessage(chatAdminId, welcomeRatMessage);
    }

    async sendNewRatMessage(chatAdminId: number, nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, newRatMessage);
            await this.bot.telegram.sendMessage(chatAdminId, newRatMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    async showPlayerSelectionForNewRat(ctx: Context) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);

        const keyboard = Markup.inlineKeyboard(
            players
                .map(nickname => Markup.button.callback(nickname, `newrat:${nickname}`))
                .toArray(),
            { columns: 1 }
        );

        await ctx.reply("Выберите игрока для сообщения 'Новая крыса':", keyboard);
    }

    async sendCaptainsRegSeriaMessage(chatAdminId: number) {
        const captains = teamRepository.getCapitans();
        if (!captains) return;
        await this.sendMessagesForAll(captains, captainMessage);
        await this.bot.telegram.sendMessage(chatAdminId, captainMessage);
    }

    async startSeriaMessage(chatAdminId: number) {
        const regNicknames = seriesRepository.getCurrentSeria()?.regNicknames;
        if (!regNicknames) return;
        await this.sendMessagesForAll(regNicknames, seriaMessage);
        await this.bot.telegram.sendMessage(chatAdminId, seriaMessage);
    }

    // async sendRegistrationFirstTourMessage(message: string) {
    //
    // }

    async sendRegistrationSecondTourMessage(chatAdminId: number) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, startSecondTourMessage);
        await this.bot.telegram.sendMessage(chatAdminId, startSecondTourMessage);
    }

    async sendRegistrationFinalMessage(chatAdminId: number) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        const allPlayers = players.concat(rats);

        await this.sendMessagesForAll(allPlayers, startFinalTourMessage);
        await this.bot.telegram.sendMessage(chatAdminId, startFinalTourMessage);
    }

    async sendRatBonusMessage(chatAdminId: number, nickname: string) {
        const user = this.repository.getUser(nickname);

        if (!user?.chatId) return;

        try {
            await this.bot.telegram.sendMessage(user.chatId, ratBonusMessage);
            await this.bot.telegram.sendMessage(chatAdminId, ratBonusMessage);
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
        }
    }

    async showRatSelectionForBonus(ctx: Context) {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.All);

        const keyboard = Markup.inlineKeyboard(
            rats
                .map(nickname => Markup.button.callback(nickname, `ratbonus:${nickname}`))
                .toArray(),
            { columns: 1 }
        );

        await ctx.reply("Выберите крысу для отправки бонуса:", keyboard);
    }

    async showPlayerSelectionForCustomMessage(ctx: Context) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.Player);

        const keyboard = Markup.inlineKeyboard(
            players
                .map(nickname => Markup.button.callback(nickname, `sendmsgto:${nickname}`))
                .toArray(),
            { columns: 1 }
        );

        await ctx.reply("Выберите игрока для отправки произвольного сообщения:", keyboard);
    }

    async sendMessageToAllRats(chatAdminId: number, message: string) {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Rat);
        await this.sendMessagesForAll(rats, message);
        await this.bot.telegram.sendMessage(chatAdminId, message);
    }

    async sendMessageToAllPlayers(chatAdminId: number, message: string) {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Player);
        await this.sendMessagesForAll(rats, message);
        await this.bot.telegram.sendMessage(chatAdminId, message);
    }

    async sendMessageToAllViewers(chatAdminId: number, message: string) {
        const rats = this.playerRepository.getAllPlayersNicknames(UserType.Viewer);
        await this.sendMessagesForAll(rats, message);
        await this.bot.telegram.sendMessage(chatAdminId, message);
    }

    async showRatSelectionForTask(ctx: Context) {
        const players = this.playerRepository.getAllPlayersNicknames(UserType.All);

        const keyboard = Markup.inlineKeyboard(
            players
                .map(nickname => Markup.button.callback(nickname, `select_task_target:${nickname}`))
                .toArray(),
            { columns: 1 }
        );

        await ctx.reply("Выберите игрока для задания:", keyboard);
    }


    private async sendMessagesForAll(nicknames: Immutable.List<string>, message: string) {
        for (const nickname of nicknames) {
            const user = this.repository.getUser(nickname);

            if (!user?.chatId) continue;
            console.log("sendMessagesForAll " + nickname + " " + message + "");

            try {
                await this.bot.telegram.sendMessage(user.chatId, message);
            } catch (error) {
                console.error(`Не удалось отправить сообщение пользователю ${nickname}:`, error);
            }
        }
    }


    private async sendMessagesForAllWithImage(nicknames: Immutable.List<string>, message: string, imageUrl: string) {
        for (const nickname of nicknames) {
            const user = this.repository.getUser(nickname);

            if (!user?.chatId) continue;

            const absolutePath = path.isAbsolute(imageUrl)
                ? imageUrl
                : path.resolve(__dirname, '..', imageUrl);

            console.log("sendMessagesForAllWithImage", user.nickname, absolutePath);

            try {
                if (fs.existsSync(absolutePath)) {
                    await this.bot.telegram.sendPhoto(
                        user.chatId,
                        {source: fs.createReadStream(absolutePath)},
                        {caption: message}
                    );
                } else {
                    console.error('❌ Файл не найден:', absolutePath);
                }
            } catch (error) {
                console.error(`💥 Не удалось отправить сообщение пользователю ${user.nickname}:`, error);
            }

        }
    }
}

