import {Context, Markup, Telegraf} from "telegraf";
import {IUserRepository} from "../repositories/userRepository";
import {
    notificationManager,
    playerRepository,
    playerManager,
    userRepository
} from "../di/ratProvider";
import {List} from "immutable";
import {User} from "../models/user";
import {UserType} from "../models/userType";
import {chunk} from "../utils/util";

enum ConfirmationType {
    YES = "Да",
    NO = "Нет",
}

const NUMBER_OF_COLUMNS = 5;

const selectConfirmation: string[] = [
    ConfirmationType.YES,
    ConfirmationType.NO,
];

export class UserManager {
    bot: Telegraf;

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    async onRegister(ctx: Context) {
        let regUser = userRepository.getRegUser(ctx.chat?.id);
        if (regUser != undefined) {
            await ctx.reply(`${regUser.nickname}, вы уже были зарегистрированы!`);
            return;
        }

        console.log(userRepository.getUnregNicknames());

        const buttons = chunk(
            userRepository.getUnregNicknames()
                .sort((a, b) => a.localeCompare(b))
                .map((name) => Markup.button.callback(name, `register_nickname:${name}`))
                .toArray(), // <-- ключ!
            NUMBER_OF_COLUMNS
        );

        await ctx.reply("Выбери свой ник из списка", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });

        this.bot.action(/^register_nickname:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const nickname = ctx.match[1];

            await ctx.answerCbQuery(`Вы выбрали ник: ${nickname}`);
            // await ctx.reply(`Ник <b>${nickname}</b> зарегистрирован.`, {
            //   parse_mode: "HTML",
            // });

            const buttons = chunk(
                selectConfirmation.map((select) =>
                    Markup.button.callback(select, `on_confirm:${select}|${nickname}`)
                ),
                selectConfirmation.length
            );

            await ctx.reply(`Вы уверены, что ваш ник - ${nickname} ?`, {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
            });
        });

        this.bot.action(/^on_confirm:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const data = ctx.match[1]; // пример: "Да|А"
            const [select, nickname] = data.split("|");

            switch (select) {
                case ConfirmationType.YES:
                    let unregUser = userRepository.getUnregUser(nickname);
                    // let regUser = this.repository.getUser(nickname);
                    if (unregUser == undefined) {
                        // throw Error();
                        // } else if (regUser != undefined) {
                        await ctx.reply(
                            `Участник с ником ${nickname} уже был зарегистрирован!`
                        );
                        await this.onRegister(ctx);
                        return;
                    } else {
                        //   unregUser.chatId = chatId;
                        // let newUser = new User(nickname, chatId, UserType.UnregPlayer);

                        if (unregUser.nickname == "Алиот") {
                            unregUser.userType = UserType.Admin;
                        } else {
                            unregUser.userType = UserType.Player;
                        }
                        unregUser.chatId = chatId;


                        userRepository.updateUser(unregUser);
                        let player = playerRepository.createPlayer(nickname);
                        console.log(player);

                        // if (player.regNumber != 2) {
                        //     playerRepository.updateIsRat(nickname, true);
                        // }

                        // playerManager.sendMessageToAllRats(
                        //     `Участник номер ${player.regNumber} (${nickname}) успешно зарегистрирован!`
                        // );

                        await ctx.reply(
                          `Участник номер ${player.regNumber} (${nickname}) успешно зарегистрирован!`
                        );
                        return;
                    }

                case ConfirmationType.NO:
                    await this.onRegister(ctx);
                    return;

                default:
                    return;
            }
        });
    }
}
