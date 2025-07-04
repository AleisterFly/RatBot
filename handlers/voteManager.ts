import { Context, Markup, Telegraf } from "telegraf";
import { IViewerRepository } from "../repositories/viewerRepository";
import { List } from "immutable";
import { deleteMessage } from "../utils/deleteMessage";
import { dbManager, seriesRepository } from "../di/ratProvider";
import { Player } from "../models/player/player";
import { chunk } from "../utils/util";

type VoteStep = "select_rat";

type VoteSession = {
    step: VoteStep;
    votedNicknames: string[];
};

const NUMBER_OF_COLUMNS = 5;

export class VoteManager {
    private voteSessions = new Map<number, VoteSession>();

    constructor(
        private viewerRepository: IViewerRepository,
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

        this.voteSessions.set(chatId, { step: "select_rat", votedNicknames: [] });
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
            const idx = session.votedNicknames.indexOf(votedName);

            if (idx === -1) {
                session.votedNicknames.push(votedName);
            } else {
                session.votedNicknames.splice(idx, 1);
            }

            if (session.votedNicknames.length >= 3) {
                await deleteMessage(ctx);
                this.voteSessions.delete(chatId);

                const votedList = session.votedNicknames.join(", ");
                const players: Player[] = [];

                let rat_counter = 0;

                for (const name of session.votedNicknames) {
                    const player = dbManager.getPlayerByNickname(name);
                    if (player) {
                        players.push(player);

                        if(player.isRat) {
                            rat_counter++;
                        }
                    }
                }

                await ctx.reply(`Вы считаете, что крыса среди: ${votedList}\nСпасибо за голосование!`);
                await ctx.reply(`ПОТОМ УДАЛИТЬ. Количество угаданных крыс - ${rat_counter}`);
            } else {
                await this.askNext(ctx, session.votedNicknames, true);
            }
        });
    }

    private async askNext(ctx: Context, alreadyVoted: string[], edit = false) {
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

        const markup = Markup.inlineKeyboard(buttons).reply_markup;

        if (edit) {
            try {
                await ctx.editMessageReplyMarkup(markup);
            } catch (err) {

            }
        } else {
            await ctx.reply("Выберите до трёх игроков:", {
                parse_mode: "HTML",
                reply_markup: markup,
            });
        }
    }
}
