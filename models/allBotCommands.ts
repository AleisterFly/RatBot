import {UserType} from "./userType";
import {adminManager} from "../di/ratProvider";

enum BotCommand {
    START = 'start',
    REGISTER = 'РЕГИСТРАЦИЯ ИГРОКА',
    BETTING_REGISTRATION = 'РЕГИСТРАЦИЯ В КОНКУРСЕ',
    GUESS_RAT = 'УГАДАТЬ КРЫС В СЕРИИ',
    GUESS_RAT_TOUR = 'УГАДАТЬ КРЫС В ТУРЕ',
    REG_SERIA = 'ЗАПИСАТЬСЯ НА СЕРИЮ',
    SHOW_REG_SERIA = 'ПОКАЗАТЬ РЕГ СЕРИЮ',
    CANCEL_REG_SERIA = 'ОТМЕНИТЬ РЕГ СЕРИЮ',
    SHOW_COMMANDS = 'ПОКАЗАТЬ КОМАНДЫ',
    SHOW_PLAYERS = 'ПОКАЗАТЬ ИГРОКОВ',
    SHOW_PLAYERS_SUPER = '(супер) ПОКАЗАТЬ ИГРОКОВ',
    SELECT_PLAYER = 'КРЫСА / УДАЛИТЬ',
    UPDATE_CURRENT = 'ЗАДАТЬ ТЕКУЩУЮ СЕРИЮ',
    GET_CURRENT = 'ПОКАЗАТЬ ТЕКУЩУЮ СЕРИЮ',
    ADD_TEAM = 'ДОБАВИТЬ КОМАНДУ',
    ADD_PLAYER_TO_SERIA = 'ИГРОК В СЕРИЮ',
    PLAYER_VOTING = 'ГОЛОСОВАНИЕ',
    SHOW_VOTING = 'ПОКАЗАТь ГОЛОСОВАНИЕ',
    RAT_SELECT_GAMES = 'ВЫБРАТЬ КРЫСОИГРЫ',
    RAT_DONE_TASK = 'ЗАДАНИЕ ВЫПОЛНЕНО!',
    SHOW_RATS_DONE_TASK = 'ВЫПОЛНЕННЫЕ КРЫСОЗАДАНИЯ',
    SHOW_RATS_SELECT_GAMES = 'КРЫСО-ИГРЫ',
    ADD_PLAYER_TO_TEAM = 'ИГРОК В КОМАНДУ',

    //TEST
    UNREG = 'unreg',

    MAKE_ALL_PLAYER = 'make_all_player',
}

export const BotCommandAccess: Record<BotCommand, UserType[]> = {
    [BotCommand.SHOW_COMMANDS]: [UserType.All],
    [BotCommand.START]: [UserType.All],
    [BotCommand.REGISTER]: [UserType.UnregPlayer, UserType.Viewer],
    [BotCommand.BETTING_REGISTRATION]: [UserType.Viewer],
    [BotCommand.GUESS_RAT]: [UserType.Viewer],
    [BotCommand.GUESS_RAT_TOUR]: [UserType.Viewer],
    [BotCommand.REG_SERIA]: [UserType.Player, UserType.Rat],
    [BotCommand.SHOW_REG_SERIA]: [UserType.Player, UserType.Rat],
    [BotCommand.CANCEL_REG_SERIA]: [UserType.Player, UserType.Rat],
    [BotCommand.PLAYER_VOTING]: [UserType.Player, UserType.Rat],

    [BotCommand.RAT_SELECT_GAMES]: [UserType.Rat],
    [BotCommand.RAT_DONE_TASK]: [UserType.Rat],

    [BotCommand.SHOW_VOTING]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.SHOW_PLAYERS]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.SELECT_PLAYER]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.UPDATE_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.GET_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_TEAM]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_PLAYER_TO_TEAM]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_PLAYER_TO_SERIA]: [UserType.Admin, UserType.SuperAdmin],

    [BotCommand.SHOW_PLAYERS_SUPER]: [UserType.SuperAdmin],
    [BotCommand.SHOW_RATS_DONE_TASK]: [UserType.SuperAdmin],
    [BotCommand.SHOW_RATS_SELECT_GAMES]: [UserType.SuperAdmin],

    //TEST
    [BotCommand.UNREG]: [UserType.All],
    [BotCommand.MAKE_ALL_PLAYER]: [UserType.All],
}
