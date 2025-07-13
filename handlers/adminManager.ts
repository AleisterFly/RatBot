import {Context, Markup, Telegraf} from "telegraf";
import {phaseRepository, playerRepository, seriesRepository, teamRepository, userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";
import {List} from "immutable";
import {AdminCommand} from "../models/admin/adminCommand";
import {ConfirmationType} from "../models/admin/confirmationType";
import {User} from "../models/user";
import {deleteMessage} from "../utils/deleteMessage";
import {Player} from "../models/player/player";
import {chunk, formatInColumns} from "../utils/util";
import {StageType} from "../models/player/stageType";
import {Phase} from "../models/admin/phase";
import {teamsMap} from "../config/teamsMap";

const NUMBER_OF_COLUMNS = 3;

export class AdminManager {
    bot: Telegraf;

    private messageIdsForDelete: number[] = [];
    private addTeamSessions = new Map<number, boolean>();

    constructor(bot: Telegraf) {
        this.bot = bot;
        this.registerActions();
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

    async addTeams(ctx: Context){
        const chatId = ctx.chat?.id as number;
        const teamsCount = teamRepository.getTeams().size;
        if (teamsCount >= 10) { return; }

        teamsMap.forEach(team => {teamRepository.createTeamUrl(team.teamName, team.logoUrl);})

        await ctx.reply(`Команды были добавлены`);

        this.addTeamSessions.delete(chatId);
    }

    async addTeam(ctx: Context) {
        const chatId = ctx.chat?.id as number;
        const teamsCount = teamRepository.getTeams().size;

        if (teamsCount >= 10) {
            await ctx.reply("10 команд уже зарегистрированы.");
            return;
        }

        await ctx.reply("Введите название команды");

        this.addTeamSessions ??= new Map();
        this.addTeamSessions.set(chatId, true);

        this.bot.on('text', async (ctx) => {
            const chatId = ctx.chat.id;

            if (!this.addTeamSessions.get(chatId)) return;

            const teamName = ctx.message.text;

            teamRepository.createTeam(teamName);
            await ctx.reply(`Команда ${teamName} была добавлена`);

            this.addTeamSessions.delete(chatId);
        });
    }

    async addPlayerToTeam(ctx: Context) {
        const teams = teamRepository.getTeams();

        const buttons = teams
            .map((team) =>
                Markup.button.callback(team.title, `select_team:${team.title}`)
            );

        await ctx.reply("Выбери команду:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons.toArray(), {columns: 2}).reply_markup,
        });

        this.bot.action(/^select_team:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const teamTitle = ctx.match[1];

            await ctx.answerCbQuery(`Команда выбрана: ${teamTitle}`);

            const team = teamRepository.getTeam(teamTitle);
            if (team) {

                const currentPlayers = team.players.concat(team.kickedPlayers);

                if (currentPlayers.size >= 5) {
                    await ctx.reply(`В команде "${teamTitle}" уже ${currentPlayers.size} игроков — больше добавлять нельзя.`);
                    await ctx.reply(`Игроки в команде: ${currentPlayers.join(", ")}`);
                    return;
                }

                const playerNicknames = playerRepository.getAllPlayersNicknames();

                const availablePlayers = playerNicknames.filter(name => !currentPlayers.includes(name));

                const playerButtons = availablePlayers
                    .sort((a, b) => a.localeCompare(b))
                    .map((name) =>
                        Markup.button.callback(name, `select_player_for_team:${teamTitle}|${name}`)
                    );

                await ctx.reply(`Выбери игрока для команды "${teamTitle}":`, {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard(playerButtons.toArray(), {columns: 2}).reply_markup,
                });
            }
        });

        this.bot.action(/^select_player_for_team:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const data = ctx.match[1]; // "НазваниеКоманды|НикИгрока"
            const [teamTitle, playerName] = data.split("|");

            teamRepository.addActivePlayer(teamTitle, playerName);

            await ctx.answerCbQuery(`Игрок ${playerName} выбран для команды ${teamTitle}`);
            await ctx.reply(`Игрок ${playerName} добавлен в команду ${teamTitle}`);

            const currentPlayers = teamRepository.getActivePlayersNicknames(teamTitle)?.toArray() || [];
            await ctx.reply(`Игроки в команде: ${currentPlayers.join(", ")}`);
        });
    }


    async onShowPlayers(ctx: Context) {
        let playersNicknames = playerRepository.getAllPlayersNicknames();
        let text = formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);

        await ctx.reply("Игроки:\n\n" + text, {
            parse_mode: "HTML",
        });
    }

    async onSuperShowPlayers(ctx: Context) {
        //SUPER ADMIN
        //SUPER ADMIN
        //SUPER ADMIN
        let playersNicknames = playerRepository.getAllPlayersNicknames(UserType.Player);
        let ratNicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);
        let unregNicknames = playerRepository.getAllPlayersNicknames(UserType.UnregPlayer);

        let playersText = formatInColumns(playersNicknames, NUMBER_OF_COLUMNS);
        let ratText = formatInColumns(ratNicknames, NUMBER_OF_COLUMNS);
        let unregText = formatInColumns(unregNicknames, NUMBER_OF_COLUMNS);

        await ctx.reply("Игроки:\n\n" + playersText, {
            parse_mode: "HTML",
        });
        await ctx.reply("Крысы:\n\n" + ratText, {
            parse_mode: "HTML",
        });
        await ctx.reply("Не реги:\n\n" + unregText, {
            parse_mode: "HTML",
        });
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

    async updateCurrentSeria(ctx: Context) {
        const series = seriesRepository.getSeries().toArray();
        this.messageIdsForDelete = [];

        // Отправляем новые инлайн-кнопки
        for (const stage of Object.values(StageType)) {
            const filtered = series.filter(s => s.stageType === stage);
            if (filtered.length === 0) continue;

            const buttons = filtered.map(s =>
                Markup.button.callback(s.date, `update_seria:${s.date}`)
            );

            const message = await ctx.reply(
                stage,
                Markup.inlineKeyboard(buttons, {columns: 5})
            );

            // Добавляем ID сообщения в массив для удаления
            this.messageIdsForDelete.push(message.message_id);
        }

        // Обработчик нажатия на инлайн-кнопки
        this.bot.action(/^update_seria:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;

            // Удаляем все сообщения, которые были отправлены в рамках текущего вызова команды
            for (const msgId of this.messageIdsForDelete) {
                try {
                    // Удаляем сообщение
                    await ctx.telegram.deleteMessage(chatId, msgId);
                } catch (e) {
                    // Если сообщение уже удалено, просто игнорируем ошибку
                    console.log("Не удалось удалить сообщение с ID:", msgId);
                }
            }

            // Получаем информацию о выбранной серии
            const seriaDate = ctx.match[1];
            seriesRepository.setCurrentSeria(seriaDate);

            // Отправляем сообщение о том, что серия обновлена
            await ctx.reply(`Текущая серия обновлена на: ${seriaDate}`);
        });
    }

    async updatePhase(ctx: Context) {

        const allPhases: Phase[] = Object.values(Phase);

        const updatePhaseButtons = allPhases.map(phase =>
            Markup.button.callback(phase, `update_phase:${phase}`)
        );

         await ctx.reply("Выбери фазу:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(updatePhaseButtons, {columns: 1}).reply_markup,
        });

        this.bot.action(/^update_phase:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const selectedPhase = ctx.match[1];

            phaseRepository.setPhase(selectedPhase as Phase);

            // Отправляем сообщение о том, что серия обновлена
            await ctx.reply(`Текущая фаза обновлена на: ${phaseRepository.getPhase()}`);
        });
    }


    async showPhase(ctx: Context) {
        await ctx.reply(`Текущая фаза:\n\n ${phaseRepository.getPhase()}`);
    }

    async sendCurrentSeria(ctx: Context) {
        let currentSeria = seriesRepository.getCurrentSeria();
        await ctx.reply(`Текущая серия: ${currentSeria?.date}`);
    }

    async onSelectPlayer(ctx: Context) {
        const buttons = chunk(
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

            const commandsButtons = chunk(
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

            const confirmButtons = chunk(
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

            let team = teamRepository.getTeamByNickname(user.nickname)
            let stage = seriesRepository.getCurrentSeria()?.stageType
            if (team && stage) {
                if (isVoted) {
                    team.players = team.players.filter(p => p !== user.nickname)
                    team.kickedPlayers = team.kickedPlayers.set(stage, user.nickname)
                } else {
                    for (const [stage, nickname] of team.kickedPlayers.entries()) {
                        if (nickname === user.nickname) {
                            team.kickedPlayers.delete(stage);
                        }
                    }
                    team.players = team.players.push(user.nickname)
                }
                teamRepository.updateTeam(team);
            }
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
            let user = userRepository.getUser(player.nickname)
            if (user) {
                user.userType = player.isRat ? UserType.Rat : UserType.Player;
                userRepository.updateUser(user);
            }

            let team = teamRepository.getTeamByNickname(player.nickname)
            if (team) {
                team.ratPlayer = player.isRat ? player.nickname : "";
                teamRepository.updateTeam(team);
            }
            await ctx.reply(
                player.nickname + (player.isRat ? " - КРЫСА!" : " - Не крыса!")
            );
        } else {
            await ctx.reply("Игрок не найден");
        }
    }

    async onAddPlayerToSeria(ctx: Context) {
        console.log("onAddPlayerToSeria");

        // Берём уже зарегистрированных и сразу в Array
        const currentReg = seriesRepository.getCurrentSeria()?.regNicknames?.toArray() || [];
        console.log("Уже зарегистрированы:", currentReg);

        if (currentReg.length >= 10) {
            await ctx.reply("В серии уже 10 участников.");
            await ctx.reply("В серии зарегистрированы: " + currentReg);
            return;
        }

        const buttons = chunk(
            playerRepository.getAllPlayersNicknames()
                .filter((name) => !currentReg.includes(name)) // теперь includes для Array
                .sort((a, b) => a.localeCompare(b))
                .map((name) => Markup.button.callback(name, `add_player_to_seria:${name}`))
                .toArray(),
            NUMBER_OF_COLUMNS
        );

        await ctx.reply("Выбери игрока для добавления в серию:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });

        this.bot.action(/^add_player_to_seria:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const nickname = ctx.match[1];

            seriesRepository.registerNickname(nickname);

            await ctx.answerCbQuery(`Игрок ${nickname} выбран`);

            const updatedReg = seriesRepository.getCurrentSeria()?.regNicknames?.toArray() || [];

            await ctx.reply(`Игрок ${nickname} добавлен в текущую серию`);
            await ctx.reply(`Игроки в текущей серии: ${updatedReg.join(", ")}`);
        });
    }

    async showVoting(ctx: Context) {
        const votingTeams = teamRepository.getTeams();

        const buttons = votingTeams
            .map((team) =>
                Markup.button.callback(team.title, `select_team_voting:${team.title}`)
            );

        await ctx.reply("Выбери команду:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(buttons.toArray(), {columns: 2}).reply_markup,
        });

        this.bot.action(/^select_team_voting:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;
            await ctx.telegram.deleteMessage(chatId, messageId);

            const teamTitle = ctx.match[1];

            await ctx.answerCbQuery(`Команда выбрана: ${teamTitle}`);

            const team = teamRepository.getTeam(teamTitle);
            if (team) {

                const teamPlayers = team.players;
                const currentStage = seriesRepository.getCurrentSeria()?.stageType;

                for (const playerNickname of teamPlayers) {
                    const player = playerRepository.getByNickname(playerNickname);
                    const voting = player?.votings
                    if (voting && currentStage) {
                        await ctx.reply(`${playerNickname} \nпроголосовал за: ---->>>>>   ${voting.get(currentStage) ?? ''}`);
                    }
                }
            }
        });
    }

    async showRatSelectGames(ctx: Context) {
        const ratNicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);

        const players = ratNicknames
            .map(nickname => playerRepository.getByNickname(nickname))
            .filter((p): p is Player => p !== undefined);

        const messageText = "Крысы выбрали игры \n\n" + players.map(player => {
            const ratGameLines: string[] = [];

            player.ratGames.forEach((list, stageType) => {
                ratGameLines.push(`${stageType}: [${list.join(', ')}]`);
            });

            return `${player.nickname}\n${ratGameLines.join('\n')}`;
        }).join('\n\n');

        await ctx.reply(messageText || 'Нет крыс и их игр 🐀');
    }

    async showRatDoneTasks(ctx: Context) {
        const ratNicks = playerRepository.getAllPlayersNicknames(UserType.Rat);

        const players = ratNicks
            .map(nickname => playerRepository.getByNickname(nickname))
            .filter((p): p is Player => p !== undefined);

        const messageText = "выполненные задания в играх \n\n" + players.map(player => {
            const doneTaskLines: string[] = [];

            player.doneTasks.forEach((value, stageType) => {
                doneTaskLines.push(`${stageType}: ${value}`);
            });

            return `${player.nickname}\n${doneTaskLines.join('\n')}`;
        }).join('\n\n');

        await ctx.reply(messageText || 'Нет данных о выполненных заданиях ✅');
    }

    async defineCaptain(ctx: Context) {
        const chatId = ctx.chat?.id as number;

        // Создаём или очищаем сессию для выбора капитана
        this.addTeamSessions ??= new Map();
        this.addTeamSessions.set(chatId, true);

        // Показываем список команд
        const teams = teamRepository.getTeams();
        const teamButtons = teams
            .map((team) =>
                Markup.button.callback(team.title, `sel_team:${team.title}`)
            );

        await ctx.reply("Выбери команду:", {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard(teamButtons.toArray(), { columns: 2 }).reply_markup,
        });

        // Выбор команды
        this.bot.action(/^sel_team:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;

            await deleteMessage(ctx);

            const teamTitle = ctx.match[1];
            const team = teamRepository.getTeam(teamTitle);

            if (!team) {
                await ctx.reply("Команда не найдена");
                return;
            }

            const teamPlayers = team.players;

            if (teamPlayers.size === 0) {
                await ctx.reply(`В команде "${teamTitle}" нет игроков.`);
                return;
            }

            const playerButtons = teamPlayers
                .sort((a, b) => a.localeCompare(b))
                .map((nickname) =>
                    Markup.button.callback(nickname, `sel_captain:${teamTitle}|${nickname}`)
                );

            await ctx.reply(`Выбери капитана для команды "${teamTitle}":`, {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard(playerButtons.toArray(), { columns: 2 }).reply_markup,
            });
        });

        // Выбор капитана
        this.bot.action(/^sel_captain:(.*)$/, async (ctx) => {
            const chatId = ctx.chat?.id as number;
            const messageId = ctx.callbackQuery?.message?.message_id as number;

            await deleteMessage(ctx);

            const data = ctx.match[1];
            const [teamTitle, playerNickname] = data.split("|");

            const team = teamRepository.getTeam(teamTitle);
            if (!team) {
                await ctx.reply("Команда не найдена");
                return;
            }

            // Запись в базу
            team.captain = playerNickname;
            teamRepository.updateTeam(team);

            await ctx.reply(`Вы выбрали капитаном: ${playerNickname} для команды "${teamTitle}"`);
        });
    }
}