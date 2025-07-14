import {Context, Markup, Telegraf} from "telegraf";
import {List} from "immutable";
import {notificationManager, playerRepository, userRepository} from "../di/ratProvider";
import {messageCommand} from "../models/messageCommand";
import {UserType} from "../models/userType";
import {deleteMessage} from "../utils/deleteMessage";

const COLUMNS = 1;
const awaitingMessageFromAdmin = new Map<number, string>();
const tasksImages: Record<number, string> = {
    1: 'media/cam1.jpg',
    2: 'media/cam2.jpg',
    3: 'media/cam3.jpg',
};

export class MessageCommandManager {
    private readonly bot: Telegraf;

    constructor(bot: Telegraf) {
        this.bot = bot;
        this.messageHandler();
    }

    async showMessageCommands(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const commands = List(Object.values(messageCommand));

        const keyboard = Markup.inlineKeyboard(
            commands
                .map(cmd => Markup.button.callback(cmd, `on_msg:${cmd}`))
                .toArray(),
            {columns: COLUMNS}
        );

        await ctx.reply("Команды сообщений:", {
            parse_mode: "HTML",
            reply_markup: keyboard.reply_markup
        });
    }

    private messageHandler() {
        this.bot.action(/^on_msg:(.+)$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;
            await deleteMessage(ctx);

            const selected = ctx.match[1];
            await this.handleCommand(selected, ctx);
        });

        this.bot.action(/^newrat:(.+)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nickname = ctx.match[1];
            const chatAdminId = ctx.chat?.id;
            if (!chatAdminId) return;

            await notificationManager.sendNewRatMessage(chatAdminId, nickname);
            await ctx.answerCbQuery(`Сообщение отправлено для ${nickname}`);
        });

        this.bot.action(/^ratbonus:(.+)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nickname = ctx.match[1];
            const chatAdminId = ctx.chat?.id;
            if (!chatAdminId) return;

            await notificationManager.sendRatBonusMessage(chatAdminId, nickname);
            await ctx.answerCbQuery(`Бонус отправлен крысе ${nickname}`);
        });

        this.bot.action(/^sendmsgto:(.+)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nickname = ctx.match[1];
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            awaitingMessageFromAdmin.set(chatId, nickname);

            await ctx.reply(`Введите сообщение для ${nickname}:`);
            await ctx.answerCbQuery();
        });

        this.bot.action(/^select_task_target:(.+)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nickname = ctx.match[1];

            const keyboard = Markup.inlineKeyboard(
                Object.keys(tasksImages).map(key =>
                    Markup.button.callback(`Задание ${key}`, `send_task_image:${nickname}:${key}`)
                ),
                { columns: 3 }
            );

            await ctx.reply(`Выберите задание для ${nickname}:`, keyboard);
        });

        this.bot.action(/^send_task_image:(.+):(.+)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nickname = ctx.match[1];
            const taskNumber = Number(ctx.match[2]);

            const user = userRepository.getUser(nickname);
            const imagePath = tasksImages[taskNumber];

            if (!user?.chatId || !imagePath) {
                await ctx.reply("Не удалось отправить задание.");
                return;
            }

            try {
                await this.bot.telegram.sendPhoto(user.chatId, { source: imagePath }, {
                    caption: `Твое задание №${taskNumber}`
                });
                await ctx.reply(`Задание №${taskNumber} отправлено игроку ${nickname}`);
            } catch (err) {
                await ctx.reply("Ошибка при отправке задания.");
            }
        });

    }

    async handleCommand(command: string, ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        switch (command) {
            case messageCommand.START_PLAYER_VOTING:
                await notificationManager.sendStartPlayerVoting(chatId);
                break;
            case messageCommand.START_SERIA:
                await notificationManager.startSeriaMessage(chatId);
                break;
            case messageCommand.START_FINAL_PLAYER_VOTING:
                await notificationManager.sendStartPlayerFinalVoting(chatId);
                break;
            case messageCommand.VIEWER_RAT_SERIA_VOTING:
                await notificationManager.sendStartRatSeriaVoting(chatId);
                break;
            case messageCommand.VIEWER_RAT_TOUR_VOTING:
                await notificationManager.sendStartRatTourVoting(chatId);
                break;
            case messageCommand.VOTED_OUT_FIRST:
                await notificationManager.sendVotedOutFirstMessage(chatId);
                break;
            case messageCommand.VOTED_OUT_SECOND:
                await notificationManager.sendVotedOutSecondMessage(chatId);
                break;
            case messageCommand.WELCOME_TEAM:
                await notificationManager.sendWelcomeTeamsMessage(chatId);
                break;
            case messageCommand.RAT_WELCOME:
                await notificationManager.sendRatWelcomeMessage(chatId);
                break;
            case messageCommand.NEW_RAT_WELCOME:
                await notificationManager.showPlayerSelectionForNewRat(ctx);
                break;
            case messageCommand.CAPTAIN_REG_SERIA:
                await notificationManager.sendCaptainsRegSeriaMessage(chatId);
                break;
            case messageCommand.REG_SECOND_TOUR:
                await notificationManager.sendRegistrationSecondTourMessage(chatId);
                break;
            case messageCommand.REG_FINAL_TOUR:
                await notificationManager.sendRegistrationFinalMessage(chatId);
                break;
            case messageCommand.RAT_BONUS_MESSAGE:
                await notificationManager.showRatSelectionForBonus(ctx);
                break;
            case messageCommand.SEND_TASK_TO_RAT:
                await notificationManager.showRatSelectionForTask(ctx);
                break;
            case messageCommand.SEND_TO_PLAYER:
                await notificationManager.showPlayerSelectionForCustomMessage(ctx);
                break;
            case messageCommand.TO_ALL_RATS_MESSAGE:
                awaitingMessageFromAdmin.set(chatId, messageCommand.TO_ALL_RATS_MESSAGE);
                await ctx.reply("Введите сообщение для всех крыс:");
                break;
            case messageCommand.TO_ALL_PLAYERS_MESSAGE:
                awaitingMessageFromAdmin.set(chatId, messageCommand.TO_ALL_PLAYERS_MESSAGE);
                await ctx.reply("Введите сообщение для всех игроков:");
                break;
            case messageCommand.TO_ALL_VIEWERS_MESSAGE:
                awaitingMessageFromAdmin.set(chatId, messageCommand.TO_ALL_VIEWERS_MESSAGE);
                await ctx.reply("Введите сообщение для всех зрителей:");
                break;
        }
    }

    isInSession(chatId: number): boolean {
        return awaitingMessageFromAdmin.has(chatId);
    }

    async handleText(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId || !ctx.message || typeof ctx.message !== 'object' || !('text' in ctx.message)) return;

        const text = ctx.message.text.trim();
        const pending = awaitingMessageFromAdmin.get(chatId);

        if (!pending) return;

        if (pending === messageCommand.TO_ALL_RATS_MESSAGE) {
            await notificationManager.sendMessageToAllRats(chatId, text);
            await ctx.reply("Сообщение отправлено всем крысам");
        }
        else if (pending === messageCommand.TO_ALL_PLAYERS_MESSAGE) {
            await notificationManager.sendMessageToAllPlayers(chatId, text);
            await ctx.reply("Сообщение отправлено всем игрокам");
        }
        else if (pending === messageCommand.TO_ALL_VIEWERS_MESSAGE) {
            await notificationManager.sendMessageToAllViewers(chatId, text);
            await ctx.reply("Сообщение отправлено всем зрителям");

        } else {
            const nickname = pending;
            const user = userRepository.getUser(nickname);

            if (user?.chatId) {
                await this.bot.telegram.sendMessage(user.chatId, text);
                await ctx.reply(`Сообщение отправлено игроку ${nickname}`);
                await ctx.reply(text);
            } else {
                await ctx.reply(`Не удалось найти пользователя ${nickname}`);
            }
        }

        awaitingMessageFromAdmin.delete(chatId);
    }
}
