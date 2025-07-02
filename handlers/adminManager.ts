import {Context, Markup, Telegraf} from "telegraf";
import {playerRepository, userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";
import {List} from "immutable";
import {AdminCommand} from "../models/admin/adminCommand";
import {ConfirmationType} from "../models/admin/confirmationType";
import {User} from "../models/user";


const NUMBER_OF_COLUMNS = 3;


export class AdminManager {
    bot: Telegraf;

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    async onShowPlayers(ctx: Context) {
        // СДЕЛАТЬ проверку на админа


        let playersNicknames = playerRepository.getAllPlayersNicknames()
        console.log(playersNicknames);
        let text = this.formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);

        await ctx.reply("Игроки: \n" + text, {
            parse_mode: "HTML"
        });
    }

    async onSendMessageToUser(ctx: Context, nickname: string, message: string) {
        // СДЕЛАТЬ проверку на админа


        let user = userRepository.getUser(nickname)
        if (user) {
            await this.bot.telegram.sendMessage(user.chatId, message);
            await ctx.reply("Сообщение для " + nickname + ": отправлено");
        } else {
            await ctx.reply("User не найден");
        }
    }

    async onSelectPlayer(ctx: Context) {

        const buttons = this.chunk(
            playerRepository
                .getAllPlayersNicknames(UserType.All)
                .sort((a, b) => a.localeCompare(b))
                .map((name) => Markup.button.callback(name, `select_command:${name}`))
                .toArray(),
            NUMBER_OF_COLUMNS
        );

        await ctx.reply("Выбери ИГРОКА", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });

        this.bot.action(/^select_command:(.*)$/, async (ctx) => {
            const selectedNickname = ctx.match[1];

            const commandsButtons = this.chunk(
                List.of(AdminCommand.MARK_VOTED, AdminCommand.SET_RAT)
                    .map((commandName) => Markup.button.callback(commandName, `command_confirmation:${commandName}`))
                    .toArray(), // <-- ключ!
                NUMBER_OF_COLUMNS
            );

            await ctx.reply("Выбери КОМАНДУ", {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(commandsButtons).reply_markup,
            });


            this.bot.action(/^command_confirmation:(.*)$/, async (ctx) => {
                const selectedCommand = ctx.match[1] as AdminCommand;

                const commandsButtons = this.chunk(
                    List.of(ConfirmationType.YES, ConfirmationType.CANCEL)
                        .map((confirmation) => Markup.button.callback(confirmation, `do_command:${confirmation}`))
                        .toArray(), // <-- ключ!
                    NUMBER_OF_COLUMNS
                );

                await ctx.reply("Уверен, что хочешь выполнить: \n"  + selectedCommand + "\n для ИГРОКА \n" + selectedNickname + "\n?", {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard(commandsButtons).reply_markup,
                });

                this.bot.action(/^do_command:(.*)$/, async (ctx) => {
                    const confirmation = ctx.match[1] as ConfirmationType;
                    if (confirmation === ConfirmationType.YES) {
                        switch (selectedCommand) {
                            case AdminCommand.MARK_VOTED:
                                let user = userRepository.getUser(selectedNickname);
                                if (user) {
                                    await this.onSetVoted(ctx, user);
                                }
                                break;
                            case AdminCommand.SET_RAT:
                                let player = playerRepository.getByNickname(selectedNickname);
                                if (player) {
                                    player.isRat = !player.isRat;
                                    playerRepository.updateIsRat(player.nickname, player.isRat);
                                }
                                break;
                        }
                    }
                    if (confirmation === ConfirmationType.CANCEL) {
                        await ctx.reply("Выбор отменен");
                    }
                });
            });
        });
    }

        async onSetVoted(ctx: Context, user:User) {
        // СДЕЛАТЬ проверку на админа

        const isVoted = user.userType !== UserType.VotedOut;
        if (user) {
            console.log(user.nickname + (isVoted ? ": ЗАГОЛОСОВАН!" : ": опять простой Игрок!"));

            await ctx.reply(user.nickname + (isVoted ? ": ЗАГОЛОСОВАН!" : ": опять простой Игрок!"));
            user.userType = isVoted ? UserType.VotedOut : UserType.Player;
            userRepository.updateUser(user);
        } else {
            await ctx.reply("User не найден");
        }
    }


    formatInColumns(items: List<string>, columns: number): string {
        const rows = Math.ceil(items.size / columns);
        let output = "";

        for (let row = 0; row < rows; row++) {
            let line = "";
            for (let col = 0; col < columns; col++) {
                const index = col * rows + row;
                const value = items.get(index) || "";
                line += value.padEnd(20); // регулируй ширину
            }
            output += line.trimEnd() + "\n";
        }
        return output;
    }


    chunk<T>(arr: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

}