import {Context, Markup, Telegraf} from "telegraf";
import {playerRepository, seriesRepository, userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";
import {List} from "immutable";
import {AdminCommand} from "../models/admin/adminCommand";
import {ConfirmationType} from "../models/admin/confirmationType";
import {User} from "../models/user";
import {deleteMessage} from "../utils/deleteMessage";
import {Player} from "../models/player/player";
import {chunk, formatInColumns} from "../utils/util";
import {StageType} from "../models/player/stageType";

const NUMBER_OF_COLUMNS = 3;

export class AdminManager {
    bot: Telegraf;

    private messageIdsForDelete: number[] = [];

    constructor(bot: Telegraf) {
        this.bot = bot;
        this.registerActions();
    }

    async onShowPlayers(ctx: Context) {
        let playersNicknames = playerRepository.getAllPlayersNicknames();
        let text = formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);

        await ctx.reply("Игроки:\n\n" + text, {
            parse_mode: "HTML",
        });
    }

    async sendMessageToOnlyPlayers(message: string) {
        let nicknames = playerRepository.getAllPlayersNicknames(UserType.Player);

        for (const nickname of nicknames) {
            let user = userRepository.getUser(nickname);

            if (user) {
                await this.bot.telegram.sendMessage(user.chatId, message);
            }
        }
    }

    async onSuperShowPlayers(ctx: Context) {
        //SUPER ADMIN
        //SUPER ADMIN
        //SUPER ADMIN
        let playersNicknames = playerRepository.getAllPlayersNicknames(UserType.Player);
        let ratNicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);
        let unregNicknames = playerRepository.getAllPlayersNicknames(UserType.UnregPlayer);

        let playersText = formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);
        let ratText = formatInColumns(ratNicknames, NUMBER_OF_COLUMNS);
        let unregText = formatInColumns(unregNicknames, NUMBER_OF_COLUMNS);

        await ctx.reply("Игроки:\n\n" + playersText, {
            parse_mode: "HTML",
        });
        await ctx.reply("Крысы:\n\n" + ratText, {
            parse_mode: "HTML",
        });
        await ctx.reply("Не реги:\n\n" + unregText, {
            parse_mode: "HTML",
        });
    }

    async sendMessageToAllRats(message: string) {
        let nicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);

        for (const nickname of nicknames) {
            let user = userRepository.getUser(nickname);

            if (user) {
                await this.bot.telegram.sendMessage(user.chatId, message);
            }
        }
    }

    async updateCurrentSeria(ctx: Context) {
        const series = seriesRepository.getSeries().toArray();
        this.messageIdsForDelete = [];

        // Отправляем новые инлайн-кнопки
        for (const stage of Object.values(StageType)) {
            const filtered = series.filter(s => s.stageType === stage);
            if (filtered.length === 0) continue;

            const buttons = filtered.map(s =>
                Markup.button.callback(s.date, `update_seria:${s.date}`)
            );

            const message = await ctx.reply(
                stage,
                Markup.inlineKeyboard(buttons, {columns: 5})
            );

            // Добавляем ID сообщения в массив для удаления
            this.messageIdsForDelete.push(message.message_id);
        }

        // Обработчик нажатия на инлайн-кнопки
        this.bot.action(/^update_seria:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;

            // Удаляем все сообщения, которые были отправлены в рамках текущего вызова команды
            for (const msgId of this.messageIdsForDelete) {
                try {
                    // Удаляем сообщение
                    await ctx.telegram.deleteMessage(chatId, msgId);
                } catch (e) {
                    // Если сообщение уже удалено, просто игнорируем ошибку
                    console.log("Не удалось удалить сообщение с ID:", msgId);
                }
            }

            // Получаем информацию о выбранной серии
            const seriaDate = ctx.match[1];
            seriesRepository.setCurrentSeria(seriaDate);

            // Отправляем сообщение о том, что серия обновлена
            await ctx.reply(`Текущая серия обновлена на: ${seriaDate}`);
        });
    }

    async sendCurrentSeria(ctx: Context) {
        let currentSeria = seriesRepository.getCurrentSeria();
        await ctx.reply(`Текущая серия: ${currentSeria?.date}`);
    }

    async onSelectPlayer(ctx: Context) {
        const buttons = chunk(
            playerRepository
                .getAllPlayersNicknames(UserType.All)
                .sort((a: string, b: string) => a.localeCompare(b))
                .map((nickname: string) =>
                    Markup.button.callback(nickname, `select:${nickname}`)
                )
                .toArray(),
            NUMBER_OF_COLUMNS
        );

        await ctx.reply("Выбери ИГРОКА", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });
    }

    private registerActions() {
        this.bot.action(/^select:(.*)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nick = ctx.match[1];

            const commandsButtons = chunk(
                List.of(AdminCommand.MARK_VOTED, AdminCommand.SET_RAT)
                    .map((cmd) =>
                        Markup.button.callback(
                            cmd,
                            `cmd:${nick}:${cmd === AdminCommand.MARK_VOTED ? "MV" : "SR"}`
                        )
                    )
                    .toArray(),
                NUMBER_OF_COLUMNS
            );

            await ctx.reply(`Выбери КОМАНДУ для ${nick}:`, {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(commandsButtons).reply_markup,
            });
        });

        this.bot.action(/^cmd:(.*):(.*)$/, async (ctx) => {
            await deleteMessage(ctx);
            const nick = ctx.match[1];
            const cmdShort = ctx.match[2];

            const cmdText =
                cmdShort === "MV" ? AdminCommand.MARK_VOTED : AdminCommand.SET_RAT;

            const confirmButtons = chunk(
                List.of(ConfirmationType.YES, ConfirmationType.CANCEL)
                    .map((conf) =>
                        Markup.button.callback(
                            conf,
                            `do:${nick}:${cmdShort}:${conf === ConfirmationType.YES ? "Y" : "N"}`
                        )
                    )
                    .toArray(),
                NUMBER_OF_COLUMNS
            );

            await ctx.reply(
                `Уверен, что хочешь выполнить:\n\n${cmdText}\n\nдля ${nick}?`,
                {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard(confirmButtons).reply_markup,
                }
            );
        });

        this.bot.action(/^do:(.*):(.*):(.*)$/, async (ctx) => {
            await deleteMessage(ctx);

            const nick = ctx.match[1];
            const cmdShort = ctx.match[2];
            const conf = ctx.match[3];

            if (conf === "N") {
                await ctx.reply("Выбор отменён");
                return;
            }

            if (cmdShort === "MV") {
                const user = userRepository.getUser(nick);
                await this.onSetVoted(ctx, user);
            } else if (cmdShort === "SR") {
                const player = playerRepository.getByNickname(nick);
                await this.onSetRatOnOff(ctx, player);
            }
        });
    }

    private async onSetVoted(ctx: Context, user: User | undefined) {
        if (user) {
            const isVoted = user.userType !== UserType.VotedOut;
            user.userType = isVoted ? UserType.VotedOut : UserType.Player;
            userRepository.updateUser(user);
            await ctx.reply(
                user.nickname +
                (isVoted ? ": ЗАГОЛОСОВАН!" : ": снова обычный Игрок!")
            );
        } else {
            await ctx.reply("User не найден");
        }
    }

    private async onSetRatOnOff(ctx: Context, player: Player | undefined) {
        if (player) {
            player.isRat = !player.isRat;
            playerRepository.updatePlayer(player);
            await ctx.reply(
                player.nickname + (player.isRat ? " - КРЫСА!" : " - Не крыса!")
            );
        } else {
            await ctx.reply("Игрок не найден");
        }
    }
}