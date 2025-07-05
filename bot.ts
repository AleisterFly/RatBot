import {Context} from "telegraf";
import {
    bot,
    userManager,
    adminManager,
    viewerManager,
    dbManager,
    seriesDB, voteManager, userRepository, playerManager, seriesRepository, viewerDB, teamDB
} from "./di/ratProvider";
import {List} from "immutable";



bot.command("show_commands", userManager.onShowCommands.bind(userManager));

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
bot.command('betting_registration', (ctx) => viewerManager.onRegister(ctx));
bot.command('guess_rat', (ctx) => voteManager.guessRatVote(ctx));
bot.command('guess_rat_tour', (ctx) => voteManager.guessRatTourVote(ctx));

//PLAYER
bot.command("reg_seria", playerManager.registerToSeria.bind(playerManager));
bot.command("show_reg_seria", playerManager.getRegisterSeries.bind(playerManager));
bot.command("cancel_reg_seria", playerManager.cancelRegistrationToSeria.bind(playerManager));

//ADMIN
bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));
bot.command("select_player", adminManager.onSelectPlayer.bind(adminManager));
bot.command("update_current", adminManager.updateCurrentSeria.bind(adminManager));
bot.command("get_current", adminManager.sendCurrentSeria.bind(adminManager));

//SUPER ADMIN
bot.command("show_players_SUPER", adminManager.onSuperShowPlayers.bind(adminManager));
// bot.command("create_team", adminManager.sendCurrentSeria.bind(adminManager));

//TEST
bot.command("unreg", userManager.onUnreg.bind(userManager));


async function botTextHandler(ctx: Context) {
    ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");
seriesDB.createTables();
viewerDB.createTables();
teamDB.createTables()
dbManager.createTables();
userRepository.saveUnregUsers();
seriesDB.initSeries();

// TODO: Приветствие
async function onStart(ctx: Context) {
    ctx.reply("Добро пожаловать!");
}
