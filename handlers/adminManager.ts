import { Context, Markup, Telegraf } from "telegraf";
import { playerRepository, userRepository } from "../di/ratProvider";
import { UserType } from "../models/userType";
import { List } from "immutable";
import { AdminCommand } from "../models/admin/adminCommand";
import { ConfirmationType } from "../models/admin/confirmationType";
import { User } from "../models/user";
import { deleteMessage } from "../utils/deleteMessage";
import { Player } from "../models/player/player";

const NUMBER_OF_COLUMNS = 3;

export class AdminManager {
    bot: Telegraf;

    constructor(bot: Telegraf) {
        this.bot = bot;
        this.registerActions();
    }

    async onShowPlayers(ctx: Context) {
        let playersNicknames = playerRepository.getAllPlayersNicknames();
        let text = this.formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);

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

    async sendMessageToAllRats(message: string) {
        let nicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);

        for (const nickname of nicknames) {
            let user = userRepository.getUser(nickname);

            if (user) {
                await this.bot.telegram.sendMessage(user.chatId, message);
            }
        }
    }

    async onSelectPlayer(ctx: Context) {
        const buttons = this.chunk(
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

            const commandsButtons = this.chunk(
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

            const confirmButtons = this.chunk(
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

    chunk<T>(arr: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    formatInColumns(items: List<string>, columns: number): string {
        const rows = Math.ceil(items.size / columns);
        let output = "";
        for (let row = 0; row < rows; row++) {
            let line = "";
            for (let col = 0; col < columns; col++) {
                const index = col * rows + row;
                const value = items.get(index) || "";
                line += value.padEnd(20);
            }
            output += line.trimEnd() + "\n";
        }
        return output;
    }
}