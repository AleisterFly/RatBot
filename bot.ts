import {Context} from "telegraf";
import {
    bot,
    userManager,
    commandManager,
    dbManager,
    seriesDB, userRepository, viewerDB, teamDB, phaseDB, viewerManager, messageCommandManager, adminManager
} from "./di/ratProvider";
import {message} from "telegraf/filters";



bot.command("show_commands", commandManager.onShowCommands.bind(commandManager));

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
// bot.command('betting_registration', (ctx) => viewerManager.onRegister(ctx));
// bot.command('guess_rat', (ctx) => voteManager.guessRatVote(ctx));
// bot.command('guess_rat_tour', (ctx) => voteManager.guessRatTourVote(ctx));
//
// //PLAYER
// bot.command("reg_seria", playerManager.registerToSeria.bind(playerManager));
// bot.command("show_reg_seria", playerManager.getRegisterSeries.bind(playerManager));
// bot.command("cancel_reg_seria", playerManager.cancelRegistrationToSeria.bind(playerManager));
//
// //ADMIN
// bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));
// bot.command("select_player", adminManager.onSelectPlayer.bind(adminManager));
// bot.command("update_current", adminManager.updateCurrentSeria.bind(adminManager));
// bot.command("get_current", adminManager.sendCurrentSeria.bind(adminManager));
//
// //SUPER ADMIN
// bot.command("show_players_SUPER", adminManager.onSuperShowPlayers.bind(adminManager));
// // bot.command("create_team", adminManager.sendCurrentSeria.bind(adminManager));
//
// //TEST
// bot.command("unreg", userManager.onUnreg.bind(userManager));


async function botTextHandler(ctx: Context) {
    ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");
seriesDB.createTables();
viewerDB.createTables();
teamDB.createTables();
phaseDB.createTables();
dbManager.createTables();
userRepository.saveUnregUsers();
userRepository.saveAdmins()
seriesDB.initSeries();

bot.on(message("text"), async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (viewerManager.isInSession(chatId)) {
        await viewerManager.handleText(ctx);
        return;
    }

    if (messageCommandManager.isInSession(chatId)) {
        await messageCommandManager.handleText(ctx);
        return;
    }

    if (adminManager.isInAddTeamSession(chatId)) {
        await adminManager.handleText(ctx);
        return;
    }
});

// TODO: Приветствие
async function onStart(ctx: Context) {
    await ctx.reply("Добро пожаловать!");
}
