import {Context, Markup, Telegraf} from "telegraf";
import {IPlayerRepository} from "../repositories/playerRepository";
import {playerRepository, seriesRepository, teamRepository, userRepository} from "../di/ratProvider";
import {chunk, formatInColumns, numberRatGames} from "../utils/util";
import {List} from "immutable";
import {StageType} from "../models/player/stageType";

const NUMBER_OF_COLUMNS = 3;

export class PlayerManager {

    bot: Telegraf;

    constructor(
        private playerRepository: IPlayerRepository,
        bot: Telegraf
    ) {
        this.bot = bot;
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
                    .toArray(), // <-- ключ!
                NUMBER_OF_COLUMNS
            );

            await ctx.reply("Выбери серию для регистрации", {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
            });

            this.bot.action(/^register_to_series:(.*)$/, async (ctx) => {
                const chatId = ctx.chat?.id as number;
                const messageId = ctx.callbackQuery?.message?.message_id as number;
                await ctx.telegram.deleteMessage(chatId, messageId);
                const seriaDate = ctx.match[1];

                const selectSeria = currentSeries.find((s) => s.date === seriaDate);
                if (currentUser && selectSeria) {

                    if (selectSeria.regNicknames.contains(currentUser.nickname)) {

                        await ctx.reply(`Вы уже были зарегистрированы на эту серию!`);
                    } else {
                        selectSeria.regNicknames = selectSeria.regNicknames.push(currentUser.nickname);
                        seriesRepository.updateSeria(selectSeria);

                        await ctx.reply(`Вы зарегистрировались на серию : ${seriaDate}`);
                    }
                }
            });
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
        const message = "Твоя регистрация отменена.";
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentSeries = seriesRepository.getCurrentTourSeries();
        if (currentSeries && currentUser) {
            currentSeries.forEach((seria) => {
                if (seria.regNicknames.includes(currentUser.nickname)) {
                    seria.regNicknames = seria.regNicknames.filter(nick => nick !== currentUser.nickname);
                    seriesRepository.updateSeria(seria);
                }
            });
        }
        await ctx.reply(message, {
            parse_mode: "HTML",
        });
    }

    async voting(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        if (currentUser) {
            const player = playerRepository.getByNickname(currentUser.nickname);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;


            const nicknames = teamRepository.getTeamByNickname(currentUser.nickname)?.players
                .filter(p => p !== currentUser.nickname);

            if (nicknames && currentStage && player) {
                if (player.votings.has(currentStage)) {
                    await ctx.reply('Вы уже проголосовали на данном этапе!');
                    return;
                }

                const buttons = nicknames
                    .sort((a, b) => a.localeCompare(b))
                    .map(nick => Markup.button.callback(nick, `vote_player:${nick}`));

                await ctx.reply('Проголосуй за того, кого хочешь исключить:\n\n', {
                    parse_mode: 'HTML',
                    reply_markup: Markup.inlineKeyboard(buttons.toArray(), {columns: 1}).reply_markup,
                });

                this.bot.action(/^vote_player:(.*)$/, async (ctx) => {
                        const chatId = ctx.chat?.id as number;
                        const messageId = ctx.callbackQuery?.message?.message_id as number;
                        await ctx.telegram.deleteMessage(chatId, messageId);
                        const nickname = ctx.match[1];

                        player.votings = player?.votings.set(currentStage, nickname);
                        playerRepository.updatePlayer(player)
                    }
                )
            }
        }
    }

    async ratSelectGames(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        if (currentUser) {
            const player = playerRepository.getByNickname(currentUser.nickname);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;

            if (currentStage && player) {
                if (player.ratGames.has(currentStage)) {
                    await ctx.reply('Вы уже выбрали игры на данном этапе!');
                    return;
                }

                const buttons = List.of(1, 2, 3, 4, 5, 6)
                    .map(number => Markup.button.callback(
                        number.toString(),
                        `set_rat_games:${number}`
                    ));

                let numberGames = numberRatGames(currentStage);

                await ctx.reply(`Выберите ${numberGames} крысоигры: \n\n`, {
                    parse_mode: 'HTML',
                    reply_markup: Markup.inlineKeyboard(buttons.toArray(), {columns: 1}).reply_markup,
                });

                //нужно выбор нескольких (numberGames) и подтвердить


                this.bot.action(/^set_rat_games:(.*)$/, async (ctx) => {
                        const chatId = ctx.chat?.id as number;
                        const messageId = ctx.callbackQuery?.message?.message_id as number;
                        await ctx.telegram.deleteMessage(chatId, messageId);
                        const gameInt = ctx.match[1];

                        player.ratGames = player.ratGames.set(currentStage, List([parseInt(gameInt, 10)]));
                        playerRepository.updatePlayer(player);
                    }
                )
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
                    await ctx.reply('Вы уже отметили в какой игре выполнили задание!');
                    return;
                }

                const buttons = List.of(1, 2, 3, 4, 5, 6)
                    .map(number => Markup.button.callback(
                        number.toString(),
                        `set_done_task:${number}`
                    ));

                let numberGames = numberRatGames(currentStage);

                await ctx.reply(`Отметьте в какой игре по счету вы выполнили задание: \n\n`, {
                    parse_mode: 'HTML',
                    reply_markup: Markup.inlineKeyboard(buttons.toArray(), {columns: 1}).reply_markup,
                });

                this.bot.action(/^set_done_task:(.*)$/, async (ctx) => {
                        const chatId = ctx.chat?.id as number;
                        const messageId = ctx.callbackQuery?.message?.message_id as number;
                        await ctx.telegram.deleteMessage(chatId, messageId);
                        const gameInt = ctx.match[1];

                        player.doneTasks = player.doneTasks.set(currentStage, parseInt(gameInt, 10));
                        playerRepository.updatePlayer(player);
                    }
                )
            }
        }
    }

}
