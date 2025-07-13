import {Context, Markup, Telegraf} from "telegraf";
import {List} from "immutable";
import {notificationManager} from "../di/ratProvider";
import {messageCommand} from "../models/messageCommand";
import {UserType} from "../models/userType";
import {deleteMessage} from "../utils/deleteMessage";

const COLUMNS = 1;

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
                await notificationManager.sendWelcomeTeamsMessage(chatId); // ← заменить на ввод названия
                break;
            case messageCommand.RAT_WELCOME:
                await notificationManager.sendRatWelcomeMessage(chatId);
                break;
            case messageCommand.NEW_RAT_WELCOME:
                await notificationManager.sendNewRatMessage(chatId,"nickname"); // ← заменить на ввод ника
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
                await notificationManager.sendRatBonusMessage(chatId,"nickname");
                break;
            case messageCommand.TO_ALL_PLAYERS:
                await notificationManager.sendMessageToAll(chatId,"Введите сообщение...", UserType.Player);
                break;
            case messageCommand.TO_ALL_VIEWERS:
                await notificationManager.sendMessageToAll(chatId,"Введите сообщение...", UserType.Viewer);
                break;
        }
    }
}
