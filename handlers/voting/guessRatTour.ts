import { Context, Markup, Telegraf } from "telegraf";
import {
    playerRepository,
    seriesRepository,
    teamRepository,
    userRepository,
    viewerRepository
} from "../../di/ratProvider";
import { chunk } from "../../utils/util";
import { List } from "immutable";

type VoteSessionTour = {
    selected: Map<string, string>; // ключ — команда, значение — ник игрока
    messageIds: number[]; // ID сообщений с кнопками, чтобы удалить
};

const NUMBER_OF_COLUMNS = 5;

export class GuessRatTour {
    private voteSessions = new Map<number, VoteSessionTour>();

    constructor(private bot: Telegraf) {
        this.registerActions();
    }

    async onRatVote(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        // Удалить старые сообщения, если были
        const oldSession = this.voteSessions.get(chatId);
        if (oldSession?.messageIds?.length) {
            for (const msgId of oldSession.messageIds) {
                try {
                    await ctx.telegram.deleteMessage(chatId, msgId);
                } catch (err) {
                    console.warn("Не удалось удалить сообщение:", err);
                }
            }
        }
        this.voteSessions.delete(chatId);

        const user = userRepository.getRegUser(chatId);
        if (!user) return;

        const viewer = viewerRepository.getByNickname(user?.nickname);
        const currentStage = seriesRepository.getCurrentSeria()?.stageType;

        if (viewer && currentStage) {
            if (viewer.tourVoting.has(currentStage)) {
                await ctx.reply("Вы уже проголосовали в этом туре!");
                return;
            }
        }

        const newSession: VoteSessionTour = {
            selected: new Map(),
            messageIds: []
        };
        this.voteSessions.set(chatId, newSession);

        await ctx.reply("Выберите по одному игроку в каждой команде, кого считаете крысой:");

        const teams = teamRepository.getTeams();

        for (const team of teams) {
            const players = team.players.toArray();

            const buttons = chunk(
                players.map(name =>
                    Markup.button.callback(
                        name,
                        `rat_tour_select:${team.title}|${name}`
                    )
                ),
                NUMBER_OF_COLUMNS
            );

            const markup = Markup.inlineKeyboard(buttons).reply_markup;

            const sentMsg = await ctx.reply(`Команда: ${team.title}`, {
                parse_mode: "HTML",
                reply_markup: markup,
            });

            newSession.messageIds.push(sentMsg.message_id);
        }
    }

    private registerActions() {
        this.bot.action(/^rat_tour_select:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            const data = ctx.match[1];
            const [teamTitle, playerName] = data.split("|");

            session.selected.set(teamTitle, playerName);

            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            await ctx.answerCbQuery(`Вы выбрали ${playerName} в команде ${teamTitle}`);

            const teams = teamRepository.getTeams();
            if (session.selected.size >= teams.size) {
                const choices = Array.from(session.selected.entries())
                    .map(([team, player]) => `${team}: ${player}`)
                    .join("\n");

                const confirmMarkup = Markup.inlineKeyboard([
                    [Markup.button.callback("✅ ДА", "rat_tour_final_confirm")],
                    [Markup.button.callback("❌ НЕТ", "rat_tour_final_cancel")]
                ]);

                const msg = await ctx.reply(`Ваш выбор:\n${choices}\n\nПодтвердить?`, {
                    parse_mode: "HTML",
                    reply_markup: confirmMarkup.reply_markup,
                });

                session.messageIds.push(msg.message_id);
            }
        });

        this.bot.action(/^rat_tour_final_confirm$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            await ctx.answerCbQuery();
            await ctx.telegram.deleteMessage(chatId, ctx.callbackQuery?.message?.message_id as number);

            let scores = 0;
            let selectedNicknames = List<string>();

            for (const [_, selectedPlayer] of session.selected) {
                const player = playerRepository.getByNickname(selectedPlayer);
                if (player) {
                    selectedNicknames = selectedNicknames.push(selectedPlayer);
                    if (player.isRat) {
                        scores++;
                    }
                }
            }

            const user = userRepository.getRegUser(chatId);
            if (!user) return;

            const viewer = viewerRepository.getByNickname(user.nickname);
            const currentStage = seriesRepository.getCurrentSeria()?.stageType;

            if (viewer && currentStage) {
                viewer.tourVoting = viewer.tourVoting.set(currentStage, selectedNicknames);
                viewer.tourScores = viewer.tourScores.set(currentStage, scores);
                viewer.totalScores += scores;
                viewerRepository.updateViewer(viewer);
            }

            await ctx.reply(`Ваши голоса были приняты!`);
            this.voteSessions.delete(chatId);
        });

        this.bot.action(/^rat_tour_final_cancel$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            await ctx.answerCbQuery();
            await ctx.telegram.deleteMessage(chatId, ctx.callbackQuery?.message?.message_id as number);

            this.voteSessions.delete(chatId);
            await this.onRatVote(ctx);
        });
    }
}
