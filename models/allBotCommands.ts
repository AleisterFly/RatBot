import {UserType} from "./userType";

enum BotCommand {
    START = 'start',
    REGISTER = 'register',
    BETTING_REGISTRATION = 'betting_registration',
    GUESS_RAT = 'guess_rat',
    GUESS_RAT_TOUR = 'guess_rat_tour',
    REG_SERIA = 'reg_seria',
    SHOW_REG_SERIA = 'show_reg_seria',
    CANCEL_REG_SERIA = 'cancel_reg_seria',
    SHOW_COMMANDS = 'show_commands',
    SHOW_PLAYERS = 'show_players',
    SHOW_PLAYERS_SUPER = 'show_players_super',
    SELECT_PLAYER = 'select_player',
    UPDATE_CURRENT = 'update_current',
    GET_CURRENT = 'get_current',
    ADD_TEAM = 'add_team',
    ADD_PLAYER_TO_SERIA = 'add_player_to_seria',
    PLAYER_VOTING = 'player_voting',
    SHOW_VOTING = 'show_players_voting',

    //TEST
    UNREG = 'unreg',
    ADD_PLAYER_TO_TEAM = 'add_player_to_team',
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

    [BotCommand.SHOW_VOTING]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.SHOW_PLAYERS]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.SELECT_PLAYER]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.UPDATE_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.GET_CURRENT]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_TEAM]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_PLAYER_TO_TEAM]: [UserType.Admin, UserType.SuperAdmin],
    [BotCommand.ADD_PLAYER_TO_SERIA]: [UserType.Player, UserType.Rat],

    [BotCommand.SHOW_PLAYERS_SUPER]: [UserType.SuperAdmin],

    //TEST
    [BotCommand.UNREG]: [UserType.All],
    [BotCommand.MAKE_ALL_PLAYER]: [UserType.All],
}
