import { Context, Markup, Telegraf } from "telegraf";
import {
    adminManager,
    messageCommandManager,
    phaseRepository,
    playerManager,
    seriesRepository,
    teamRepository,
    userManager,
    userRepository,
    viewerManager,
    voteManager
} from "../di/ratProvider";
import { UserType } from "../models/userType";
import { Phase } from "../models/admin/phase";
import { StageType } from "../models/player/stageType";
import { List } from "immutable";
import { Team } from "../models/player/team";
import { BotCommandAccess } from "../models/allBotCommands";

const COLUMNS = 1;

export class CommandManager {
    private readonly bot: Telegraf;
    private readonly commandMessageMap = new Map<number, number[]>();

    constructor(bot: Telegraf) {
        this.bot = bot;
        this.registerCommandSelectionHandler();
    }

    async onShowCommands(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const user = userRepository.getRegUser(chatId);
        if (!user) return;

        const phase = phaseRepository.getPhase();
        const currentStage = seriesRepository.getCurrentSeria()?.stageType;
        const teams = teamRepository.getTeams();

        if (!phase || !currentStage) return;

        const baseCommands = this.getCommandsFor(UserType.Player, user.nickname, phase, currentStage, teams);
        const userCommands = this.getCommandsFor(user.userType, user.nickname, phase, currentStage, teams);
        const ratExtra = this.getCommandsFor(UserType.Rat, user.nickname, phase, currentStage, teams)
            .filter(cmd => !baseCommands.includes(cmd));

        const messages: number[] = [];

        if (user.userType === UserType.Rat && ratExtra.size > 0) {
            messages.push(await this.sendCommands(ctx, "Команды игрока:", baseCommands));
            messages.push(await this.sendCommands(ctx, "Крысокоманды:", ratExtra));
        } else if (userCommands.size > 0) {
            const title = user.userType === UserType.Player ? "Команды игрока:" : "Доступные команды:";
            messages.push(await this.sendCommands(ctx, title, userCommands));
        } else {
            await ctx.reply("В данную фазу команды не доступны!");
        }

        if (messages.length > 0) {
            this.commandMessageMap.set(chatId, messages);
        }
    }

    private async sendCommands(ctx: Context, title: string, commands: List<string>): Promise<number> {
        const sorted = commands.sort().toArray();
        const keyboard = Markup.inlineKeyboard(
            sorted.map(name => Markup.button.callback(name, `on_choose:${name}`)),
            { columns: COLUMNS }
        );
        const { message_id } = await ctx.reply(title, {
            parse_mode: "HTML",
            reply_markup: keyboard.reply_markup
        });
        return message_id;
    }

    private registerCommandSelectionHandler() {
        this.bot.action(/^on_choose:(.+)$/, async (ctx) => {
            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const messageIds = this.commandMessageMap.get(chatId) || [];
            for (const id of messageIds) {
                try {
                    await ctx.telegram.deleteMessage(chatId, id);
                } catch (error) {
                    console.error(error);
                }
            }
            this.commandMessageMap.delete(chatId);

            const selected = ctx.match[1];
            await this.executeCommand(selected, ctx);
        });
    }

    private async executeCommand(command: string, ctx: Context) {
        switch (command) {
            case "СООБЩЕНИЯ": await messageCommandManager.showMessageCommands(ctx); break;
            case "ПОКАЗАТЬ ИГРОКОВ": await adminManager.onShowPlayers(ctx); break;
            case "КРЫСА / УДАЛИТЬ": await adminManager.onSelectPlayer(ctx); break;
            case "ТЕКУЩАЯ СЕРИЯ (задать)": await adminManager.updateCurrentSeria(ctx); break;
            case "ТЕКУЩАЯ СЕРИЯ (показать)": await adminManager.sendCurrentSeria(ctx); break;
            case "ЗАПИСАТЬСЯ НА СЕРИЮ": await playerManager.registerToSeria(ctx); break;
            case "ПОКАЗАТЬ РЕГ СЕРИЮ": await playerManager.getRegisterSeries(ctx); break;
            case "ОТМЕНИТЬ РЕГ СЕРИЮ": await playerManager.cancelRegistrationToSeria(ctx); break;
            case "РЕГИСТРАЦИЯ В КОНКУРСЕ": await viewerManager.onRegister(ctx); break;
            case "УГАДАТЬ КРЫС В СЕРИИ": await voteManager.guessRatVote(ctx); break;
            case "УГАДАТЬ КРЫС В ТУРЕ": await voteManager.guessRatTourVote(ctx); break;
            case "ПОКАЗАТЬ ИГРОКОВ (супер)": await adminManager.onSuperShowPlayers(ctx); break;
            case "ДОБАВИТЬ КОМАНДЫ": await adminManager.addTeams(ctx); break;
            case "НАЗНАЧИТЬ КАПИТАНА": await adminManager.defineCaptain(ctx); break;
            case "ИГРОК В КОМАНДУ": await adminManager.addPlayerToTeam(ctx); break;
            case "ИГРОК В СЕРИЮ": await adminManager.onAddPlayerToSeria(ctx); break;
            case "unreg": await userManager.onUnreg(ctx); break;
            case "make_all_player": await userManager.onMakeAllPlayer(ctx); break;
            case "ГОЛОСОВАНИЕ": await playerManager.voting(ctx); break;
            case "ГОЛОСОВАНИЕ (финал)": await playerManager.voting(ctx); break;
            case "ПОКАЗАТЬ ГОЛОСОВАНИЕ": await adminManager.showVoting(ctx); break;
            case "ВЫБРАТЬ КРЫСОИГРЫ": await playerManager.startRatGameSelection(ctx); break;
            case "ЗАДАНИЕ ВЫПОЛНЕНО!": await playerManager.ratDoneTask(ctx); break;
            case "КРЫСОЗАДАНИЯ (выполненные)": await adminManager.showRatDoneTasks(ctx); break;
            case "КРЫСО-ИГРЫ": await adminManager.showRatSelectGames(ctx); break;
            case "ФАЗА (изменить)": await adminManager.updatePhase(ctx); break;
            case "ФАЗА (показать)": await adminManager.showPhase(ctx); break;
            case "ПРАВИЛА КРЫСОЛОВОВ": await voteManager.viewerRules(ctx); break;
            case "НАСТРОЙКИ БОКОВОЙ": await playerManager.settingCamera(ctx); break;
        }
    }

    private getCommandsFor(
        type: UserType,
        nickname: string,
        phase: Phase,
        stage: StageType,
        teams: List<Team>
    ): List<string> {
        const isCaptain = teams.some(team => team.captain === nickname);

        return List(
            Object.entries(BotCommandAccess)
                .filter(([_, [types, cmdPhase]]) => {
                    const allowedType = types.includes(type) || types.includes(UserType.All);
                    const allowedPhase = cmdPhase === Phase.DEFAULT || cmdPhase === phase;
                    const blockedByStage = cmdPhase === Phase.TOUR_REGISTRATION &&
                        stage === StageType.SHOW_MATCH &&
                        !isCaptain;

                    return allowedType && allowedPhase && !blockedByStage;
                })
                .map(([command]) => command)
        );
    }
}
