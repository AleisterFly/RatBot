import {UserType} from "./userType";
import {Phase} from "./admin/phase";

export enum BotCommand {
    SEND_MESSAGE = "СООБЩЕНИЯ",
    GUESS_RAT = 'УГАДАТЬ КРЫС В СЕРИИ',
    GUESS_RAT_TOUR = 'УГАДАТЬ КРЫС В ТУРЕ',
    REG_SERIA = 'ЗАПИСАТЬСЯ НА СЕРИЮ',
    SHOW_REG_SERIA = 'ПОКАЗАТЬ РЕГ СЕРИЮ',
    CANCEL_REG_SERIA = 'ОТМЕНИТЬ РЕГ СЕРИЮ',
    SHOW_PLAYERS = 'ПОКАЗАТЬ ИГРОКОВ',
    SHOW_PLAYERS_SUPER = 'ПОКАЗАТЬ ИГРОКОВ (супер)',
    SELECT_PLAYER = 'КРЫСА / ЗАГОЛОСОВАТЬ',
    UPDATE_CURRENT = 'ТЕКУЩАЯ СЕРИЯ (задать)',
    GET_CURRENT = 'ТЕКУЩАЯ СЕРИЯ (показать)',
    ADD_TEAM = 'ДОБАВИТЬ КОМАНДЫ',
    DEFINE_CAPTAIN = "НАЗНАЧИТЬ КАПИТАНА",
    ADD_PLAYER_TO_SERIA = 'ИГРОК В СЕРИЮ',
    FINAL_PLAYER_VOTING = 'ГОЛОСОВАНИЕ (финал)',
    PLAYER_VOTING = 'ГОЛОСОВАНИЕ',
    SHOW_VOTING = 'ПОКАЗАТЬ ГОЛОСОВАНИЕ',
    RAT_SELECT_GAMES = 'ВЫБРАТЬ КРЫСОИГРЫ',
    RAT_DONE_TASK = 'ЗАДАНИЕ ВЫПОЛНЕНО!',
    SHOW_RATS_DONE_TASK = 'КРЫСОЗАДАНИЯ (выполненные)',
    SHOW_RATS_SELECT_GAMES = 'КРЫСО-ИГРЫ',
    ADD_PLAYER_TO_TEAM = 'ИГРОК В КОМАНДУ',
    SET_PHASE = 'ФАЗА (изменить)',
    SHOW_PHASE = 'ФАЗА (показать)',
    VIEWER_RULES = 'ПРАВИЛА КРЫСОЛОВОВ',
    SETTING_CAMERA = 'НАСТРОЙКИ БОКОВОЙ',
    SET_BONUS_RAT_GAMES = 'КРЫСО ИГРЫ (бонус)',
    SEND_TASK_TO_RAT = 'КРЫСА (отправить задание)',
    REPORT_GRAF = 'Жалоба на Графа',

}


export const BotCommandAccess: Record<BotCommand, [UserType[], Phase]> = {
    [BotCommand.SEND_MESSAGE]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],

    [BotCommand.GUESS_RAT]: [[UserType.Viewer], Phase.RAT_SERIA_VOTING],
    [BotCommand.GUESS_RAT_TOUR]: [[UserType.Viewer], Phase.TEAM_VOTING],
    [BotCommand.VIEWER_RULES]: [[UserType.Viewer], Phase.DEFAULT],

    [BotCommand.REG_SERIA]: [[UserType.Player, UserType.Rat], Phase.TOUR_REGISTRATION],
    [BotCommand.SETTING_CAMERA]: [[UserType.Player, UserType.Rat], Phase.DEFAULT],
    [BotCommand.SHOW_REG_SERIA]: [[UserType.Player, UserType.Rat], Phase.TOUR_REGISTRATION],
    [BotCommand.CANCEL_REG_SERIA]: [[UserType.Player, UserType.Rat], Phase.TOUR_REGISTRATION],

    [BotCommand.PLAYER_VOTING]: [[UserType.Player, UserType.Rat], Phase.TEAM_VOTING],
    [BotCommand.FINAL_PLAYER_VOTING]: [[UserType.Player, UserType.Rat], Phase.FINAL_TEAM_VOTING],
    [BotCommand.REPORT_GRAF]: [[UserType.Player, UserType.Rat], Phase.DEFAULT],

    [BotCommand.RAT_SELECT_GAMES]: [[UserType.Rat], Phase.TOUR_REGISTRATION],
    [BotCommand.RAT_DONE_TASK]: [[UserType.Rat], Phase.DEFAULT],

    [BotCommand.SHOW_VOTING]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SHOW_PLAYERS]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],

    [BotCommand.UPDATE_CURRENT]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.GET_CURRENT]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.ADD_TEAM]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.DEFINE_CAPTAIN]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.ADD_PLAYER_TO_TEAM]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.ADD_PLAYER_TO_SERIA]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SET_PHASE]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SHOW_PHASE]: [[UserType.Admin, UserType.SuperAdmin], Phase.DEFAULT],

    [BotCommand.SHOW_PLAYERS_SUPER]: [[UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SHOW_RATS_DONE_TASK]: [[UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SHOW_RATS_SELECT_GAMES]: [[UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SELECT_PLAYER]: [[UserType.SuperAdmin], Phase.DEFAULT],
    [BotCommand.SET_BONUS_RAT_GAMES]: [[UserType.SuperAdmin], Phase.DEFAULT],

    [BotCommand.SEND_TASK_TO_RAT]: [[UserType.SuperAdmin], Phase.DEFAULT],
}
