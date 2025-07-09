import { Context, Markup, Telegraf } from "telegraf";
import { IViewerRepository } from "../../repositories/viewerRepository";
import { deleteMessage } from "../../utils/deleteMessage";
import {dbManager, playerRepository, seriesRepository, userRepository, viewerRepository} from "../../di/ratProvider";
import { chunk } from "../../utils/util";
import {List} from "immutable";

type VoteStep = "select_rat" | "confirm_vote";

type VoteSession = {
    step: VoteStep;
    votedNicknames: string[];
    noRats: boolean;
};

const NUMBER_OF_COLUMNS = 5;

export class GuessRat {
    private voteSessions = new Map<number, VoteSession>();

    constructor(
        private bot: Telegraf
    ) {
        this.registerActions();
    }

    async onRatVote(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        if (this.voteSessions.has(chatId)) {
            await ctx.reply("Вы уже голосуете. Завершите голосование.");
            return;
        }

        const user = userRepository.getRegUser(chatId);
        if (!user) return;

        const viewer = viewerRepository.getByNickname(user?.nickname);
        const currentSeria = seriesRepository.getCurrentSeria();

        if(viewer && currentSeria) {
            if(viewer.seriaVoting.has(currentSeria.date)){
                await ctx.reply("Вы уже проголосовали в этой серии!");
                return;
            }
        }

        this.voteSessions.set(chatId, { step: "select_rat", votedNicknames: [], noRats: false });
        await this.askNext(ctx, []);
    }

    private registerActions() {
        this.bot.action(/^toggle_vote:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            const votedName = ctx.match[1];

            if (votedName === "NO_RATS") {
                session.noRats = !session.noRats;
                session.votedNicknames.push("НЕТ КРЫС");

            } else {
                const idx = session.votedNicknames.indexOf(votedName);
                if (idx === -1) {
                    session.votedNicknames.push(votedName);
                } else {
                    session.votedNicknames.splice(idx, 1);
                }
            }

            await this.askNext(ctx, session.votedNicknames, true, session.noRats);
        });

        this.bot.action(/^confirm_vote$/, async (ctx) => {
            await deleteMessage(ctx);
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            session.step = "confirm_vote";

            const selected = session.votedNicknames.length > 0
                ? session.votedNicknames.join(", ")
                : "никого";

            const noRatsText = session.noRats ? "НЕТ КРЫС выбрано" : "";

            const summary = `Ваш выбор: ${selected}.\nВы уверены?`;

            const markup = Markup.inlineKeyboard([
                [Markup.button.callback("✅ ДА", "final_confirm")],
                [Markup.button.callback("❌ НЕТ", "final_cancel")]
            ]);

            await ctx.reply(summary, { reply_markup: markup.reply_markup });
        });

        this.bot.action(/^final_confirm$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            await deleteMessage(ctx);

            let scores = 0;

            for (const name of session.votedNicknames) {
                const player = playerRepository.getByNickname(name);
                if (player) {
                    if (player.isRat) {
                        scores++;
                    } else {
                        scores -= 0.5;
                    }
                }
            }

            if (session.noRats) {
                const currentSeria = seriesRepository.getCurrentSeria();
                if (currentSeria?.regNicknames) {
                    let noRats = true;
                    for (const name of currentSeria.regNicknames) {
                        const player = dbManager.getPlayerByNickname(name);
                        if (player && player.isRat) {
                            noRats = false;
                            break;
                        }
                    }
                    if (noRats) {
                        scores += 3;
                    } else {
                        scores -= 1;
                    }
                }
            }

            const user = userRepository.getRegUser(chatId);
            if (!user) return;

            const viewer = viewerRepository.getByNickname(user?.nickname);
            const currentSeria = seriesRepository.getCurrentSeria();

            if(viewer && currentSeria) {
                viewer.seriaVoting = viewer.seriaVoting.set(currentSeria.date, List(session.votedNicknames));
                viewer.seriaScores = viewer.seriaScores.set(currentSeria.date, scores);

                viewer.totalScores = viewer.totalScores + scores;

                viewerRepository.updateViewer(viewer);
            }

            await ctx.reply(`Ваши голоса были приняты!`);
            this.voteSessions.delete(chatId);
        });

        this.bot.action(/^final_cancel$/, async (ctx) => {
            await deleteMessage(ctx);
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.voteSessions.get(chatId);
            if (!session) {
                await ctx.reply("Сессия не найдена.");
                return;
            }

            session.step = "select_rat";

            await this.askNext(ctx, session.votedNicknames, false, session.noRats);
        });
    }

    private async askNext(ctx: Context, alreadyVoted: string[], edit = false, noRats = false) {
        const currentSeria = seriesRepository.getCurrentSeria();
        if (!currentSeria?.regNicknames) return;

        const available = currentSeria.regNicknames;

        const buttons = chunk(
            available
                .sort((a, b) => a.localeCompare(b))
                .map((name) => {
                    const selected = alreadyVoted.includes(name);
                    const label = selected ? `✅ ${name}` : name;
                    return Markup.button.callback(label, `toggle_vote:${name}`);
                })
                .toArray(),
            NUMBER_OF_COLUMNS
        );

        const noRatsLabel = noRats ? `✅ НЕТ КРЫС` : "НЕТ КРЫС";
        buttons.push([Markup.button.callback(noRatsLabel, `toggle_vote:NO_RATS`)]);

        buttons.push([Markup.button.callback("✅ ПОДТВЕРДИТЬ", `confirm_vote`)]);

        const markup = Markup.inlineKeyboard(buttons).reply_markup;

        if (edit) {
            try {
                await ctx.editMessageReplyMarkup(markup);
            } catch (err) { }
        } else {
            await ctx.reply("Выберите игроков или «НЕТ КРЫС» и подтвердите выбор:", {
                parse_mode: "HTML",
                reply_markup: markup,
            });
        }
    }
}
