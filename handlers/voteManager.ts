import { Context, Markup, Telegraf } from "telegraf"
import { IViewerRepository } from "../repositories/viewerRepository"
import { List } from "immutable"
import {deleteMessage} from "../utils/deleteMessage";
import {dbManager} from "../di/ratProvider";
import {Player} from "../models/player/player";
import {chunk} from "../utils/util";

type VoteStep = 'select_rat'

type VoteSession = {
    step: VoteStep,
    votedNicknames: string[]
}

const NUMBER_OF_COLUMNS = 5;

const MockSeriaNicknames: List<string> = List([
    "Абрам", "Космос", "Аврора", "Адлер", "Алиот",
    "Комар", "Крис", "Кукла", "Тони", "f5"
]);

export class VoteManager {
    private voteSessions = new Map<number, VoteSession>()

    constructor(
        private viewerRepository: IViewerRepository,
        private bot: Telegraf,
    ) {
        this.registerActions()
    }

    async onRatVote(ctx: Context) {
        const chatId = ctx.chat?.id
        if (!chatId) return

        if (this.voteSessions.has(chatId)) {
            await ctx.reply("Вы уже голосуете. Завершите голосование.")
            return
        }

        this.voteSessions.set(chatId, { step: "select_rat", votedNicknames: [] })
        await this.askNext(ctx, [])
    }

    private registerActions() {
        this.bot.action(/^vote_nickname:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id
            if (!chatId) return

            const session = this.voteSessions.get(chatId)
            if (!session) {
                await ctx.reply("Сессия не найдена.")
                return
            }

            const votedName = ctx.match[1]
            session.votedNicknames.push(votedName)

            if (session.votedNicknames.length >= 3) {
                await deleteMessage(ctx);
                this.voteSessions.delete(chatId);
                const votedList = session.votedNicknames.join(", ");


                const players: List<Player> = List<Player>();

                for (const name of session.votedNicknames) {
                    const player = dbManager.getPlayerByNickname(name);
                    if (player) {
                        players.push(player);
                    }
                }

                await ctx.reply(`Вы считаете, что крыса среди: ${votedList}\nСпасибо за голосование!`);

            } else {
                await this.askNext(ctx, session.votedNicknames)
            }
        })
    }

    private async askNext(ctx: Context, alreadyVoted: string[]) {
        await deleteMessage(ctx);
        const available = MockSeriaNicknames.filter(n => !alreadyVoted.includes(n))

        const buttons = chunk(
            available
                .sort((a, b) => a.localeCompare(b))
                .map((name) => Markup.button.callback(name, `vote_nickname:${name}`))
                .toArray(),
            NUMBER_OF_COLUMNS
        )

        await ctx.reply("Выбери за кого хочешь проголосовать из списка:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        })
    }
}
