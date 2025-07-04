import {UserType} from "./userType";

enum BotCommand {
    START = 'start',
    REGISTER = 'register',
    BETTING_REGISTRATION = 'betting_registration',
    GUESS_RAT = 'guess_rat',
    REG_SERIA = 'reg_seria',
    SHOW_REG_SERIA = 'show_reg_seria',
    CANCEL_REG_SERIA = 'cancel_reg_seria',
    SHOW_COMMANDS = 'show_commands',
    SHOW_PLAYERS = 'show_players',
    SELECT_PLAYER = 'select_player',
    UPDATE_CURRENT = 'update_current',
    GET_CURRENT = 'get_current'
}

export const BotCommandAccess: Record<BotCommand, UserType[]> = {
    [BotCommand.SHOW_COMMANDS]: [UserType.All],
    [BotCommand.START]: [UserType.All],
    [BotCommand.REGISTER]: [UserType.UnregPlayer, UserType.Viewer],
    [BotCommand.BETTING_REGISTRATION]: [UserType.Viewer],
    [BotCommand.GUESS_RAT]: [UserType.Viewer],
    [BotCommand.REG_SERIA]: [UserType.Player, UserType.Rat],
    [BotCommand.SHOW_REG_SERIA]: [UserType.Player, UserType.Rat],
    [BotCommand.CANCEL_REG_SERIA]: [UserType.Player, UserType.Rat],

    [BotCommand.SHOW_PLAYERS]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.SELECT_PLAYER]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.UPDATE_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.GET_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
}
