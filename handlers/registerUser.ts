import {Context, Markup, Telegraf} from "telegraf";
import {
    adminManager, dbManager,
    playerManager,
    playerRepository,
    userManager,
    userRepository,
    viewerManager,
    voteManager
} from "../di/ratProvider";
import {List} from "immutable";
import {UserType} from "../models/userType";
import {chunk, isSpecialNickname} from "../utils/util";
import {BotCommandAccess} from "../models/allBotCommands";

enum ConfirmationType {
    YES = "Да",
    NO = "Нет",
}

const NUMBER_OF_COLUMNS = 5;
const NUMBER_OF_COLUMNS_COMMAND = 3;

const selectConfirmation: string[] = [
    ConfirmationType.YES,
    ConfirmationType.NO,
];

export class UserManager {
    bot: Telegraf;

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    async onShowCommands(ctx: Context) {
        let user = userRepository.getRegUser(ctx.chat?.id);
        if (user) {
            const allowedCommands = this.getAllowedCommands(user.userType);
            // const formattedCommands = allowedCommands.toArray().join('\n');

            const buttons = chunk(
                allowedCommands
                    .sort((a, b) => a.localeCompare(b))
                    .map((name) => Markup.button.callback(name, `on_command_choose:${name}`))
                    .toArray(), // <-- ключ!
                NUMBER_OF_COLUMNS_COMMAND
            );

            await ctx.reply("Доступные команды:", {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
            });

            this.bot.action(/^on_command_choose:(.*)$/, async (ctx) => {
                const chatId = ctx.chat?.id as number;
                const messageId = ctx.callbackQuery?.message?.message_id as number;
                await ctx.telegram.deleteMessage(chatId, messageId);

                const command = ctx.match[1];
                switch (command) {
                    case 'show_players':
                        await adminManager.onShowPlayers(ctx);
                        break;
                    case 'select_player':
                        await adminManager.onSelectPlayer(ctx);
                        break;
                    case 'update_current':
                        await adminManager.updateCurrentSeria(ctx);
                        break;
                    case 'get_current':
                        await adminManager.sendCurrentSeria(ctx);
                        break;
                    case 'reg_seria':
                        await playerManager.registerToSeria(ctx);
                        break;
                    case 'show_reg_seria':
                        await playerManager.getRegisterSeries(ctx);
                        break;
                    case 'cancel_reg_seria':
                        await playerManager.cancelRegistrationToSeria(ctx);
                        break;
                    case 'betting_registration':
                        await viewerManager.onRegister(ctx);
                        break;
                    case 'guess_rat':
                        await voteManager.guessRatVote(ctx);
                        break;
                    case 'guess_rat_tour':
                        await voteManager.guessRatTourVote(ctx);
                        break;
                    case 'show_players_super':
                        await adminManager.onSuperShowPlayers(ctx);
                        break;
                    case 'add_team':
                        await adminManager.addTeam(ctx);
                        break;
                    case 'add_player_to_team':
                        await adminManager.addPlayerToTeam(ctx);
                        break;
                    case 'add_player_to_seria':
                        await adminManager.onAddPlayerToSeria(ctx);
                        break;
                    case 'unreg':
                        await userManager.onUnreg(ctx);
                        break;
                    case 'make_all_player':
                        await userManager.onMakeAllPlayer(ctx);
                        break;
                    case 'player_voting':
                        await playerManager.voting(ctx);
                        break;
                    case 'show_players_voting':
                        await adminManager.showVoting(ctx);
                        break;
                }
            });
        }
    }

    private getAllowedCommands(userType: UserType): List<string> {
        return List(Object.entries(BotCommandAccess)
            .filter(([_, types]) => types.includes(userType) || types.includes(UserType.All))
            .map(([command, _]) => command));
    }


    //TEST
    async onUnreg(ctx: Context) {
        let user = userRepository.getRegUser(ctx.chat?.id);
        if (user) {
            user.chatId = -1;
            user.userType = UserType.UnregPlayer;
            userRepository.updateUser(user)
        }
    }

    async onMakeAllPlayer(ctx: Context) {
        let users = dbManager.getAllUsers();
        for (const user of users) {
            if (isSpecialNickname(user.nickname)) {
                continue;
            }

            console.log(user.nickname);

            user.chatId = Math.floor(10000000 + Math.random() * 90000000);
            user.userType = UserType.Player;
            userRepository.updateUser(user);
            playerRepository.createPlayer(user.nickname);
        }

        await ctx.reply("Все юзеры, кроме специальных, теперь стали игроками!");
    }

    async onRegister(ctx: Context) {
        console.log("onRegister");
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

                        if (unregUser.nickname == "_АДМИН") {
                            unregUser.userType = UserType.Admin;
                        } else if(unregUser.nickname == "_СУПЕР АДМИН") {
                            unregUser.userType = UserType.SuperAdmin;
                        } else if(unregUser.nickname == "_КРЫСА") {
                            unregUser.userType = UserType.Rat;
                        } else if(unregUser.nickname == "_ЗРИТЕЛЬ") {
                            unregUser.userType = UserType.Viewer;
                        } else {
                            unregUser.userType = UserType.Player;
                        }
                        unregUser.chatId = chatId;


                        userRepository.updateUser(unregUser);
                        if (unregUser.userType == UserType.Player || unregUser.userType == UserType.Rat) {
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
                        } else {
                            await ctx.reply(
                                `USER ${unregUser.nickname} успешно зарегистрирован как ${unregUser.userType} !`
                            );
                        }
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
