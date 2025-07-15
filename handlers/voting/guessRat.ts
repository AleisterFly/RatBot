import { Context, Markup, Telegraf } from "telegraf";
import { IViewerRepository } from "../../repositories/viewerRepository";
import { deleteMessage } from "../../utils/deleteMessage";
import {
    dbManager,
    playerRepository,
    seriesRepository,
    userRepository,
    viewerRepository
} from "../../di/ratProvider";
import { chunk } from "../../utils/util";
import { List } from "immutable";

type VoteStep = "select_rat" | "confirm_vote";

type VoteSession = {
    step: VoteStep;
    votedNicknames: string[];
    noRats: boolean;
    messageIds: number[]; // сообщения для удаления
};

const NUMBER_OF_COLUMNS = 5;

export class GuessRat {
    private voteSessions = new Map<number, VoteSession>();

    constructor(private bot: Telegraf) {
        this.registerActions();
    }

    async onRatVote(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        // Очистка предыдущей сессии, если была
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

        const viewer = viewerRepository.getByNickname(user.nickname);
        const currentSeria = seriesRepository.getCurrentSeria();

        if (viewer && currentSeria) {
            if (viewer.seriaVoting.has(currentSeria.date)) {
                await ctx.reply("Вы уже проголосовали в этой серии!");
                return;
            }
        }

        const session: VoteSession = {
            step: "select_rat",
            votedNicknames: [],
            noRats: false,
            messageIds: []
        };

        this.voteSessions.set(chatId, session);

        await this.askNext(ctx, [], false, false, session);
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
                if (!session.votedNicknames.includes("НЕТ КРЫС")) {
                    session.votedNicknames.push("НЕТ КРЫС");
                } else {
                    session.votedNicknames = session.votedNicknames.filter(n => n !== "НЕТ КРЫС");
                }
            } else {
                const idx = session.votedNicknames.indexOf(votedName);
                if (idx === -1) {
                    session.votedNicknames.push(votedName);
                } else {
                    session.votedNicknames.splice(idx, 1);
                }
            }

            await this.askNext(ctx, session.votedNicknames, true, session.noRats, session);
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

            const summary = `Ваш выбор: ${selected}.\nВы уверены?`;

            const markup = Markup.inlineKeyboard([
                [Markup.button.callback("✅ ДА", "final_confirm")],
                [Markup.button.callback("❌ НЕТ", "final_cancel")]
            ]);

            const msg = await ctx.reply(summary, { reply_markup: markup.reply_markup });
            session.messageIds.push(msg.message_id);
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
                if (player && player.isRat) {
                    scores++;
                } else if (player) {
                    scores -= 0.5;
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
                    scores += noRats ? 3 : -1;
                }
            }

            const user = userRepository.getRegUser(chatId);
            if (!user) return;

            const viewer = viewerRepository.getByNickname(user.nickname);
            const currentSeria = seriesRepository.getCurrentSeria();

            if (viewer && currentSeria) {
                viewer.seriaVoting = viewer.seriaVoting.set(currentSeria.date, List(session.votedNicknames));
                viewer.seriaScores = viewer.seriaScores.set(currentSeria.date, scores);
                viewer.totalScores += scores;

                viewerRepository.updateViewer(viewer);
            }

            await ctx.reply("Ваши голоса были приняты!");
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

            await this.askNext(ctx, session.votedNicknames, false, session.noRats, session);
        });
    }

    private async askNext(
        ctx: Context,
        alreadyVoted: string[],
        edit = false,
        noRats = false,
        session?: VoteSession
    ) {
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
            const sentMsg = await ctx.reply("Выберите игроков или «НЕТ КРЫС» и подтвердите выбор:", {
                parse_mode: "HTML",
                reply_markup: markup,
            });

            if (session) {
                session.messageIds.push(sentMsg.message_id);
            }
        }
    }
}
