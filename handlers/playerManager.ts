
import { Context, Markup, Telegraf } from "telegraf";
import { IPlayerRepository } from "../repositories/playerRepository";
import { playerRepository, seriesRepository, teamRepository, userRepository } from "../di/ratProvider";
import { chunk, formatInColumns, numberRatGames } from "../utils/util";
import { List } from "immutable";
import { Seria } from "../models/player/series";
import { deleteMessage } from "../utils/deleteMessage";
import { cameraMessage } from "../config/constMessage";
import * as fs from "node:fs";
import path from "path";

const NUMBER_OF_COLUMNS = 3;

type State = "idle" | "register" | "voting" | "rat_select_games" | "rat_done_task" | "cancel_registration";

interface Session {
    state: State;
    data: Record<string, any>;
}

interface RatGameSession {
    selectedGames: number[];
    step: "select" | "confirm";
    messageId?: number;
    confirmMessageId?: number;
}

export class PlayerManager {
    bot: Telegraf;
    sessions: Map<number, Session> = new Map();
    ratGameSessions = new Map<number, RatGameSession>();

    constructor(private playerRepository: IPlayerRepository, bot: Telegraf) {
        this.bot = bot;
        this.bindActions();
    }

    async startRatGameSelection(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentStage = seriesRepository.getCurrentSeria()?.stageType;
        const player = playerRepository.getByNickname(currentUser!.nickname);

        if (player!.ratGames.has(currentStage!)) {
            await ctx.reply("Вы уже выбрали игры на данном этапе!");
            this.ratGameSessions.delete(chatId);
            return;
        }

        const oldSession = this.ratGameSessions.get(chatId);
        if (oldSession) {
            if (oldSession.messageId) {
                try {
                    await ctx.telegram.deleteMessage(chatId, oldSession.messageId);
                } catch (err) {
                    console.warn("Не удалось удалить сообщение выбора игр:", err);
                }
            }

            if (oldSession.confirmMessageId) {
                try {
                    await ctx.telegram.deleteMessage(chatId, oldSession.confirmMessageId);
                } catch (err) {
                    console.warn("Не удалось удалить сообщение подтверждения:", err);
                }
            }

            this.ratGameSessions.delete(chatId);
        }

        const numbers = [1, 2, 3, 4, 5, 6];
        const buttons = chunk(
            numbers.map((n) =>
                Markup.button.callback(`${n}`, `toggle_rat_game:${n}`)
            ),
            NUMBER_OF_COLUMNS
        );
        buttons.push([Markup.button.callback("ПОДТВЕРДИТЬ", "confirm_rat_games")]);

        const message = await ctx.reply("Выберите игры и подтвердите:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });

        this.ratGameSessions.set(chatId, {
            selectedGames: [],
            step: "select",
            messageId: message.message_id
        });
    }

    private async askNextRatGames(ctx: Context, selectedGames: number[], edit = false) {
        const numbers = [1, 2, 3, 4, 5, 6];

        const buttons = chunk(
            numbers.map((n) => {
                const selected = selectedGames.includes(n);
                const label = selected ? `✅ ${n}` : `${n}`;
                return Markup.button.callback(label, `toggle_rat_game:${n}`);
            }),
            NUMBER_OF_COLUMNS
        );

        buttons.push([Markup.button.callback("ПОДТВЕРДИТЬ", "confirm_rat_games")]);

        const markup = Markup.inlineKeyboard(buttons).reply_markup;

        if (edit) {
            try {
                await ctx.editMessageReplyMarkup(markup);
            } catch (err) {
                console.error(err);
            }
        } else {
            await ctx.reply("Выберите игры и подтвердите:", {
                parse_mode: "HTML",
                reply_markup: markup,
            });
        }
    }

    // Вспомогательный метод
    private getSession(chatId: number): Session {
        if (!this.sessions.has(chatId)) {
            this.sessions.set(chatId, { state: "idle", data: {} });
        }
        return this.sessions.get(chatId)!;
    }

    async registerToSeria(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentSeries = seriesRepository.getCurrentTourSeries();

        if (currentSeries) {
            const buttons = chunk(
                currentSeries
                    .map((seria) => Markup.button.callback(seria.date, `register_to_series:${seria.date}`))
                    .toArray(),
                NUMBER_OF_COLUMNS
            );

            await ctx.reply("Выбери серию для регистрации", {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
            });

            const session = this.getSession(chatId);
            session.state = "register";
            session.data = { currentUser, currentSeries };
        }
    }

    async getRegisterSeries(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentSeries = seriesRepository.getCurrentTourSeries();
        if (currentSeries && currentUser) {
            const registeredDates = currentSeries
                .filter((seria) => seria.regNicknames.includes(currentUser.nickname))
                .map((seria) => seria.date);

            let text = formatInColumns(registeredDates, NUMBER_OF_COLUMNS);

            await ctx.reply("Вы зарегистрированы на:\n\n" + text, {
                parse_mode: "HTML",
            });
        }
    }

    async cancelRegistrationToSeria(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentSeries = seriesRepository.getCurrentTourSeries();
        if (currentSeries && currentUser) {
            currentSeries.forEach((seria) => {
                if (seria.regNicknames.includes(currentUser.nickname)) {
                    seria.regNicknames = seria.regNicknames.filter((nick) => nick !== currentUser.nickname);
                    seriesRepository.updateSeria(seria);
                }
            });
        }
        await ctx.reply("Твоя регистрация отменена.", { parse_mode: "HTML" });

        const session = this.getSession(chatId);
        session.state = "cancel_registration";
    }

    async voting(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        if (currentUser) {
            const player = playerRepository.getByNickname(currentUser.nickname);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;

            const nicknames = teamRepository.getTeamByNickname(currentUser.nickname)?.players.filter(
                (p) => p !== currentUser.nickname
            );

            if (nicknames && currentStage && player) {
                if (player.votings.has(currentStage)) {
                    await ctx.reply("Вы уже проголосовали на данном этапе!");
                    return;
                }

                const buttons = nicknames
                    .sort((a, b) => a.localeCompare(b))
                    .map((nick) => Markup.button.callback(nick, `vote_player:${nick}`));

                await ctx.reply("Проголосуй за того, кого хочешь исключить:\n\n", {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard(buttons.toArray(), { columns: 1 }).reply_markup,
                });

                const session = this.getSession(chatId);
                session.state = "voting";
                session.data = { player, currentStage };
            }
        }
    }

    async ratDoneTask(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        if (currentUser) {
            const player = playerRepository.getByNickname(currentUser.nickname);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;

            if (currentStage && player) {
                if (player.doneTasks.has(currentStage)) {
                    await ctx.reply("Вы уже отметили в какой игре выполнили задание!");
                    return;
                }

                const buttons = List.of(1, 2, 3, 4, 5, 6).map((number) =>
                    Markup.button.callback(number.toString(), `set_done_task:${number}`)
                );

                await ctx.reply(`Отметьте в какой игре по счету вы выполнили задание:\n\nНе отмечайте, пока не выполните задание!!!`, {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard(buttons.toArray(), { columns: 1 }).reply_markup,
                });

                const session = this.getSession(chatId);
                session.state = "rat_done_task";
                session.data = { player, currentStage };
            }
        }
    }

    bindActions() {
        this.bot.action(/^register_to_series:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);
            const seriaDate = ctx.match[1];

            const session = this.getSession(chatId);
            const { currentUser, currentSeries } = session.data;

            const selectSeria = currentSeries.find((s: Seria) => s.date === seriaDate);
            if (currentUser && selectSeria) {
                if (selectSeria.regNicknames.contains(currentUser.nickname)) {
                    await ctx.reply(`Вы уже были зарегистрированы на эту серию!`);
                } else {
                    selectSeria.regNicknames = selectSeria.regNicknames.push(currentUser.nickname);
                    seriesRepository.updateSeria(selectSeria);
                    await ctx.reply(`Вы зарегистрировались на серию : ${seriaDate}`);
                }
            }

            session.state = "idle";
        });

        this.bot.action(/^vote_player:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);
            const nickname = ctx.match[1];

            const session = this.getSession(chatId);
            const { player, currentStage } = session.data;

            player.votings = player.votings.set(currentStage, nickname);
            playerRepository.updatePlayer(player);

            await ctx.reply("Вы проголосовали за: " + nickname + ". Вы думаете вы сделали правильный выбор?\nВремя покажет!");

            session.state = "idle";
        });

        this.bot.action(/^set_rat_games:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);
            const gameInt = ctx.match[1];

            const session = this.getSession(chatId);
            const { player, currentStage } = session.data;

            player.ratGames = player.ratGames.set(currentStage, List([parseInt(gameInt, 10)]));
            playerRepository.updatePlayer(player);

            const games = player.ratGames.get(currentStage).toArray().join(", ");
            await ctx.reply(`Ты должен быть крысой в играх под номерами: ${games}`);

            session.state = "idle";
        });

        this.bot.action(/^set_done_task:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);
            const gameInt = ctx.match[1];

            const session = this.getSession(chatId);
            const { player, currentStage } = session.data;

            player.doneTasks = player.doneTasks.set(currentStage, parseInt(gameInt, 10));
            playerRepository.updatePlayer(player);

            await ctx.reply(`Записано, что ты выполнил задание в игре номер: ${player.doneTasks.get(currentStage)}`);

            session.state = "idle";
        });

        this.bot.action(/^toggle_rat_game:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const gameNum = parseInt(ctx.match[1], 10);

            const session = this.ratGameSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            const idx = session.selectedGames.indexOf(gameNum);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;
            const user = userRepository.getRegUser(chatId);
            if (!user) return;

            const player = playerRepository.getByNickname(user.nickname);
            if (!player) return;

            const limitGamesNumber = numberRatGames(currentStage!) + player.bonusRatGames;

            if (idx === -1) {
                if (session.selectedGames.length >= limitGamesNumber) {
                    await ctx.answerCbQuery(`Нельзя выбрать больше ${limitGamesNumber} игр!`, { show_alert: true });
                    return;
                }
                session.selectedGames.push(gameNum);
            } else {
                session.selectedGames.splice(idx, 1);
            }

            await this.askNextRatGames(ctx, session.selectedGames, true);
        });


        this.bot.action(/^confirm_rat_games$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            await deleteMessage(ctx);

            const session = this.ratGameSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            session.step = "confirm";

            const selected = session.selectedGames.join(", ");
            const summary = `Вы выбрали игры: ${selected}. Вы уверены?`;

            const markup = Markup.inlineKeyboard([
                [Markup.button.callback("✅ ДА", "final_confirm_rat_games")],
                [Markup.button.callback("❌ НЕТ", "final_cancel_rat_games")]
            ]);

            const message = await ctx.reply(summary, { reply_markup: markup.reply_markup });

            session.confirmMessageId = message.message_id;
        });

        this.bot.action(/^final_confirm_rat_games$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            await deleteMessage(ctx);

            const session = this.ratGameSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            const currentUser = userRepository.getRegUser(chatId);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;

            if (currentUser && currentStage) {
                const player = playerRepository.getByNickname(currentUser.nickname);

                if (player) {
                    player.ratGames = player.ratGames.set(currentStage, List(session.selectedGames));

                    console.log(player.ratGames);
                    playerRepository.updatePlayer(player);

                    await ctx.reply(`Ты должен быть крысой в играх: ${session.selectedGames.join(", ")}`);
                }
            }

            this.ratGameSessions.delete(chatId);
        });


        this.bot.action(/^final_cancel_rat_games$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            await deleteMessage(ctx);

            const session = this.ratGameSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            session.step = "select";

            await this.askNextRatGames(ctx, session.selectedGames);
        });

        this.bot.action(/^cancel_rat_games$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            this.ratGameSessions.delete(chatId);
            await ctx.reply("Выбор отменён.");
        });
    }

    async settingCamera(ctx: Context) {
        const fullImagePath1 = path.resolve(__dirname, '..', "media/cam1.jpg");
        const fullImagePath2 = path.resolve(__dirname, '..', "media/cam2.jpg");
        const fullImagePath3 = path.resolve(__dirname, '..', "media/cam3.jpg");
        const fullImagePath4 = path.resolve(__dirname, '..', "media/cam4.jpg");

        await ctx.replyWithMediaGroup([
            {
                type: 'photo',
                media: { source: fs.createReadStream(fullImagePath1) },
                caption: cameraMessage
            },
            {
                type: 'photo',
                media: { source: fs.createReadStream(fullImagePath2) }
            },
            {
                type: 'photo',
                media: { source: fs.createReadStream(fullImagePath3) }
            },
            {
                type: 'photo',
                media: { source: fs.createReadStream(fullImagePath4) }
            }
        ]);
    }
}